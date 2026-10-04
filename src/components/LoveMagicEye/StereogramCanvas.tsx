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
 * ---------------------------------------------------------
 * GEOMETRIC MAGIC-EYE SETTINGS
 * ---------------------------------------------------------
 *
 * The carrier pattern is intentionally black/white and
 * geometric, similar to the reference image.
 *
 * The hidden object is encoded by changing the horizontal
 * correspondence between pixels.
 */

const FAR_SEPARATION = 92;
const MAX_DEPTH_CHANGE = 28;

/*
 * ---------------------------------------------------------
 * SMALL HELPERS
 * ---------------------------------------------------------
 */

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

/*
 * ---------------------------------------------------------
 * SMOOTH SHAPES
 * ---------------------------------------------------------
 */

function ellipseDepth(
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

  const d =
    dx * dx +
    dy * dy;

  if (d >= 1) {
    return 0;
  }

  /*
   * Smooth falloff instead of a hard edge.
   */
  return Math.pow(
    1 - d,
    0.55
  );
}

function roundedFaceDepth(
  x: number,
  y: number,
  cx: number,
  cy: number,
  width: number,
  height: number,
  radius: number
): number {
  const left =
    cx - width / 2;

  const right =
    cx + width / 2;

  const top =
    cy - height / 2;

  const bottom =
    cy + height / 2;

  const qx =
    Math.max(
      left + radius,
      Math.min(
        x,
        right - radius
      )
    );

  const qy =
    Math.max(
      top + radius,
      Math.min(
        y,
        bottom - radius
      )
    );

  const dx =
    (x - qx) / radius;

  const dy =
    (y - qy) / radius;

  const d =
    dx * dx +
    dy * dy;

  if (d >= 1) {
    return 0;
  }

  return Math.pow(
    1 - d,
    0.58
  );
}

/*
 * ---------------------------------------------------------
 * HAIR SILHOUETTE
 * ---------------------------------------------------------
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
   * Main hair cap.
   */
  const cap =
    ellipseDepth(
      x,
      y,
      cx,
      cy - 55,
      112,
      92
    );

  if (cap <= 0) {
    return 0;
  }

  /*
   * Don't let hair cover the entire face.
   */
  if (
    y >
    cy - 48
  ) {
    return 0;
  }

  if (
    config.hairStyle === 'curly'
  ) {
    /*
     * Curly silhouette:
     * overlapping soft circular masses.
     */
    let curls = 0;

    const positions = [
      [-82, -78],
      [-58, -98],
      [-28, -108],
      [0, -112],
      [30, -105],
      [60, -94],
      [84, -72],
    ];

    for (
      const [ox, oy] of positions
    ) {
      curls = Math.max(
        curls,
        ellipseDepth(
          x,
          y,
          cx + ox,
          cy + oy,
          32,
          30
        )
      );
    }

    return curls;
  }

  /*
   * Straight hair.
   */
  return cap;
}

