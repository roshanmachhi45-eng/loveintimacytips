import { useCallback, useEffect, useRef, useState } from 'react';
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
 * =========================================================
 * MAGIC EYE ENGINE
 * =========================================================
 *
 * The image consists of:
 *
 * 1. A strong black/white geometric repeating carrier.
 * 2. A mathematical hidden face depth map.
 * 3. Horizontal pixel correspondence constraints.
 *
 * The face itself is NEVER painted onto the canvas.
 */

const FAR_SEPARATION = 88;

/*
 * Difference between the far background and the closest
 * part of the hidden face.
 *
 * Keeping this moderate makes the stereogram easier to
 * fuse on phones/tablets.
 */
const DEPTH_RANGE = 24;

/*
 * Geometric carrier period.
 *
 * The reference image has a clearly repeating pattern.
 */
const CARRIER_PERIOD = 32;

/*
 * =========================================================
 * BASIC HELPERS
 * =========================================================
 */

function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

function smoothstep(
  value: number
): number {
  const x = clamp(
    value,
    0,
    1
  );

  return (
    x *
    x *
    (3 - 2 * x)
  );
}

/*
 * =========================================================
 * SHAPE FUNCTIONS
 * =========================================================
 */

function ellipse(
  x: number,
  y: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number
): number {
  const dx =
    (x - cx) / rx;

  const dy =
    (y - cy) / ry;

  const distance =
    dx * dx +
    dy * dy;

  if (distance >= 1) {
    return 0;
  }

  return smoothstep(
    1 - distance
  );
}

function roundedRectangle(
  x: number,
  y: number,
  cx: number,
  cy: number,
  width: number,
  height: number,
  radius: number
): number {
  const halfW =
    width / 2;

  const halfH =
    height / 2;

  const px =
    Math.abs(x - cx) -
    halfW +
    radius;

  const py =
    Math.abs(y - cy) -
    halfH +
    radius;

  const ax =
    Math.max(px, 0);

  const ay =
    Math.max(py, 0);

  const outside =
    Math.sqrt(
      ax * ax +
      ay * ay
    );

  const inside =
    Math.min(
      Math.max(px, py),
      0
    );

  const distance =
    outside + inside;

  if (
    distance >= radius
  ) {
    return 0;
  }

  return smoothstep(
    1 -
      distance /
        radius
  );
}

/*
 * =========================================================
 * HAIR DEPTH
 * =========================================================
 */

function getHairDepth(
  x: number,
  y: number,
  cx: number,
  cy: number,
  config: MagicEyeConfig
): number {
  if (
    config.hairStyle === 'bald'
  ) {
    return 0;
  }

  /*
   * Main head cap.
   */
  const cap =
    ellipse(
      x,
      y,
      cx,
      cy - 55,
      108,
      90
    );

  if (cap <= 0) {
    return 0;
  }

  /*
   * Hair should not cover the middle/lower face.
   */
  if (
    y >
    cy - 48
  ) {
    return 0;
  }

  /*
   * Curly hair gets several soft bumps.
   */
  if (
    config.hairStyle === 'curly'
  ) {
    const curls = [
      [-82, -78],
      [-58, -96],
      [-30, -105],
      [0, -108],
      [30, -105],
      [58, -96],
      [82, -78],
    ];

    let result = 0;

    for (
      const [offsetX, offsetY]
      of curls
    ) {
      result = Math.max(
        result,
        ellipse(
          x,
          y,
          cx + offsetX,
          cy + offsetY,
          31,
          29
        )
      );
    }

    return result;
  }

  /*
   * Straight hair.
   */
  return cap;
}

/*
 * =========================================================
 * FACE DEPTH MAP
 * =========================================================
 *
 * 0 = background
 * 1 = strongest foreground
 *
 * Nothing from this function is directly painted.
 * It only controls stereoscopic displacement.
 * =========================================================
 */

