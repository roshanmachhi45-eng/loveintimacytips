import { useEffect, useRef, useState } from 'react';
import type { MagicEyeConfig } from './types';

interface StereogramCanvasProps {
  config: MagicEyeConfig & {
    faceStructure?: string;
    faceTone?: string;
    hairStyle?: string;
  };
  paletteIndex: number;
  generateKey: number;
  onCanvasReady?: (dataUrl: string) => void;
}

const CANVAS_W = 400;
const CANVAS_H = 600;

/*
 * ============================================================
 * LOVE MAGIC EYE — DIAGNOSTIC SIRDS ENGINE
 * ============================================================
 *
 * IMPORTANT:
 * This version intentionally contains ONE simple 3D HEART.
 *
 * No face
 * No hair
 * No beard
 * No name
 * No colour
 * No decorative overlays
 *
 * First we prove that the mathematical SIRDS engine works.
 * Once the heart is visible, we will replace the heart depth
 * map with the actual partner-face depth map.
 */

/*
 * Eye separation in pixels.
 *
 * The original SIRDS algorithm uses an eye-separation value
 * and calculates stereo separation from depth.
 *
 * With a 400px canvas, 120px gives a comfortable diagnostic
 * range on mobile.
 */
const EYE_SEPARATION = 120;

/*
 * Depth-of-field parameter from the classic SIRDS geometry.
 *
 * A slightly stronger value than the original 1/3 is used here
 * so the diagnostic heart has a clearly measurable depth change
 * on a small mobile canvas.
 */
const MU = 0.65;

/*
 * Background separation.
 *
 * At Z = 0:
 *
 * separation = E / 2
 */
const FAR_SEPARATION = Math.round(
  EYE_SEPARATION / 2
);

/*
 * Convert normalized depth Z (0 = far, 1 = near)
 * into stereo separation.
 *
 * This follows the standard SIRDS relationship:
 *
 * separation(Z) =
 *   (1 - MU * Z) * E / (2 - MU * Z)
 */
function getSeparation(depth: number): number {
  const z = Math.max(0, Math.min(1, depth));

  return Math.max(
    2,
    Math.round(
      ((1 - MU * z) * EYE_SEPARATION) /
        (2 - MU * z)
    )
  );
}

/*
 * ============================================================
 * SEEDED RANDOM
 * ============================================================
 *
 * Makes the generated diagnostic pattern stable for the same
 * configuration/generation.
 */
function createRandom(seed: number) {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;

    let t = value;

    t = Math.imul(
      t ^ (t >>> 15),
      t | 1
    );

    t ^= t + Math.imul(
      t ^ (t >>> 7),
      t | 61
    );

    return (
      (t ^ (t >>> 14)) >>> 0
    ) / 4294967296;
  };
}

/*
 * ============================================================
 * HEART DEPTH MAP
 * ============================================================
 *
 * Returns:
 *
 * 0 = background
 * 1 = closest part of heart
 *
 * The heart is deliberately large so that the diagnostic
 * shape is easy to perceive.
 */
function getHeartDepth(
  x: number,
  y: number
): number {
  const centerX = CANVAS_W / 2;
  const centerY = 285;

  const radiusX = 118;
  const radiusY = 118;

  /*
   * Classic implicit heart equation.
   *
   * Y is inverted because canvas Y increases downward.
   */
  const nx =
    (x - centerX) / radiusX;

  const ny =
    (centerY - y) / radiusY;

  const heartEquation =
    Math.pow(
      nx * nx + ny * ny - 1,
      3
    ) -
    nx *
      nx *
      Math.pow(ny, 3);

  /*
   * Outside the heart = background.
   */
  if (heartEquation > 0) {
    return 0;
  }

  /*
   * Distance from the heart centre.
   *
   * Used to make the heart rounded instead of completely flat.
   */
  const distance =
    Math.sqrt(
      nx * nx + ny * ny
    );

  const rounded =
    Math.max(
      0,
      Math.min(
        1,
        1 - distance * 0.72
      )
    );

  /*
   * Strong base depth makes the silhouette obvious.
   */
  let depth =
    0.72 +
    rounded * 0.28;

  /*
   * Slight central bulge.
   */
  const centreBulge =
    Math.max(
      0,
      1 - distance
    );

  depth +=
    centreBulge * 0.08;

  return Math.max(
    0,
    Math.min(1, depth)
  );
}

