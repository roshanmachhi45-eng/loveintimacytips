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
 * The carrier is intentionally fine and dense.
 * The reference-style look comes from repeating
 * geometric black/white marks rather than large blocks.
 */
const TILE_W = 84;
const EYE_SEPARATION = 84;
const MU = 0.42;
const MAX_DEPTH = 1;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const smoothStep = (edge0: number, edge1: number, value: number) => {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

const ellipse = (
  x: number,
  y: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number
) => {
  const dx = (x - cx) / rx;
  const dy = (y - cy) / ry;
  return dx * dx + dy * dy;
};

function carrierBit(x: number, y: number): number {
  /*
   * Fine repeating geometric carrier:
   * - diagonal lines
   * - small diamonds
   * - micro checker details
   *
   * No large square blocks.
   */
  const xx = ((x % TILE_W) + TILE_W) % TILE_W;
  const yy = ((y % 28) + 28) % 28;

  const diagonalA = ((xx + yy * 2) % 14) < 4;
  const diagonalB = ((xx * 2 - yy + 1000) % 17) < 4;

  const diamondX = Math.abs((xx % 18) - 9);
  const diamondY = Math.abs(yy - 14);
  const diamond = diamondX + diamondY < 8;

  const micro =
    (((xx >> 1) + (yy >> 1)) % 2 === 0) &&
    xx % 6 < 3 &&
    yy % 6 < 3;

  return diagonalA !== diagonalB
    ? 1
    : diamond
      ? 0
      : micro
        ? 1
        : 0;
}

function writeCarrierPixel(
  data: Uint8ClampedArray,
  index: number,
  bit: number
) {
  const value = bit ? 255 : 0;

  data[index] = value;
  data[index + 1] = value;
  data[index + 2] = value;
  data[index + 3] = 255;
}

/*
 * Creates a soft frontal face depth map.
 *
 * 0 = background/far
 * 1 = closest surface
 */
function createDepthFunction(config: MagicEyeConfig) {
  const cx = CANVAS_W / 2;
  const cy = CANVAS_H / 2 - 42;

  let rx = 70;
  let ry = 92;

  if (config.faceStructure === 'round') {
    rx = 78;
    ry = 82;
  } else if (config.faceStructure === 'square') {
    rx = 78;
    ry = 88;
  }

  return (x: number, y: number): number => {
    let depth = 0;

    const head = ellipse(x, y, cx, cy, rx, ry);

    if (head < 1) {
      const edge = 1 - smoothStep(0.72, 1.02, head);

      if (config.faceStructure === 'square') {
        const sx = Math.abs((x - cx) / rx);
        const sy = Math.abs((y - cy) / ry);
        const squareShape = 1 - Math.max(sx, sy);
        depth = clamp(squareShape, 0, 1) * 0.78;
      } else if (config.faceStructure === 'round') {
        depth = edge * 0.82;
      } else {
        depth = edge * 0.86;
      }

      /*
       * Forehead / cheeks.
       */
      const forehead = ellipse(x, y, cx, cy - 28, rx * 0.58, ry * 0.42);
      if (forehead < 1) {
        depth += (1 - forehead) * 0.10;
      }

      const leftCheek = ellipse(
        x,
        y,
        cx - 27,
        cy + 24,
        rx * 0.38,
        ry * 0.32
      );

      const rightCheek = ellipse(
        x,
        y,
        cx + 27,
        cy + 24,
        rx * 0.38,
        ry * 0.32
      );

      depth += Math.max(0, 1 - leftCheek) * 0.07;
      depth += Math.max(0, 1 - rightCheek) * 0.07;

      /*
       * Eyes.
       * These are depth structures, NOT visible painted eyes.
       */
      const eyeY = cy - 8;

      const leftEye = ellipse(
        x,
        y,
        cx - 28,
        eyeY,
        15,
        7
      );

      const rightEye = ellipse(
        x,
        y,
        cx + 28,
        eyeY,
        15,
        7
      );

      if (leftEye < 1) {
        depth += (1 - leftEye) * 0.055;
      }

      if (rightEye < 1) {
        depth += (1 - rightEye) * 0.055;
      }

      /*
       * Nose bridge and tip.
       */
      const noseBridge = ellipse(
        x,
        y,
        cx,
        cy + 8,
        9,
        30
      );

      if (noseBridge < 1) {
        depth += (1 - noseBridge) * 0.14;
      }

      const noseTip = ellipse(
        x,
        y,
        cx,
        cy + 31,
        13,
        9
      );

      if (noseTip < 1) {
        depth += (1 - noseTip) * 0.16;
      }

      /*
       * Mouth.
       */
      const mouth = ellipse(
        x,
        y,
        cx,
        cy + 55,
        25,
        7
      );

      if (mouth < 1) {
        depth += (1 - mouth) * 0.075;
      }

      /*
       * Chin.
       */
      const chin = ellipse(
        x,
        y,
        cx,
        cy + 68,
        28,
        17
      );

      if (chin < 1) {
        depth += (1 - chin) * 0.075;
      }

      /*
       * Male beard depth.
       */
      if (config.gender === 'male' && config.beardStyle !== 'clean') {
        const beard = ellipse(
          x,
          y,
          cx,
          cy + 47,
          rx * 0.67,
          ry * 0.40
        );

        if (beard < 1) {
          if (config.beardStyle === 'stubble') {
            depth += (1 - beard) * 0.055;
          } else if (config.beardStyle === 'short') {
            depth += (1 - beard) * 0.09;
          } else if (config.beardStyle === 'full') {
            depth += (1 - beard) * 0.13;
          }
        }
      }
    }

    /*
     * Hair creates a separate depth layer around the upper head.
     */
    if (config.hairStyle !== 'bald') {
      const hairTop = ellipse(
        x,
        y,
        cx,
        cy - 62,
        rx * 1.02,
        ry * 0.55
      );

      if (hairTop < 1) {
        if (config.hairStyle === 'straight') {
          depth = Math.max(
            depth,
            (1 - hairTop) * 0.66
          );
        } else {
          /*
           * Curly hair gets a fine undulating depth edge.
           */
          const wave =
            Math.sin(x * 0.27) *
              Math.cos(y * 0.19) *
              0.08 +
            0.08;

          depth = Math.max(
            depth,
            (1 - hairTop) * 0.58 + wave
          );
        }
      }

      /*
       * Side hair.
       */
      const sideLeft = ellipse(
        x,
        y,
        cx - rx * 0.83,
        cy - 3,
        rx * 0.28,
        ry * 0.78
      );

      const sideRight = ellipse(
        x,
        y,
        cx + rx * 0.83,
        cy - 3,
        rx * 0.28,
        ry * 0.78
      );

      if (sideLeft < 1) {
        depth = Math.max(depth, (1 - sideLeft) * 0.42);
      }

      if (sideRight < 1) {
        depth = Math.max(depth, (1 - sideRight) * 0.42);
      }
    }

    /*
     * Face tone subtly changes depth character,
     * while the actual stereogram remains pure B/W.
     */
    if (config.faceTone === 'fair') {
      depth *= 0.98;
    } else if (config.faceTone === 'dark') {
      depth *= 1.04;
    }

    return clamp(depth, 0, MAX_DEPTH);
  };
}

/*
 * Standard stereogram separation equation.
 *
 * Far objects use approximately E/2.
 * Nearer objects have a smaller separation.
 */
function calculateSeparation(depth: number) {
  const z = clamp(depth, 0, 1);

  const separation =
    (EYE_SEPARATION * (1 - MU * z)) /
    (2 - MU * z);

  return Math.max(8, Math.round(separation));
}

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

    setRendering(true);

    try {
      /*
       * Keep palette lookup so the existing component API
       * remains compatible, but the stereogram itself is
       * intentionally pure black and white like the reference.
       */
      const palette: ColorPalette =
        PALETTES[paletteIndex % PALETTES.length];

      void palette;

      canvas.width = CANVAS_W;
      canvas.height = CANVAS_H;

      const ctx = canvas.getContext('2d', {
        alpha: false,
      });

      if (!ctx) {
        setRendering(false);
        return;
      }

      const depthAt = createDepthFunction(config);

      const output = ctx.createImageData(
        CANVAS_W,
        CANVAS_H
      );

      const out = output.data;

      /*
       * Generate each row independently.
       *
       * Equivalence classes are built with union-find.
       * This is much more reliable than simply copying
       * from "same[x]" once, which caused the large broken
       * block artifacts in the previous version.
       */
      for (let y = 0; y < CANVAS_H; y++) {
        const parent = new Int32Array(CANVAS_W);

        for (let x = 0; x < CANVAS_W; x++) {
          parent[x] = x;
        }

        const find = (value: number): number => {
          let root = value;

          while (
            parent[root] !== root &&
            root >= 0 &&
            root < CANVAS_W
          ) {
            root = parent[root];
          }

          while (
            value >= 0 &&
            value < CANVAS_W &&
            parent[value] !== value
          ) {
            const next = parent[value];
            parent[value] = root;
            value = next;
          }

          return root;
        };

        const unite = (a: number, b: number) => {
          if (
            a < 0 ||
            b < 0 ||
            a >= CANVAS_W ||
            b >= CANVAS_W
          ) {
            return;
          }

          const ra = find(a);
          const rb = find(b);

          if (ra !== rb) {
            /*
             * Always keep the smaller x as root.
             * This makes source selection deterministic.
             */
            if (ra < rb) {
              parent[rb] = ra;
            } else {
              parent[ra] = rb;
            }
          }
        };

        /*
         * Build depth constraints.
         *
         * We process the row from far → near so the
         * deeper facial surfaces can establish the
         * repeating correspondence before the closer
         * features refine it.
         */
        const positions = new Array<number>(CANVAS_W);

        for (let x = 0; x < CANVAS_W; x++) {
          positions[x] = x;
        }

        positions.sort(
          (a, b) =>
            depthAt(a, y) - depthAt(b, y)
        );

        for (let i = 0; i < positions.length; i++) {
          const x = positions[i];

          const depth = depthAt(x, y);
          const separation =
            calculateSeparation(depth);

          const half = Math.floor(
            separation / 2
          );

          const left = x - half;
          const right = left + separation;

          if (
            left >= 0 &&
            right < CANVAS_W
          ) {
            /*
             * Avoid excessive constraints in the
             * completely flat background.
             */
            if (depth > 0.025) {
              unite(left, right);
            }
          }
        }

        /*
         * Convert equivalence classes into the final
         * black/white image.
         */
        for (let x = 0; x < CANVAS_W; x++) {
          const root = find(x);

          /*
           * Use the root position inside the repeating
           * fine carrier. This keeps the pattern coherent
           * across the entire image.
           */
          const sourceX =
            ((root % TILE_W) + TILE_W) % TILE_W;

          const bit = carrierBit(
            sourceX,
            y
          );

          const index =
            (y * CANVAS_W + x) * 4;

          writeCarrierPixel(
            out,
            index,
            bit
          );
        }
      }

      /*
       * Add a very subtle vertical carrier variation
       * only where the pattern is completely flat.
       *
       * This prevents large areas from visually collapsing
       * into a single solid tone while keeping the hidden
       * face intact.
       */
      for (let y = 0; y < CANVAS_H; y++) {
        for (let x = 0; x < CANVAS_W; x++) {
          const depth = depthAt(x, y);

          if (depth < 0.01) {
            const index =
              (y * CANVAS_W + x) * 4;

            /*
             * Do not repaint the whole image.
             * Only reinforce tiny carrier details.
             */
            if (
              ((x + y * 3) % 37) === 0
            ) {
              const current =
                out[index];

              const next =
                current > 127 ? 0 : 255;

              out[index] = next;
              out[index + 1] = next;
              out[index + 2] = next;
            }
          }
        }
      }

      ctx.putImageData(output, 0, 0);

      const dataUrl =
        canvas.toDataURL('image/png');

      onCanvasReady?.(dataUrl);
    } catch (error) {
      console.error(
        'Love Magic Eye generation failed:',
        error
      );
    } finally {
      setRendering(false);
    }
  }, [
    config,
    paletteIndex,
    onCanvasReady,
  ]);

  useEffect(() => {
    if (generateKey > 0) {
      render();
    }
  }, [generateKey, render]);

  const palette =
    PALETTES[
      paletteIndex % PALETTES.length
    ];

  return (
    <div className="flex flex-col items-center w-full">
      <div
        id="magic-eye-canvas"
        className="relative w-full max-w-[400px] mx-auto"
        style={{
          boxShadow: `0 0 30px ${palette.primary}40, 0 0 60px ${palette.secondary}20`,
          borderRadius: '1.5rem',
          overflow: 'hidden',
          border: `2px solid ${palette.primary}30`,
          background: '#000',
        }}
      >
        <canvas
          ref={canvasRef}
          className="block w-full h-auto"
          style={{
            aspectRatio: '400 / 600',
          }}
        />

        {rendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="h-8 w-8 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          </div>
        )}
      </div>

      <p
        className="mt-2 text-xs font-mono uppercase tracking-widest"
        style={{
          color: palette.primary,
        }}
      >
        Magic Eye Stereogram
      </p>
    </div>
  );
}