function getFaceDepth(
  x: number,
  y: number,
  config: MagicEyeConfig
): number {
  const cx =
    CANVAS_W / 2;

  const cy = 282;

  let face = 0;

  /*
   * -------------------------------------------------------
   * FACE STRUCTURE
   * -------------------------------------------------------
   */

  if (
    config.faceStructure === 'round'
  ) {
    face =
      ellipse(
        x,
        y,
        cx,
        cy,
        108,
        128
      );
  } else if (
    config.faceStructure === 'square'
  ) {
    face =
      roundedRectangle(
        x,
        y,
        cx,
        cy,
        214,
        250,
        48
      );
  } else {
    /*
     * Oval.
     */
    face =
      ellipse(
        x,
        y,
        cx,
        cy,
        102,
        137
      );
  }

  const hair =
    getHairDepth(
      x,
      y,
      cx,
      cy,
      config
    );

  /*
   * Hair can extend outside the face.
   */
  if (face <= 0) {
    return hair * 0.75;
  }

  /*
   * -------------------------------------------------------
   * MAIN FACE VOLUME
   * -------------------------------------------------------
   */

  let depth =
    0.34 +
    face * 0.38;

  /*
   * -------------------------------------------------------
   * FOREHEAD
   * -------------------------------------------------------
   */

  depth +=
    ellipse(
      x,
      y,
      cx,
      cy - 52,
      62,
      48
    ) * 0.09;

  /*
   * -------------------------------------------------------
   * CHEEKS
   * -------------------------------------------------------
   */

  const leftCheek =
    ellipse(
      x,
      y,
      cx - 43,
      cy + 13,
      53,
      49
    );

  const rightCheek =
    ellipse(
      x,
      y,
      cx + 43,
      cy + 13,
      53,
      49
    );

  depth +=
    Math.max(
      leftCheek,
      rightCheek
    ) * 0.11;

  /*
   * -------------------------------------------------------
   * EYES
   * -------------------------------------------------------
   *
   * Very shallow so the face stays visually coherent.
   */

  depth +=
    Math.max(
      ellipse(
        x,
        y,
        cx - 38,
        cy - 24,
        24,
        9
      ),
      ellipse(
        x,
        y,
        cx + 38,
        cy - 24,
        24,
        9
      )
    ) * 0.08;

  /*
   * -------------------------------------------------------
   * NOSE
   * -------------------------------------------------------
   */

  depth +=
    ellipse(
      x,
      y,
      cx,
      cy + 2,
      17,
      42
    ) * 0.16;

  /*
   * -------------------------------------------------------
   * MOUTH
   * -------------------------------------------------------
   */

  depth +=
    ellipse(
      x,
      y,
      cx,
      cy + 55,
      34,
      11
    ) * 0.07;

  /*
   * -------------------------------------------------------
   * CHIN
   * -------------------------------------------------------
   */

  depth +=
    ellipse(
      x,
      y,
      cx,
      cy + 89,
      47,
      34
    ) * 0.10;

  /*
   * -------------------------------------------------------
   * GENDER SHAPE
   * -------------------------------------------------------
   */

  if (
    config.gender === 'male'
  ) {
    /*
     * Stronger jaw.
     */
    if (
      config.faceStructure === 'square'
    ) {
      depth +=
        roundedRectangle(
          x,
          y,
          cx,
          cy + 45,
          194,
          105,
          34
        ) * 0.14;
    } else {
      depth +=
        ellipse(
          x,
          y,
          cx,
          cy + 50,
          88,
          72
        ) * 0.11;
    }
  } else {
    /*
     * Slightly softer lower-face volume.
     */
    depth +=
      ellipse(
        x,
        y,
        cx,
        cy + 48,
        79,
        76
      ) * 0.07;
  }

  /*
   * -------------------------------------------------------
   * BEARD
   * -------------------------------------------------------
   */

  if (
    config.gender === 'male'
  ) {
    let beard = 0;

    if (
      config.beardStyle === 'stubble'
    ) {
      beard =
        ellipse(
          x,
          y,
          cx,
          cy + 53,
          72,
          59
        );
    }

    if (
      config.beardStyle === 'short'
    ) {
      beard =
        ellipse(
          x,
          y,
          cx,
          cy + 54,
          78,
          64
        );
    }

    if (
      config.beardStyle === 'full'
    ) {
      beard =
        ellipse(
          x,
          y,
          cx,
          cy + 48,
          87,
          76
        );
    }

    depth +=
      beard * 0.11;
  }

  /*
   * -------------------------------------------------------
   * HAIR
   * -------------------------------------------------------
   */

  depth +=
    hair * 0.17;

  return clamp(
    depth,
    0,
    1
  );
}