/*
 * ============================================================
 * SEED
 * ============================================================
 */
function createSeed(
  config: MagicEyeConfig,
  paletteIndex: number,
  generateKey: number
): number {
  let seed =
    generateKey * 1009 +
    paletteIndex * 9176 +
    73;

  for (
    let i = 0;
    i < config.name.length;
    i += 1
  ) {
    seed +=
      config.name.charCodeAt(i) *
      (i + 1);
  }

  seed +=
    config.gender === 'male'
      ? 311
      : 719;

  return seed >>> 0;
}

/*
 * ============================================================
 * POINTER CONSTRAINT
 * ============================================================
 *
 * This is the "same[]" constraint operation from the classic
 * SIRDS algorithm.
 *
 * It preserves one-to-one pixel relationships instead of simply
 * overwriting one side of the relationship.
 */
function addConstraint(
  same: Int32Array,
  initialLeft: number,
  initialRight: number
) {
  let left = initialLeft;
  let right = initialRight;

  let pointer = same[left];

  /*
   * Follow existing links until the two chains can be joined.
   */
  while (
    pointer !== left &&
    pointer !== right
  ) {
    if (pointer < right) {
      left = pointer;
    } else {
      same[left] = right;
      left = right;
      right = pointer;
    }

    pointer = same[left];
  }

  same[left] = right;
}

