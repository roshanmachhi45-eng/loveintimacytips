import { useCallback, useEffect, useRef, useState } from 'react';
import { PALETTES, type ColorPalette } from './palettes';
import type { MagicEyeConfig } from './types';

interface StereogramCanvasProps {
  config: MagicEyeConfig;
  paletteIndex: number;
  generateKey: number;
  onCanvasReady?: (dataUrl: string) => void;
}

const CANVAS_W = 400;
const CANVAS_H = 600;

/*
 * Beginner-friendly SIRDS settings.
 *
 * FAR_SEPARATION = normal background spacing
 * NEAR_SEPARATION = strongest face depth spacing
 *
 * The larger difference between these values makes
 * the hidden face much easier to perceive.
 */
const FAR_SEPARATION = 84;
const NEAR_SEPARATION = 42;
const DEPTH_RANGE = FAR_SEPARATION - NEAR_SEPARATION;

/*
 * The face is intentionally large.
 * A larger hidden object is easier for first-time
 * Magic Eye users to lock onto.
 */
const FACE_CX = 200;
const FACE_CY = 292;

/* -----------------------------
   Utility functions
----------------------------- */

function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function smoothStep(value: number) {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
}

function ellipseValue(
  x: number,
  y: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
) {
  const dx = (x - cx) / rx;
  const dy = (y - cy) / ry;

  return dx * dx + dy * dy;
}

/*
 * Deterministic pseudo-random generator.
 * This keeps the generated stereogram stable for the
 * same configuration instead of changing depth randomly.
 */
function createSeededRandom(seed: number) {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;

    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* -----------------------------
   Union-Find / equivalence class
----------------------------- */

class DisjointSet {
  parent: Int32Array;
  rank: Uint8Array;

  constructor(size: number) {
    this.parent = new Int32Array(size);
    this.rank = new Uint8Array(size);

    for (let i = 0; i < size; i += 1) {
      this.parent[i] = i;
    }
  }

  find(value: number) {
    let root = value;

    while (this.parent[root] !== root) {
      root = this.parent[root];
    }

    while (this.parent[value] !== value) {
      const next = this.parent[value];
      this.parent[value] = root;
      value = next;
    }

    return root;
  }

  union(a: number, b: number) {
    let rootA = this.find(a);
    let rootB = this.find(b);

    if (rootA === rootB) return;

    if (this.rank[rootA] < this.rank[rootB]) {
      const temp = rootA;
      rootA = rootB;
      rootB = temp;
    }

    this.parent[rootB] = rootA;

    if (this.rank[rootA] === this.rank[rootB]) {
      this.rank[rootA] += 1;
    }
  }
}

/* -----------------------------
   Palette helpers
----------------------------- */

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '');

  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

/* -----------------------------
   Main component
----------------------------- */