/*
 * =========================================================
 * GEOMETRIC REFERENCE-STYLE CARRIER
 * =========================================================
 *
 * Instead of random dots, we create a continuous,
 * high-contrast diamond/chevron pattern.
 *
 * The pattern itself is visible to the user.
 *
 * The hidden face is created by the pixel constraints,
 * not by painting a face over it.
 * =========================================================
 */

function carrierPixel(
  x: number,
  y: number
): number {
  /*
   * Two diagonal waves.
   */
  const p1 =
    ((x + y) %
      CARRIER_PERIOD +
      CARRIER_PERIOD) %
    CARRIER_PERIOD;

  const p2 =
    ((x - y) %
      CARRIER_PERIOD +
      CARRIER_PERIOD) %
    CARRIER_PERIOD;

  /*
   * Distance from centre of each diagonal cycle.
   */
  const d1 =
    Math.abs(
      p1 -
        CARRIER_PERIOD / 2
    );

  const d2 =
    Math.abs(
      p2 -
        CARRIER_PERIOD / 2
    );

  const distance =
    Math.min(
      d1,
      d2
    );

  /*
   * Narrow white geometric strokes
   * over a black background.
   */
  return distance < 4
    ? 255
    : 0;
}

/*
 * =========================================================
 * UNION-FIND
 * =========================================================
 */

function findRoot(
  parent: Int32Array,
  value: number
): number {
  let root = value;

  while (
    parent[root] !== root
  ) {
    root =
      parent[root];
  }

  while (
    parent[value] !== value
  ) {
    const next =
      parent[value];

    parent[value] =
      root;

    value = next;
  }

  return root;
}

function union(
  parent: Int32Array,
  a: number,
  b: number
): void {
  const rootA =
    findRoot(
      parent,
      a
    );

  const rootB =
    findRoot(
      parent,
      b
    );

  if (
    rootA !== rootB
  ) {
    parent[rootB] =
      rootA;
  }
}

/*
 * =========================================================
 * MAIN COMPONENT
 * =========================================================
 */