/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */
export default function StereogramCanvas({
  config,
  paletteIndex,
  generateKey,
  onCanvasReady,
}: StereogramCanvasProps) {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(
      null
    );

  const [rendering, setRendering] =
    useState(false);

  useEffect(() => {
    if (generateKey <= 0) {
      return;
    }

    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    let frameId = 0;

    setRendering(true);

    frameId =
      window.requestAnimationFrame(
        () => {
          canvas.width =
            CANVAS_W;

          canvas.height =
            CANVAS_H;

          const ctx =
            canvas.getContext(
              '2d',
              {
                alpha: false,
              }
            );

          if (!ctx) {
            setRendering(false);
            return;
          }

          const random =
            createRandom(
              createSeed(
                config,
                paletteIndex,
                generateKey
              )
            );

          /*
           * Final black/white image.
           */
          const image =
            ctx.createImageData(
              CANVAS_W,
              CANVAS_H
            );

          /*
           * ==================================================
           * PROCESS EACH SCAN LINE
           * ==================================================
           */
          for (
            let y = 0;
            y < CANVAS_H;
            y += 1
          ) {
            /*
             * same[x] = x means no constraint yet.
             */
            const same =
              new Int32Array(
                CANVAS_W
              );

            for (
              let x = 0;
              x < CANVAS_W;
              x += 1
            ) {
              same[x] = x;
            }

            /*
             * ----------------------------------------------
             * STEP 1:
             * Create depth-dependent pixel constraints.
             * ----------------------------------------------
             */
            for (
              let x = 0;
              x < CANVAS_W;
              x += 1
            ) {
              const depth =
                getHeartDepth(
                  x,
                  y
                );

              const separation =
                getSeparation(
                  depth
                );

              /*
               * Alternating odd/even rows avoid systematic
               * rounding bias, following the classic approach.
               */
              const left =
                x -
                Math.floor(
                  (
                    separation +
                    (separation &
                      y &
                      1)
                  ) / 2
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
               * --------------------------------------------
               * STEP 2:
               * Hidden-surface removal.
               *
               * A point can be visible to one eye but hidden
               * from the other. Such a pair must NOT be linked.
               * --------------------------------------------
               */
              let visible = true;

              let t = 1;

              /*
               * We only inspect positions while they remain
               * inside the current scan line.
               */
              while (
                visible &&
                t < CANVAS_W
              ) {
                const leftCheck =
                  x - t;

                const rightCheck =
                  x + t;

                if (
                  leftCheck < 0 ||
                  rightCheck >= CANVAS_W
                ) {
                  break;
                }

                /*
                 * Depth of the ray at this distance.
                 */
                const zt =
                  depth +
                  (
                    2 *
                    (
                      2 -
                      MU * depth
                    ) *
                    t
                  ) /
                    (
                      MU *
                      EYE_SEPARATION
                    );

                /*
                 * Once the ray reaches the far plane,
                 * there is no need to continue.
                 */
                if (zt >= 1) {
                  break;
                }

                /*
                 * If another surface is closer than the ray,
                 * this point is hidden from that eye.
                 */
                const leftDepth =
                  getHeartDepth(
                    leftCheck,
                    y
                  );

                const rightDepth =
                  getHeartDepth(
                    rightCheck,
                    y
                  );

                if (
                  leftDepth >= zt ||
                  rightDepth >= zt
                ) {
                  visible = false;
                  break;
                }

                t += 1;
              }

              if (!visible) {
                continue;
              }

              /*
               * --------------------------------------------
               * STEP 3:
               * Record the stereo constraint.
               * --------------------------------------------
               */
              addConstraint(
                same,
                left,
                right
              );
            }

            /*
             * =================================================
             * STEP 4:
             * Resolve the random pixels.
             *
             * Scan right-to-left, as in the reference algorithm.
             * =================================================
             */
            const row =
              new Uint8Array(
                CANVAS_W
              );

            for (
              let x =
                CANVAS_W - 1;
              x >= 0;
              x -= 1
            ) {
              if (
                same[x] === x
              ) {
                /*
                 * Free pixel:
                 * choose a random black/white dot.
                 */
                row[x] =
                  random() > 0.5
                    ? 255
                    : 0;
              } else {
                /*
                 * Constrained pixel:
                 * copy the colour from its linked pixel.
                 */
                row[x] =
                  row[same[x]];
              }
            }

            /*
             * Write row into ImageData.
             */
            const rowOffset =
              y *
              CANVAS_W *
              4;

            for (
              let x = 0;
              x < CANVAS_W;
              x += 1
            ) {
              const value =
                row[x];

              const index =
                rowOffset +
                x * 4;

              image.data[index] =
                value;

              image.data[
                index + 1
              ] = value;

              image.data[
                index + 2
              ] = value;

              image.data[
                index + 3
              ] = 255;
            }
          }

          /*
           * Put the stereogram onto the canvas.
           */
          ctx.putImageData(
            image,
            0,
            0
          );

          /*
           * ==================================================
           * CONVERGENCE GUIDE
           * ==================================================
           *
           * These two dots correspond to the FAR plane.
           *
           * Looking through the screen until these merge gives
           * the viewer the correct background convergence.
           */
          const guideY =
            CANVAS_H - 28;

          const guideLeft =
            CANVAS_W / 2 -
            FAR_SEPARATION / 2;

          const guideRight =
            CANVAS_W / 2 +
            FAR_SEPARATION / 2;

          ctx.fillStyle =
            '#111111';

          ctx.beginPath();

          ctx.arc(
            guideLeft,
            guideY,
            5,
            0,
            Math.PI * 2
          );

          ctx.fill();

          ctx.beginPath();

          ctx.arc(
            guideRight,
            guideY,
            5,
            0,
            Math.PI * 2
          );

          ctx.fill();

          /*
           * Export final image.
           */
          try {
            const dataUrl =
              canvas.toDataURL(
                'image/png'
              );

            onCanvasReady?.(
              dataUrl
            );
          } catch {
            // Canvas export failure is non-fatal.
          }

          setRendering(false);
        }
      );

    return () => {
      window.cancelAnimationFrame(
        frameId
      );
    };
  }, [
    config,
    paletteIndex,
    generateKey,
    onCanvasReady,
  ]);

  return (
    <div className="flex w-full flex-col items-center">
      <div
        id="magic-eye-canvas"
        className="relative mx-auto w-full max-w-[400px] overflow-hidden rounded-2xl"
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="block h-auto w-full"
          aria-label="Magic Eye diagnostic stereogram with a hidden 3D heart"
        />

        {rendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60">
            <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-lg">
              Building 3D stereogram...
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 w-full max-w-[400px] px-4 text-center">
        <p className="text-sm font-semibold text-gray-800">
          Magic Eye diagnostic test
        </p>

        <p className="mt-2 text-xs leading-5 text-gray-600">
          Hold the screen about 30–50 cm away.
          Look at the two dots near the bottom.
          Relax your eyes and try to look
          through the pattern rather than at it.
        </p>

        <p className="mt-2 text-xs leading-5 text-gray-500">
          When your eyes find the correct
          convergence, a large rounded 3D heart
          should appear in the pattern.
        </p>
      </div>
    </div>
  );
}
