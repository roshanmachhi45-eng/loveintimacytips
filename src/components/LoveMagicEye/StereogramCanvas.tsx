import { useCallback, useEffect, useRef, useState } from 'react';
import { PALETTES } from './palettes';
import type { MagicEyeConfig } from './types';

interface StereogramCanvasProps {
  config: MagicEyeConfig;
  paletteIndex: number;
  generateKey: number;
  onCanvasReady?: (dataUrl: string) => void;
}

const WIDTH = 400;
const HEIGHT = 600;

/*
 * Fine carrier.
 * Smaller values = finer repeating pattern.
 */
const TILE_WIDTH = 64;
const CARRIER_CELL = 4;

/*
 * Stereogram parameters.
 *
 * Larger EYE_SEPARATION and stronger DEPTH_STRENGTH
 * make the hidden face easier to perceive.
 */
const EYE_SEPARATION = 96;
const MU = 0.62;
const DEPTH_STRENGTH = 1.65;

/* -------------------------------------------------- */
/* Utility                                             */
/* -------------------------------------------------- */

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function smoothstep(a: number, b: number, value: number) {
  const t = clamp((value - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

function ellipse(
  x: number,
  y: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number
) {
  const dx = (x - cx) / rx;
  const dy = (y - cy) / ry;
  return dx * dx + dy * dy;
}

function roundedBox(
  x: number,
  y: number,
  cx: number,
  cy: number,
  halfW: number,
  halfH: number,
  radius: number
) {
  const dx = Math.abs(x - cx) - halfW + radius;
  const dy = Math.abs(y - cy) - halfH + radius;

  const ax = Math.max(dx, 0);
  const ay = Math.max(dy, 0);

  return Math.sqrt(ax * ax + ay * ay) +
    Math.min(Math.max(dx, dy), 0) -
    radius;
}

/* -------------------------------------------------- */
/* Carrier                                             */
/* -------------------------------------------------- */

/*
 * Dense geometric black/white carrier.
 *
 * The important difference from the previous version:
 * there are NO large square blocks.
 *
 * The pattern is made from:
 * - tiny diamonds
 * - diagonal strokes
 * - micro checker details
 * - repeating zig-zag geometry
 */
function carrier(x: number, y: number) {
  const px =
    ((x % TILE_WIDTH) + TILE_WIDTH) %
    TILE_WIDTH;

  const py =
    ((y % 32) + 32) % 32;

  const cx =
    Math.floor(px / CARRIER_CELL);

  const cy =
    Math.floor(py / CARRIER_CELL);

  const localX = px % CARRIER_CELL;
  const localY = py % CARRIER_CELL;

  /*
   * Small diamond.
   */
  const diamondCenterX = 32;
  const diamondCenterY = 16;

  const diamondDistance =
    Math.abs(px - diamondCenterX) +
    Math.abs(py - diamondCenterY);

  const diamond =
    diamondDistance < 14;

  /*
   * Fine diagonal lattice.
   */
  const diagonal1 =
    ((px + py * 2) % 18) < 5;

  const diagonal2 =
    ((px * 2 - py + 1000) % 21) < 5;

  /*
   * Small repeating checker.
   */
  const checker =
    ((cx + cy) & 1) === 0;

  /*
   * Tiny alternating cells prevent the carrier
   * from becoming visually flat.
   */
  const micro =
    localX < 2 && localY < 2;

  let result = 0;

  if (diamond) {
    result = 1;
  } else if (diagonal1 !== diagonal2) {
    result = 1;
  } else if (checker) {
    result = 0;
  } else {
    result = 1;
  }

  if (micro) {
    result = result ? 0 : 1;
  }

  return result;
}

/* -------------------------------------------------- */
/* Face depth map                                     */
/* -------------------------------------------------- */

/*
 * Creates a strongly structured frontal face.
 *
 * 0 = background
 * 1 = closest facial surface
 */
function createDepthMap(config: MagicEyeConfig) {
  const cx = WIDTH / 2;
  const cy = HEIGHT / 2 - 20;

  return (x: number, y: number) => {
    let depth = 0;

    let headRX = 76;
    let headRY = 103;

    if (config.faceStructure === 'round') {
      headRX = 83;
      headRY = 92;
    }

    if (config.faceStructure === 'square') {
      headRX = 82;
      headRY = 101;
    }

    /*
     * Main head silhouette.
     */
    const headValue = ellipse(
      x,
      y,
      cx,
      cy,
      headRX,
      headRY
    );

    if (headValue < 1) {
      /*
       * Strong central facial plane.
       */
      depth =
        0.32 +
        (1 - headValue) * 0.30;

      /*
       * Slightly stronger center.
       */
      const centerValue = ellipse(
        x,
        y,
        cx,
        cy + 2,
        headRX * 0.66,
        headRY * 0.76
      );

      if (centerValue < 1) {
        depth +=
          (1 - centerValue) * 0.18;
      }

      /*
       * Different jaw structures.
       */
      if (config.faceStructure === 'oval') {
        const jaw = ellipse(
          x,
          y,
          cx,
          cy + 48,
          headRX * 0.72,
          headRY * 0.47
        );

        if (jaw < 1) {
          depth +=
            (1 - jaw) * 0.12;
        }
      }

      if (config.faceStructure === 'round') {
        const jaw = ellipse(
          x,
          y,
          cx,
          cy + 45,
          headRX * 0.82,
          headRY * 0.43
        );

        if (jaw < 1) {
          depth +=
            (1 - jaw) * 0.16;
        }
      }

      if (config.faceStructure === 'square') {
        const jawDistance = roundedBox(
          x,
          y,
          cx,
          cy + 42,
          59,
          53,
          18
        );

        if (jawDistance < 0) {
          depth += 0.20;
        }
      }

      /*
       * Cheeks.
       */
      const leftCheek = ellipse(
        x,
        y,
        cx - 29,
        cy + 19,
        32,
        27
      );

      const rightCheek = ellipse(
        x,
        y,
        cx + 29,
        cy + 19,
        32,
        27
      );

      if (leftCheek < 1) {
        depth +=
          (1 - leftCheek) * 0.14;
      }

      if (rightCheek < 1) {
        depth +=
          (1 - rightCheek) * 0.14;
      }

      /*
       * Eye sockets.
       *
       * These are deliberately broad enough to
       * create a recognizable face in depth.
       */
      const leftEyeSocket = ellipse(
        x,
        y,
        cx - 29,
        cy - 12,
        22,
        11
      );

      const rightEyeSocket = ellipse(
        x,
        y,
        cx + 29,
        cy - 12,
        22,
        11
      );

      if (leftEyeSocket < 1) {
        depth +=
          (1 - leftEyeSocket) * 0.16;
      }

      if (rightEyeSocket < 1) {
        depth +=
          (1 - rightEyeSocket) * 0.16;
      }

      /*
       * Eye centers.
       */
      const leftEye = ellipse(
        x,
        y,
        cx - 29,
        cy - 12,
        8,
        5
      );

      const rightEye = ellipse(
        x,
        y,
        cx + 29,
        cy - 12,
        8,
        5
      );

      if (leftEye < 1) {
        depth -=
          (1 - leftEye) * 0.10;
      }

      if (rightEye < 1) {
        depth -=
          (1 - rightEye) * 0.10;
      }

      /*
       * Nose bridge.
       */
      const noseBridge = roundedBox(
        x,
        y,
        cx,
        cy + 11,
        8,
        29,
        5
      );

      if (noseBridge < 0) {
        depth += 0.23;
      }

      /*
       * Nose tip.
       */
      const noseTip = ellipse(
        x,
        y,
        cx,
        cy + 35,
        15,
        10
      );

      if (noseTip < 1) {
        depth +=
          (1 - noseTip) * 0.26;
      }

      /*
       * Nose sides create recognizable structure.
       */
      const leftNostril = ellipse(
        x,
        y,
        cx - 7,
        cy + 38,
        5,
        3
      );

      const rightNostril = ellipse(
        x,
        y,
        cx + 7,
        cy + 38,
        5,
        3
      );

      if (leftNostril < 1) {
        depth -=
          (1 - leftNostril) * 0.09;
      }

      if (rightNostril < 1) {
        depth -=
          (1 - rightNostril) * 0.09;
      }

      /*
       * Mouth area.
       */
      const upperLip = ellipse(
        x,
        y,
        cx,
        cy + 55,
        23,
        7
      );

      if (upperLip < 1) {
        depth +=
          (1 - upperLip) * 0.14;
      }

      const mouthOpening = ellipse(
        x,
        y,
        cx,
        cy + 58,
        19,
        3
      );

      if (mouthOpening < 1) {
        depth -=
          (1 - mouthOpening) * 0.10;
      }

      /*
       * Chin.
       */
      const chin = ellipse(
        x,
        y,
        cx,
        cy + 75,
        30,
        20
      );

      if (chin < 1) {
        depth +=
          (1 - chin) * 0.17;
      }

      /*
       * Hair.
       */
      if (config.hairStyle !== 'bald') {
        const hair = ellipse(
          x,
          y,
          cx,
          cy - 73,
          headRX * 1.03,
          51
        );

        if (hair < 1) {
          if (config.hairStyle === 'straight') {
            depth +=
              (1 - hair) * 0.32;
          } else {
            const curlWave =
              Math.sin(x * 0.34) *
              Math.cos(y * 0.21);

            depth +=
              (1 - hair) *
              (0.28 + curlWave * 0.045);
          }
        }

        /*
         * Hairline.
         */
        const hairline = ellipse(
          x,
          y,
          cx,
          cy - 42,
          headRX * 0.82,
          34
        );

        if (hairline < 1) {
          depth +=
            (1 - hairline) * 0.12;
        }
      }

      /*
       * Male beard.
       */
      if (
        config.gender === 'male' &&
        config.beardStyle !== 'clean'
      ) {
        const beard = ellipse(
          x,
          y,
          cx,
          cy + 55,
          55,
          47
        );

        if (beard < 1) {
          if (config.beardStyle === 'stubble') {
            depth +=
              (1 - beard) * 0.10;
          }

          if (config.beardStyle === 'short') {
            depth +=
              (1 - beard) * 0.17;
          }

          if (config.beardStyle === 'full') {
            depth +=
              (1 - beard) * 0.25;
          }
        }
      }
    }

    /*
     * Slight gender-specific jaw emphasis.
     */
    if (config.gender === 'male') {
      const maleJaw = ellipse(
        x,
        y,
        cx,
        cy + 52,
        64,
        46
      );

      if (maleJaw < 1) {
        depth +=
          (1 - maleJaw) * 0.10;
      }
    } else {
      const feminineContour = ellipse(
        x,
        y,
        cx,
        cy + 40,
        57,
        54
      );

      if (feminineContour < 1) {
        depth +=
          (1 - feminineContour) * 0.08;
      }
    }

    /*
     * Make the selected structure much more visible
     * without drawing a visible face.
     */
    depth =
      Math.pow(
        clamp(depth, 0, 1),
        0.72
      );

    depth *= DEPTH_STRENGTH;

    return clamp(depth, 0, 1);
  };
}

/* -------------------------------------------------- */
/* Stereogram separation                              */
/* -------------------------------------------------- */

function separationFromDepth(depth: number) {
  const z = clamp(depth, 0, 1);

  /*
   * Classic stereogram separation relation.
   */
  const separation =
    (EYE_SEPARATION * (1 - MU * z)) /
    (2 - MU * z);

  return Math.round(
    clamp(
      separation,
      18,
      EYE_SEPARATION / 2
    )
  );
}

/* -------------------------------------------------- */
/* Canvas                                             */
/* -------------------------------------------------- */

export default function StereogramCanvas({
  config,
  paletteIndex,
  generateKey,
  onCanvasReady,
}: StereogramCanvasProps) {
  const canvasRef =
    useRef<HTMLCanvasElement>(null);

  const [rendering, setRendering] =
    useState(false);

  const render = useCallback(() => {
    const canvas =
      canvasRef.current;

    if (!canvas) return;

    setRendering(true);

    try {
      canvas.width = WIDTH;
      canvas.height = HEIGHT;

      const ctx =
        canvas.getContext('2d', {
          alpha: false,
        });

      if (!ctx) {
        return;
      }

      /*
       * Keep compatibility with the existing palette
       * system. The stereogram itself stays B/W because
       * that is the reference-style visual.
       */
      void PALETTES[
        paletteIndex % PALETTES.length
      ];

      const depthAt =
        createDepthMap(config);

      const image =
        ctx.createImageData(
          WIDTH,
          HEIGHT
        );

      const pixels =
        image.data;

      /*
       * Process each row independently.
       */
      for (let y = 0; y < HEIGHT; y++) {
        const parent =
          new Int32Array(WIDTH);

        const rank =
          new Uint8Array(WIDTH);

        for (let x = 0; x < WIDTH; x++) {
          parent[x] = x;
          rank[x] = 0;
        }

        const find = (x: number): number => {
          let root = x;

          while (
            parent[root] !== root
          ) {
            root = parent[root];
          }

          while (
            parent[x] !== x
          ) {
            const next =
              parent[x];

            parent[x] = root;
            x = next;
          }

          return root;
        };

        const union = (
          a: number,
          b: number
        ) => {
          if (
            a < 0 ||
            b < 0 ||
            a >= WIDTH ||
            b >= WIDTH
          ) {
            return;
          }

          let ra = find(a);
          let rb = find(b);

          if (ra === rb) {
            return;
          }

          if (rank[ra] < rank[rb]) {
            const temp = ra;
            ra = rb;
            rb = temp;
          }

          parent[rb] = ra;

          if (rank[ra] === rank[rb]) {
            rank[ra]++;
          }
        };

        /*
         * Calculate depth once for the entire row.
         * This is important for performance and consistency.
         */
        const depths =
          new Float32Array(WIDTH);

        for (let x = 0; x < WIDTH; x++) {
          depths[x] =
            depthAt(x, y);
        }

        /*
         * The face is deliberately processed from
         * foreground to background.
         *
         * Strong facial structures therefore take
         * priority over the broad head surface.
         */
        const order =
          Array.from(
            { length: WIDTH },
            (_, x) => x
          );

        order.sort(
          (a, b) =>
            depths[b] -
            depths[a]
        );

        for (
          let i = 0;
          i < order.length;
          i++
        ) {
          const x =
            order[i];

          const depth =
            depths[x];

          if (depth < 0.035) {
            continue;
          }

          const separation =
            separationFromDepth(
              depth
            );

          const half =
            Math.floor(
              separation / 2
            );

          let left =
            x - half;

          let right =
            x + half;

          /*
           * Keep the pair inside the canvas.
           */
          if (left < 0) {
            right += -left;
            left = 0;
          }

          if (right >= WIDTH) {
            const correction =
              right - WIDTH + 1;

            left -= correction;
            right -= correction;
          }

          if (
            left < 0 ||
            right >= WIDTH
          ) {
            continue;
          }

          /*
           * Hidden-surface protection.
           *
           * Do not let a very near surface create
           * unlimited overlapping constraints.
           */
          const middle =
            Math.floor(
              (left + right) / 2
            );

          let blocked = false;

          const nearDepth =
            depths[x];

          const leftDepth =
            depths[left];

          const rightDepth =
            depths[right];

          if (
            leftDepth >
              nearDepth + 0.22 ||
            rightDepth >
              nearDepth + 0.22
          ) {
            blocked = true;
          }

          if (
            depths[middle] >
              nearDepth + 0.28
          ) {
            blocked = true;
          }

          if (!blocked) {
            union(
              left,
              right
            );
          }
        }

        /*
         * Assign the repeating geometric carrier
         * to every equivalence group.
         *
         * The root position is used as the carrier
         * coordinate, keeping the pattern coherent.
         */
        for (
          let x = 0;
          x < WIDTH;
          x++
        ) {
          const root =
            find(x);

          const sourceX =
            ((root % TILE_WIDTH) +
              TILE_WIDTH) %
            TILE_WIDTH;

          const bit =
            carrier(
              sourceX,
              y
            );

          const index =
            (y * WIDTH + x) * 4;

          const value =
            bit ? 255 : 0;

          pixels[index] =
            value;

          pixels[index + 1] =
            value;

          pixels[index + 2] =
            value;

          pixels[index + 3] =
            255;
        }
      }

      ctx.putImageData(
        image,
        0,
        0
      );

      const dataUrl =
        canvas.toDataURL(
          'image/png'
        );

      onCanvasReady?.(
        dataUrl
      );
    } catch (error) {
      console.error(
        'Love Magic Eye generation error:',
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
  }, [
    generateKey,
    render,
  ]);

  const palette =
    PALETTES[
      paletteIndex %
        PALETTES.length
    ];

  return (
    <div className="w-full flex flex-col items-center">
      <div
        id="magic-eye-canvas"
        className="relative w-full max-w-[400px] mx-auto overflow-hidden rounded-3xl"
        style={{
          background: '#000',
          border: `2px solid ${palette.primary}30`,
          boxShadow: `
            0 0 30px ${palette.primary}35,
            0 0 60px ${palette.secondary}18
          `,
        }}
      >
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          className="block w-full h-auto"
          style={{
            aspectRatio: '400 / 600',
          }}
        />

        {rendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/25 backdrop-blur-[2px]">
            <div className="w-9 h-9 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          </div>
        )}
      </div>

      <p
        className="mt-2 text-[10px] sm:text-xs font-mono uppercase tracking-[0.22em]"
        style={{
          color: palette.primary,
        }}
      >
        Magic Eye Stereogram
      </p>
    </div>
  );
}