/*
 * ---------------------------------------------------------
 * FACE DEPTH MAP
 * ---------------------------------------------------------
 *
 * This function NEVER draws the face.
 *
 * It only describes the 3D depth of the hidden object.
 *
 * 0 = background
 * 1 = strongest foreground
 * ---------------------------------------------------------
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
   * -----------------------------------------------
   * FACE STRUCTURE
   * -----------------------------------------------
   */

  if (
    config.faceStructure === 'round'
  ) {
    face =
      ellipseDepth(
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
      roundedFaceDepth(
        x,
        y,
        cx,
        cy,
        214,
        250,
        50
      );
  } else {
    /*
     * Oval default.
     */
    face =
      ellipseDepth(
        x,
        y,
        cx,
        cy,
        102,
        137
      );
  }

  /*
   * Hair can extend outside the face.
   */
  const hair =
    getHairDepth(
      x,
      y,
      cx,
      cy,
      config
    );

  /*
   * -----------------------------------------------
   * OUTSIDE FACE
   * -----------------------------------------------
   */

  if (face <= 0) {
    return hair * 0.72;
  }

  /*
   * -----------------------------------------------
   * MAIN FACE RELIEF
   * -----------------------------------------------
   */

  let depth =
    0.38 +
    face * 0.36;

  /*
   * -----------------------------------------------
   * FOREHEAD
   * -----------------------------------------------
   */

  depth +=
    ellipseDepth(
      x,
      y,
      cx,
      cy - 52,
      62,
      52
    ) * 0.10;

  /*
   * -----------------------------------------------
   * CHEEKS
   * -----------------------------------------------
   */

  const leftCheek =
    ellipseDepth(
      x,
      y,
      cx - 43,
      cy + 12,
      52,
      48
    );

  const rightCheek =
    ellipseDepth(
      x,
      y,
      cx + 43,
      cy + 12,
      52,
      48
    );

  depth +=
    Math.max(
      leftCheek,
      rightCheek
    ) * 0.10;

  /*
   * -----------------------------------------------
   * EYES
   * -----------------------------------------------
   *
   * Very shallow features.
   * We don't want the face to break into many
   * disconnected objects.
   */

  const leftEye =
    ellipseDepth(
      x,
      y,
      cx - 38,
      cy - 23,
      24,
      9
    );

  const rightEye =
    ellipseDepth(
      x,
      y,
      cx + 38,
      cy - 23,
      24,
      9
    );

  depth +=
    Math.max(
      leftEye,
      rightEye
    ) * 0.08;

  /*
   * -----------------------------------------------
   * NOSE
   * -----------------------------------------------
   */

  depth +=
    ellipseDepth(
      x,
      y,
      cx,
      cy + 2,
      17,
      42
    ) * 0.16;

  /*
   * -----------------------------------------------
   * MOUTH
   * -----------------------------------------------
   */

  depth +=
    ellipseDepth(
      x,
      y,
      cx,
      cy + 55,
      34,
      11
    ) * 0.07;

  /*
   * -----------------------------------------------
   * CHIN
   * -----------------------------------------------
   */

  depth +=
    ellipseDepth(
      x,
      y,
      cx,
      cy + 88,
      47,
      34
    ) * 0.10;

  /*
   * -----------------------------------------------
   * MALE JAW
   * -----------------------------------------------
   */

  if (
    config.gender === 'male'
  ) {
    if (
      config.faceStructure === 'square'
    ) {
      depth +=
        roundedFaceDepth(
          x,
          y,
          cx,
          cy + 42,
          194,
          108,
          36
        ) * 0.16;
    } else {
      depth +=
        ellipseDepth(
          x,
          y,
          cx,
          cy + 48,
          88,
          72
        ) * 0.10;
    }
  }

  /*
   * -----------------------------------------------
   * FEMALE FACE RELIEF
   * -----------------------------------------------
   */

  if (
    config.gender === 'female'
  ) {
    depth +=
      ellipseDepth(
        x,
        y,
        cx,
        cy + 48,
        80,
        76
      ) * 0.07;
  }

  /*
   * -----------------------------------------------
   * BEARD
   * -----------------------------------------------
   */

  if (
    config.gender === 'male'
  ) {
    let beard = 0;

    if (
      config.beardStyle === 'stubble'
    ) {
      beard =
        ellipseDepth(
          x,
          y,
          cx,
          cy + 54,
          72,
          59
        );
    }

    if (
      config.beardStyle === 'short'
    ) {
      beard =
        ellipseDepth(
          x,
          y,
          cx,
          cy + 55,
          78,
          65
        );
    }

    if (
      config.beardStyle === 'full'
    ) {
      beard =
        ellipseDepth(
          x,
          y,
          cx,
          cy + 48,
          86,
          76
        );
    }

    depth +=
      beard * 0.10;
  }

  /*
   * -----------------------------------------------
   * HAIR
   * -----------------------------------------------
   */

  depth +=
    hair * 0.16;

  return clamp(
    depth,
    0,
    1
  );
}

/*
 * ---------------------------------------------------------
 * GEOMETRIC CARRIER
 * ---------------------------------------------------------
 *
 * This creates the visual pattern similar to the reference:
 *
 *     /\/\  /\/\
 *     \/\/  \/\/
 *
 * with nested diamond/chevron structures.
 *
 * It is deliberately NOT random noise.
 * ---------------------------------------------------------
 */