export default function StereogramCanvas({
  config,
  paletteIndex,
  generateKey,
  onCanvasReady,
}: StereogramCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendering, setRendering] = useState(false);

  const render = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const palette: ColorPalette =
      PALETTES[paletteIndex % PALETTES.length];

    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;

    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    setRendering(true);

    /*
     * ------------------------------------------
     * SAFE CONFIG NORMALIZATION
     * ------------------------------------------
     */

    const gender = config.gender;

    const faceTone = config.faceTone;

    const faceStructure = config.faceStructure;

    const hairStyle = config.hairStyle;

    const beardStyle = config.beardStyle;

    const name = config.name.trim();

    /*
     * ------------------------------------------
     * FACE GEOMETRY
     * ------------------------------------------
     */

    let faceRx = 128;
    let faceRy = 174;

    if (faceStructure === 'round') {
      faceRx = 136;
      faceRy = 160;
    }

    if (faceStructure === 'square') {
      faceRx = 137;
      faceRy = 170;
    }

    /*
     * ------------------------------------------
     * NAME MASK
     * ------------------------------------------
     *
     * Name is embedded into depth, NOT painted
     * as visible text over the stereogram.
     */

    const nameCanvas = document.createElement('canvas');

    nameCanvas.width = CANVAS_W;
    nameCanvas.height = CANVAS_H;

    const nameCtx = nameCanvas.getContext('2d');

    if (nameCtx && name) {
      nameCtx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      nameCtx.fillStyle = '#ffffff';

      nameCtx.font =
        '700 24px Arial, Helvetica, sans-serif';

      nameCtx.textAlign = 'center';
      nameCtx.textBaseline = 'middle';

      nameCtx.fillText(
        name.slice(0, 18),
        CANVAS_W / 2,
        CANVAS_H - 55,
      );
    }

    const namePixels =
      nameCtx?.getImageData(
        0,
        0,
        CANVAS_W,
        CANVAS_H,
      ).data ?? null;

    /*
     * ------------------------------------------
     * DEPTH MAP
     * ------------------------------------------
     *
     * This is the most important part.
     *
     * Background = low depth
     * Face = medium depth
     * Nose / lips / center features = high depth
     *
     * Strong separation is intentionally used so
     * beginners can perceive the face more easily.
     */

    const getDepth = (x: number, y: number) => {
      let depth = 0.035;

      const dx = (x - FACE_CX) / faceRx;
      const dy = (y - FACE_CY) / faceRy;

      const distance = Math.sqrt(
        dx * dx + dy * dy,
      );

      /*
       * Main face volume
       */
      if (distance < 1) {
        const normalized =
          clamp(1 - distance);

        const faceVolume =
          0.40 +
          smoothStep(normalized) * 0.30;

        depth = Math.max(depth, faceVolume);
      }

      /*
       * ----------------------------------------
       * FACE OUTER CONTOUR
       * ----------------------------------------
       */

      const contourDistance =
        Math.abs(distance - 0.94);

      if (contourDistance < 0.10) {
        const contourStrength =
          1 -
          contourDistance / 0.10;

        depth = Math.max(
          depth,
          0.48 +
            smoothStep(contourStrength) * 0.15,
        );
      }

      /*
       * ----------------------------------------
       * FOREHEAD
       * ----------------------------------------
       */

      const forehead = ellipseValue(
        x,
        y,
        FACE_CX,
        FACE_CY - 65,
        82,
        70,
      );

      if (forehead < 1) {
        depth = Math.max(
          depth,
          0.58 +
            (1 - forehead) * 0.10,
        );
      }

      /*
       * ----------------------------------------
       * CHEEKS
       * ----------------------------------------
       */

      const leftCheek = ellipseValue(
        x,
        y,
        FACE_CX - 53,
        FACE_CY + 20,
        54,
        65,
      );

      const rightCheek = ellipseValue(
        x,
        y,
        FACE_CX + 53,
        FACE_CY + 20,
        54,
        65,
      );

      if (leftCheek < 1) {
        depth = Math.max(
          depth,
          0.60 +
            (1 - leftCheek) * 0.12,
        );
      }

      if (rightCheek < 1) {
        depth = Math.max(
          depth,
          0.60 +
            (1 - rightCheek) * 0.12,
        );
      }

      /*
       * ----------------------------------------
       * EYE SOCKETS
       *
       * Slightly lower than cheeks.
       * This creates facial relief.
       * ----------------------------------------
       */

      const leftEye = ellipseValue(
        x,
        y,
        FACE_CX - 47,
        FACE_CY - 22,
        27,
        13,
      );

      const rightEye = ellipseValue(
        x,
        y,
        FACE_CX + 47,
        FACE_CY - 22,
        27,
        13,
      );

      if (leftEye < 1) {
        depth = Math.min(
          depth,
          0.47 +
            leftEye * 0.04,
        );
      }

      if (rightEye < 1) {
        depth = Math.min(
          depth,
          0.47 +
            rightEye * 0.04,
        );
      }

      /*
       * ----------------------------------------
       * EYEBROWS
       * ----------------------------------------
       */

      const leftBrow = ellipseValue(
        x,
        y,
        FACE_CX - 47,
        FACE_CY - 44,
        34,
        7,
      );

      const rightBrow = ellipseValue(
        x,
        y,
        FACE_CX + 47,
        FACE_CY - 44,
        34,
        7,
      );

      if (leftBrow < 1) {
        depth = Math.max(
          depth,
          0.68,
        );
      }

      if (rightBrow < 1) {
        depth = Math.max(
          depth,
          0.68,
        );
      }

      /*
       * ----------------------------------------
       * NOSE
       * ----------------------------------------
       *
       * Strongest facial protrusion.
       */

      const noseBridge = ellipseValue(
        x,
        y,
        FACE_CX,
        FACE_CY - 2,
        15,
        58,
      );

      if (noseBridge < 1) {
        depth = Math.max(
          depth,
          0.70 +
            (1 - noseBridge) * 0.20,
        );
      }

      const noseTip = ellipseValue(
        x,
        y,
        FACE_CX,
        FACE_CY + 30,
        25,
        18,
      );

      if (noseTip < 1) {
        depth = Math.max(
          depth,
          0.92 +
            (1 - noseTip) * 0.06,
        );
      }

      /*
       * ----------------------------------------
       * NOSE SIDES
       * ----------------------------------------
       */

      const leftNostril = ellipseValue(
        x,
        y,
        FACE_CX - 11,
        FACE_CY + 35,
        8,
        6,
      );

      const rightNostril = ellipseValue(
        x,
        y,
        FACE_CX + 11,
        FACE_CY + 35,
        8,
        6,
      );

      if (leftNostril < 1) {
        depth = Math.min(depth, 0.52);
      }

      if (rightNostril < 1) {
        depth = Math.min(depth, 0.52);
      }

      /*
       * ----------------------------------------
       * MOUTH AREA
       * ----------------------------------------
       */

      const mouthShadow = ellipseValue(
        x,
        y,
        FACE_CX,
        FACE_CY + 79,
        43,
        13,
      );

      if (mouthShadow < 1) {
        depth = Math.min(
          depth,
          0.52,
        );
      }

      const upperLip = ellipseValue(
        x,
        y,
        FACE_CX,
        FACE_CY + 70,
        34,
        8,
      );

      if (upperLip < 1) {
        depth = Math.max(
          depth,
          0.70,
        );
      }

      const lowerLip = ellipseValue(
        x,
        y,
        FACE_CX,
        FACE_CY + 87,
        32,
        10,
      );

      if (lowerLip < 1) {
        depth = Math.max(
          depth,
          0.74,
        );
      }

      /*
       * ----------------------------------------
       * CHIN
       * ----------------------------------------
       */

      const chin = ellipseValue(
        x,
        y,
        FACE_CX,
        FACE_CY + 125,
        57,
        38,
      );

      if (chin < 1) {
        depth = Math.max(
          depth,
          0.67 +
            (1 - chin) * 0.10,
        );
      }

      /*
       * ----------------------------------------
       * JAW
       * ----------------------------------------
       */

      if (gender === 'male') {
        const jawLeft = ellipseValue(
          x,
          y,
          FACE_CX - 82,
          FACE_CY + 72,
          43,
          80,
        );

        const jawRight = ellipseValue(
          x,
          y,
          FACE_CX + 82,
          FACE_CY + 72,
          43,
          80,
        );

        if (jawLeft < 1) {
          depth = Math.max(
            depth,
            0.62,
          );
        }

        if (jawRight < 1) {
          depth = Math.max(
            depth,
            0.62,
          );
        }
      } else {
        /*
         * Female jaw is intentionally softer.
         */
        const softJaw = ellipseValue(
          x,
          y,
          FACE_CX,
          FACE_CY + 75,
          112,
          108,
        );

        if (softJaw < 1) {
          depth = Math.max(
            depth,
            0.56 +
              (1 - softJaw) * 0.08,
          );
        }
      }

      /*
       * ----------------------------------------
       * HAIR
       * ----------------------------------------
       */

      if (hairStyle !== 'bald') {
        const hairTop = ellipseValue(
          x,
          y,
          FACE_CX,
          FACE_CY - 128,
          faceRx * 0.95,
          62,
        );

        const sideHairLeft =
          ellipseValue(
            x,
            y,
            FACE_CX - 112,
            FACE_CY - 30,
            30,
            130,
          );

        const sideHairRight =
          ellipseValue(
            x,
            y,
            FACE_CX + 112,
            FACE_CY - 30,
            30,
            130,
          );

        if (hairTop < 1) {
          if (hairStyle === 'curly') {
            const curlWave =
              Math.sin(x * 0.18) *
              Math.cos(y * 0.11);

            depth = Math.max(
              depth,
              0.57 +
                curlWave * 0.05,
            );
          } else {
            depth = Math.max(
              depth,
              0.60,
            );
          }
        }

        if (sideHairLeft < 1) {
          depth = Math.max(
            depth,
            0.54,
          );
        }

        if (sideHairRight < 1) {
          depth = Math.max(
            depth,
            0.54,
          );
        }
      }

      /*
       * ----------------------------------------
       * MALE BEARD
       * ----------------------------------------
       */

      if (gender === 'male') {
        if (beardStyle !== 'clean') {
          const beard = ellipseValue(
            x,
            y,
            FACE_CX,
            FACE_CY + 82,
            88,
            72,
          );

          if (beard < 1) {
            if (beardStyle === 'full') {
              depth = Math.max(
                depth,
                0.70,
              );
            } else if (beardStyle === 'short') {
              depth = Math.max(
                depth,
                0.64,
              );
            } else if (beardStyle === 'stubble') {
              depth = Math.max(
                depth,
                0.59,
              );
            }
          }
        }
      }

      /*
       * ----------------------------------------
       * FACE TONE
       *
       * Tone changes depth subtly so it
       * influences the final matrix without
       * destroying facial geometry.
       * ----------------------------------------
       */

      if (faceTone === 'fair') {
        depth *= 1.02;
      }

      if (faceTone === 'dark') {
        depth *= 0.98;
      }

      /*
       * ----------------------------------------
       * NAME DEPTH EMBEDDING
       * ----------------------------------------
       */

      if (namePixels) {
        const pixelIndex =
          (y * CANVAS_W + x) * 4;

        if (namePixels[pixelIndex + 3] > 40) {
          depth = Math.max(
            depth,
            0.66,
          );
        }
      }

      return clamp(depth);
    };

    /*
     * ------------------------------------------
     * BUILD RANDOM DOT SOURCE
     * ------------------------------------------
     *
     * We intentionally use 2x2-ish visual dot
     * grouping. This is easier for beginners to
     * fuse than extremely fine single-pixel noise.
     */

    const random = createSeededRandom(
      generateKey * 7919 +
        paletteIndex * 104729 +
        name.length * 313,
    );

    const sourcePattern =
      new Uint8ClampedArray(
        FAR_SEPARATION * CANVAS_H * 4,
      );

    const patternColors =
      palette.patternColors.length > 0
        ? palette.patternColors
        : ['#ffffff', '#d9f7f0', '#9cebd9'];

    for (
      let y = 0;
      y < CANVAS_H;
      y += 1
    ) {
      for (
        let x = 0;
        x < FAR_SEPARATION;
        x += 1
      ) {
        /*
         * Create slightly larger visual dots.
         */
        const blockX =
          Math.floor(x / 2);

        const blockY =
          Math.floor(y / 2);

        const localSeed =
          blockX * 92821 +
          blockY * 68917 +
          generateKey * 997;

        const localRandom =
          createSeededRandom(
            localSeed,
          )();

        const randomIndex =
          Math.floor(
            localRandom *
              patternColors.length,
          );

        const rgb = hexToRgb(
          patternColors[randomIndex],
        );

        const index =
          (y * FAR_SEPARATION + x) * 4;

        sourcePattern[index] = rgb.r;
        sourcePattern[index + 1] = rgb.g;
        sourcePattern[index + 2] = rgb.b;
        sourcePattern[index + 3] = 255;
      }
    }

    /*
     * ------------------------------------------
     * FINAL SIRDS IMAGE
     * ------------------------------------------
     */

    const finalImage =
      ctx.createImageData(
        CANVAS_W,
        CANVAS_H,
      );

    const output = finalImage.data;

    /*
     * Use a deterministic palette selection
     * for connected pixel groups.
     */
    const groupRandom =
      createSeededRandom(
        generateKey * 1777 +
          paletteIndex * 9283 +
          name.length * 31,
      );

    for (
      let y = 0;
      y < CANVAS_H;
      y += 1
    ) {
      const sets =
        new DisjointSet(CANVAS_W);

      /*
       * Build left/right pixel constraints.
       */
      for (
        let x = 0;
        x < CANVAS_W;
        x += 1
      ) {
        const depth =
          getDepth(x, y);

        /*
         * Strong depth-to-separation mapping.
         */
        const separation = Math.round(
          FAR_SEPARATION -
            depth * DEPTH_RANGE,
        );

        const half =
          Math.floor(separation / 2);

        const left =
          x - half;

        const right =
          x + separation - half;

        if (
          left < 0 ||
          right >= CANVAS_W ||
          left === right
        ) {
          continue;
        }

        /*
         * Prevent pathological over-linking.
         */
        const leftRoot =
          sets.find(left);

        const rightRoot =
          sets.find(right);

        if (leftRoot !== rightRoot) {
          sets.union(
            leftRoot,
            rightRoot,
          );
        }
      }

      /*
       * Give every equivalence group a random
       * source color.
       */
      const groupColors =
        new Map<
          number,
          { r: number; g: number; b: number }
        >();

      for (
        let x = 0;
        x < CANVAS_W;
        x += 1
      ) {
        const root =
          sets.find(x);

        if (!groupColors.has(root)) {
          const sourceX =
            Math.floor(
              groupRandom() *
                FAR_SEPARATION,
            );

          const sourceIndex =
            (y * FAR_SEPARATION +
              sourceX) *
            4;

          groupColors.set(root, {
            r: sourcePattern[
              sourceIndex
            ],
            g: sourcePattern[
              sourceIndex + 1
            ],
            b: sourcePattern[
              sourceIndex + 2
            ],
          });
        }

        const color =
          groupColors.get(root)!;

        const index =
          (y * CANVAS_W + x) * 4;

        output[index] = color.r;
        output[index + 1] = color.g;
        output[index + 2] = color.b;
        output[index + 3] = 255;
      }
    }

    /*
     * Put stereogram into canvas.
     */
    ctx.putImageData(
      finalImage,
      0,
      0,
    );

    /*
     * ------------------------------------------
     * SUBTLE EDGE VIGNETTE
     * ------------------------------------------
     *
     * This does not enter the stereogram data.
     * It only improves the visual frame.
     */

    const vignette =
      ctx.createRadialGradient(
        CANVAS_W / 2,
        CANVAS_H / 2,
        120,
        CANVAS_W / 2,
        CANVAS_H / 2,
        340,
      );

    vignette.addColorStop(
      0,
      'rgba(255,255,255,0)',
    );

    vignette.addColorStop(
      1,
      'rgba(0,0,0,0.08)',
    );

    ctx.fillStyle = vignette;
    ctx.fillRect(
      0,
      0,
      CANVAS_W,
      CANVAS_H,
    );

    /*
     * Save generated image for sharing.
     */
    const dataUrl =
      canvas.toDataURL(
        'image/png',
      );

    onCanvasReady?.(dataUrl);

    setRendering(false);
  }, [
    config,
    paletteIndex,
    generateKey,
    onCanvasReady,
  ]);

  useEffect(() => {
    if (generateKey <= 0) return;

    const frame =
      window.requestAnimationFrame(() => {
        render();
      });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [
    generateKey,
    render,
  ]);

  const palette =
    PALETTES[
      paletteIndex % PALETTES.length
    ];

  return (
    <div className="flex w-full flex-col items-center">
      {/* Beginner convergence guide */}
      <div className="mb-2 flex items-center justify-center gap-[72px]">
        <span
          className="h-3 w-3 rounded-full"
          style={{
            backgroundColor: '#ffffff',
            boxShadow: `0 0 10px ${palette.primary}`,
          }}
          aria-hidden="true"
        />

        <span
          className="h-3 w-3 rounded-full"
          style={{
            backgroundColor: '#ffffff',
            boxShadow: `0 0 10px ${palette.primary}`,
          }}
          aria-hidden="true"
        />
      </div>

      <p className="mb-3 max-w-[330px] text-center text-[11px] leading-relaxed text-slate-400">
        Look through the pattern — not directly at
        the dots. Relax your eyes and let the two
        points appear to merge.
      </p>

      <div
        className="relative mx-auto w-full max-w-[400px] overflow-hidden rounded-[1.5rem]"
        style={{
          boxShadow: `
            0 0 30px ${palette.primary}35,
            0 0 60px ${palette.secondary}18
          `,
          border:
            `2px solid ${palette.primary}25`,
        }}
      >
        <canvas
          ref={canvasRef}
          className="block h-auto w-full"
          style={{
            aspectRatio: '400 / 600',
          }}
        />

        {rendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
            <div
              className="h-9 w-9 animate-spin rounded-full border-2 border-white/30 border-t-white"
              aria-label="Generating stereogram"
            />
          </div>
        )}
      </div>

      <p
        className="mt-3 text-xs font-mono uppercase tracking-[0.22em]"
        style={{
          color: palette.primary,
        }}
      >
        {palette.name} Matrix Engine
      </p>
    </div>
  );
}