export default function StereogramCanvas({
  config,
  generateKey,
  onCanvasReady,
}: StereogramCanvasProps) {
  const canvasRef =
    useRef<HTMLCanvasElement>(
      null
    );

  const [
    rendering,
    setRendering,
  ] = useState(false);

  const render =
    useCallback(() => {
      const canvas =
        canvasRef.current;

      if (!canvas) {
        return;
      }

      setRendering(true);

      try {
        canvas.width =
          CANVAS_W;

        canvas.height =
          CANVAS_H;

        const ctx =
          canvas.getContext(
            '2d'
          );

        if (!ctx) {
          return;
        }

        const image =
          ctx.createImageData(
            CANVAS_W,
            CANVAS_H
          );

        const pixels =
          image.data;

        /*
         * =================================================
         * SOLVE EACH HORIZONTAL ROW
         * =================================================
         */

        for (
          let y = 0;
          y < CANVAS_H;
          y++
        ) {
          /*
           * IMPORTANT:
           *
           * Int32Array supports -1 correctly.
           * We explicitly initialize every pixel.
           */
          const parent =
            new Int32Array(
              CANVAS_W
            );

          for (
            let x = 0;
            x < CANVAS_W;
            x++
          ) {
            parent[x] =
              x;
          }

          /*
           * ------------------------------------------------
           * DEPTH CONSTRAINTS
           * ------------------------------------------------
           */

          for (
            let x = 0;
            x < CANVAS_W;
            x++
          ) {
            const depth =
              getFaceDepth(
                x,
                y,
                config
              );

            /*
             * Far background:
             *
             * separation = 88
             *
             * Foreground face:
             *
             * separation becomes smaller.
             */
            const separation =
              Math.round(
                FAR_SEPARATION -
                  depth *
                    DEPTH_RANGE
              );

            /*
             * Symmetric correspondence.
             */
            const left =
              Math.round(
                x -
                  separation / 2
              );

            const right =
              left +
              separation;

            /*
             * Outside the canvas = no constraint.
             */
            if (
              left < 0 ||
              right >= CANVAS_W
            ) {
              continue;
            }

            /*
             * These two pixels represent the same
             * hidden visual point.
             */
            union(
              parent,
              left,
              right
            );
          }

          /*
           * ------------------------------------------------
           * ASSIGN CARRIER TO EACH GROUP
           * ------------------------------------------------
           *
           * Every equivalence group gets one black/white
           * value.
           *
           * This is where the visible geometric pattern
           * comes from.
           */

          const groupValue =
            new Int16Array(
              CANVAS_W
            );

          /*
           * -1 means "not assigned yet".
           */
          groupValue.fill(
            -1
          );

          for (
            let x = 0;
            x < CANVAS_W;
            x++
          ) {
            const root =
              findRoot(
                parent,
                x
              );

            /*
             * Assign each group exactly once.
             */
            if (
              groupValue[root] ===
              -1
            ) {
              groupValue[root] =
                carrierPixel(
                  root,
                  y
                );
            }

            const value =
              groupValue[root];

            const index =
              (
                y *
                  CANVAS_W +
                x
              ) * 4;

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

        /*
         * =================================================
         * DRAW
         * =================================================
         */

        ctx.putImageData(
          image,
          0,
          0
        );

        /*
         * =================================================
         * IMPORTANT
         * =================================================
         *
         * NOTHING is drawn over the stereogram.
         *
         * No face.
         * No heart.
         * No partner name.
         * No text.
         * No overlay.
         *
         * The hidden face exists only inside the
         * stereoscopic correspondence.
         * =================================================
         */

        const dataUrl =
          canvas.toDataURL(
            'image/png'
          );

        onCanvasReady?.(
          dataUrl
        );
      } catch (error) {
        console.error(
          'Love Magic Eye render error:',
          error
        );
      } finally {
        setRendering(false);
      }
    }, [
      config,
      generateKey,
      onCanvasReady,
    ]);

  useEffect(() => {
    if (
      generateKey <= 0
    ) {
      return;
    }

    const frame =
      window.requestAnimationFrame(
        render
      );

    return () => {
      window.cancelAnimationFrame(
        frame
      );
    };
  }, [
    generateKey,
    render,
  ]);

  return (
    <div className="flex w-full flex-col items-center">
      <div
        className="relative mx-auto w-full max-w-[400px] overflow-hidden rounded-[18px]"
        style={{
          background:
            '#000000',
          border:
            '2px solid rgba(255,255,255,0.16)',
          boxShadow:
            '0 12px 45px rgba(0,0,0,0.20)',
        }}
      >
        <canvas
          ref={canvasRef}
          className="block h-auto w-full"
          style={{
            aspectRatio:
              '400 / 600',
          }}
        />

        {rendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>
        )}
      </div>

      <p className="mt-3 text-center text-xs font-mono uppercase tracking-[0.18em] text-gray-500">
        Magic Eye Stereogram
      </p>

      <p className="mt-2 max-w-[390px] px-4 text-center text-sm text-gray-600">
        Relax your eyes and look through the
        repeating pattern. Keep the image still
        and allow the hidden 3D image to appear.
      </p>
    </div>
  );
}