function geometricCarrier(
  x: number,
  y: number
): number {
  /*
   * Primary diagonal.
   */
  const a =
    Math.abs(
      ((x + y) % 44) - 22
    );

  /*
   * Secondary diagonal.
   */
  const b =
    Math.abs(
      ((x - y) % 44) - 22
    );

  /*
   * Create narrow black/white diagonal lines.
   */
  const distance =
    Math.min(
      a,
      b
    );

  /*
   * Slightly thicker white lines.
   */
  return distance < 4
    ? 255
    : 18;
}

/*
 * ---------------------------------------------------------
 * UNION-FIND
 * ---------------------------------------------------------
 *
 * This is the important part missing from the previous
 * simple implementation.
 *
 * Pixels that should represent the same visual point are
 * joined into the same equivalence group.
 * ---------------------------------------------------------
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
) {
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
 * ---------------------------------------------------------
 * MAIN COMPONENT
 * ---------------------------------------------------------
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

  const [rendering, setRendering] =
    useState(false);

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
         * Each row is solved independently.
         *
         * This is important because stereogram correspondence
         * is horizontal.
         */

        for (
          let y = 0;
          y < CANVAS_H;
          y++
        ) {
          const parent =
            new Int32Array(
              CANVAS_W
            );

          /*
           * Initially every pixel belongs to itself.
           */
          for (
            let x = 0;
            x < CANVAS_W;
            x++
          ) {
            parent[x] =
              x;
          }

          /*
           * -------------------------------------------
           * CREATE DEPTH CONSTRAINTS
           * -------------------------------------------
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
             * Background = FAR_SEPARATION.
             *
             * Foreground = smaller separation.
             */
            const separation =
              Math.round(
                FAR_SEPARATION -
                  depth *
                    MAX_DEPTH_CHANGE
              );

            /*
             * Two eyes correspond to points on the
             * same horizontal row.
             */
            const left =
              Math.floor(
                x -
                  separation /
                    2
              );

            const right =
              left +
              separation;

            if (
              left < 0 ||
              right >= CANVAS_W
            ) {
              continue;
            }

            /*
             * Merge the two corresponding pixels.
             */
            union(
              parent,
              left,
              right
            );
          }

          /*
           * -------------------------------------------
           * ASSIGN GEOMETRIC COLORS
           * -------------------------------------------
           *
           * Every equivalence group receives a colour
           * derived from its root position.
           *
           * Therefore the carrier remains geometric
           * instead of becoming random noise.
           */

          const groupColor =
            new Int8Array(
              CANVAS_W
            );

          for (
            let x = 0;
            x < CANVAS_W;
            x++
          ) {
            groupColor[x] =
              -1;
          }

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

            if (
              groupColor[root] ===
              -1
            ) {
              /*
               * The root's position is used to sample
               * the geometric carrier.
               */
              groupColor[root] =
                geometricCarrier(
                  root,
                  y
                );
            }

            const value =
              groupColor[root];

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
         * -------------------------------------------
         * PUT FINAL IMAGE
         * -------------------------------------------
         */

        ctx.putImageData(
          image,
          0,
          0
        );

        /*
         * IMPORTANT:
         *
         * Nothing is drawn on top.
         *
         * No face.
         * No name.
         * No heart.
         * No text.
         *
         * The only information about the face is inside
         * the stereogram depth constraints.
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
          'Love Magic Eye stereogram error:',
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
        className="relative mx-auto w-full max-w-[400px] overflow-hidden rounded-[1.5rem]"
        style={{
          background:
            '#111111',
          border:
            '2px solid rgba(255,255,255,0.18)',
          boxShadow:
            '0 12px 45px rgba(0,0,0,0.18)',
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
          <div className="absolute inset-0 flex items-center justify-center bg-black/45">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>
        )}
      </div>

      <p className="mt-3 text-center text-xs font-mono uppercase tracking-[0.18em] text-gray-500">
        Magic Eye Stereogram
      </p>

      <p className="mt-2 max-w-[390px] px-4 text-center text-sm text-gray-600">
        Relax your eyes and look through the
        pattern. Keep the image still and allow
        the repeating shapes to merge.
      </p>
    </div>
  );
}
