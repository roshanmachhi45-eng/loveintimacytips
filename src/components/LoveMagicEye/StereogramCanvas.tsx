import React, { useEffect, useRef, useState } from 'react';
import type { MagicEyeConfig } from './types';

interface Props {
  config: MagicEyeConfig;
  paletteIndex: number;
  onGenerated?: (dataUrl: string) => void;
}

const WIDTH = 400;
const HEIGHT = 600;

/*
 * =========================================================
 * REFERENCE-STYLE MAGIC EYE
 * =========================================================
 *
 * The carrier is deliberately made from:
 * - rectangular blocks
 * - vertical bands
 * - horizontal bands
 * - repeating black/white geometry
 *
 * NO triangles.
 * NO random dots.
 * NO visible face drawing.
 *
 * The face exists only inside the depth map.
 */

const TILE_WIDTH = 56;
const BLOCK = 7;

/*
 * Stereo parameters.
 *
 * Far background has larger separation.
 * Face/features have progressively smaller separation.
 */
const FAR_SEPARATION = 92;
const MAX_DEPTH_SHIFT = 28;

/*
 * ---------------------------------------------------------
 * Utility
 * ---------------------------------------------------------
 */

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(min, Math.min(max, value));
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

  return dx * dx + dy * dy <= 1;
}

/*
 * ---------------------------------------------------------
 * FACE DEPTH MAP
 * ---------------------------------------------------------
 *
 * 0 = background
 * 0.3-0.6 = face/head
 * 0.7-1.0 = facial features
 *
 * The hidden face is intentionally large.
 */
function createDepthMap(
  config: MagicEyeConfig
) {
  const depth =
    new Float32Array(
      WIDTH * HEIGHT
    );

  const cx = WIDTH / 2;

  let faceRx = 112;
  let faceRy = 165;

  if (config.faceStructure === 'round') {
    faceRx = 125;
    faceRy = 155;
  }

  if (config.faceStructure === 'square') {
    faceRx = 128;
    faceRy = 160;
  }

  /*
   * Slightly above centre so the complete face
   * remains comfortably inside the image.
   */
  const faceCy = 315;

  for (
    let y = 0;
    y < HEIGHT;
    y++
  ) {
    for (
      let x = 0;
      x < WIDTH;
      x++
    ) {
      const index =
        y * WIDTH + x;

      let d = 0;

      /*
       * ===================================================
       * MAIN HEAD
       * ===================================================
       */

      const insideHead =
        ellipse(
          x,
          y,
          cx,
          faceCy,
          faceRx,
          faceRy
        );

      if (insideHead) {
        const nx =
          (x - cx) / faceRx;

        const ny =
          (y - faceCy) / faceRy;

        /*
         * Rounded 3D surface.
         */
        const sphere =
          Math.sqrt(
            Math.max(
              0,
              1 -
                nx * nx -
                ny * ny
            )
          );

        d =
          0.28 +
          sphere * 0.27;
      }

      /*
       * ===================================================
       * HAIR
       * ===================================================
       */

      if (
        config.hairStyle !==
        'bald'
      ) {
        const hairTop =
          ellipse(
            x,
            y,
            cx,
            175,
            faceRx * 1.05,
            88
          );

        if (hairTop) {
          d = Math.max(
            d,
            0.56
          );
        }

        /*
         * Hair sides.
         */
        const leftHair =
          ellipse(
            x,
            y,
            cx - faceRx * 0.82,
            220,
            34,
            80
          );

        const rightHair =
          ellipse(
            x,
            y,
            cx + faceRx * 0.82,
            220,
            34,
            80
          );

        if (
          leftHair ||
          rightHair
        ) {
          d = Math.max(
            d,
            0.52
          );
        }

        /*
         * Curly hair gets several rounded masses.
         */
        if (
          config.hairStyle ===
          'curly'
        ) {
          const curl1 =
            ellipse(
              x,
              y,
              cx - 78,
              150,
              35,
              38
            );

          const curl2 =
            ellipse(
              x,
              y,
              cx + 78,
              150,
              35,
              38
            );

          const curl3 =
            ellipse(
              x,
              y,
              cx - 92,
              205,
              30,
              45
            );

          const curl4 =
            ellipse(
              x,
              y,
              cx + 92,
              205,
              30,
              45
            );

          if (
            curl1 ||
            curl2 ||
            curl3 ||
            curl4
          ) {
            d = Math.max(
              d,
              0.64
            );
          }
        }
      }

      /*
       * ===================================================
       * EYEBROWS
       * ===================================================
       */

      if (
        ellipse(
          x,
          y,
          cx - 52,
          252,
          42,
          7
        ) ||
        ellipse(
          x,
          y,
          cx + 52,
          252,
          42,
          7
        )
      ) {
        d = Math.max(
          d,
          0.72
        );
      }

      /*
       * ===================================================
       * EYES
       * ===================================================
       */

      if (
        ellipse(
          x,
          y,
          cx - 52,
          278,
          25,
          11
        ) ||
        ellipse(
          x,
          y,
          cx + 52,
          278,
          25,
          11
        )
      ) {
        d = Math.max(
          d,
          0.86
        );
      }

      /*
       * Pupils create small high-depth points.
       */
      if (
        ellipse(
          x,
          y,
          cx - 52,
          278,
          7,
          7
        ) ||
        ellipse(
          x,
          y,
          cx + 52,
          278,
          7,
          7
        )
      ) {
        d = Math.max(
          d,
          0.96
        );
      }

      /*
       * ===================================================
       * NOSE
       * ===================================================
       */

      if (
        ellipse(
          x,
          y,
          cx,
          323,
          13,
          47
        )
      ) {
        d = Math.max(
          d,
          0.76
        );
      }

      if (
        ellipse(
          x,
          y,
          cx,
          356,
          23,
          13
        )
      ) {
        d = Math.max(
          d,
          0.94
        );
      }

      /*
       * ===================================================
       * CHEEKS
       * ===================================================
       */

      if (
        ellipse(
          x,
          y,
          cx - 70,
          338,
          40,
          28
        ) ||
        ellipse(
          x,
          y,
          cx + 70,
          338,
          40,
          28
        )
      ) {
        d = Math.max(
          d,
          0.48
        );
      }

      /*
       * ===================================================
       * MOUTH
       * ===================================================
       */

      if (
        ellipse(
          x,
          y,
          cx,
          395,
          50,
          10
        )
      ) {
        d = Math.max(
          d,
          0.90
        );
      }

      /*
       * Lower lip.
       */
      if (
        ellipse(
          x,
          y,
          cx,
          404,
          32,
          7
        )
      ) {
        d = Math.max(
          d,
          0.82
        );
      }

      /*
       * ===================================================
       * CHIN
       * ===================================================
       */

      if (
        ellipse(
          x,
          y,
          cx,
          435,
          48,
          27
        )
      ) {
        d = Math.max(
          d,
          0.56
        );
      }

      /*
       * ===================================================
       * MALE BEARD
       * ===================================================
       */

      if (
        config.gender ===
          'male' &&
        config.beardStyle !==
          'clean'
      ) {
        const beard =
          ellipse(
            x,
            y,
            cx,
            398,
            104,
            88
          );

        if (beard) {
          let beardDepth =
            0.48;

          if (
            config.beardStyle ===
            'stubble'
          ) {
            beardDepth =
              0.48;
          }

          if (
            config.beardStyle ===
            'short'
          ) {
            beardDepth =
              0.58;
          }

          if (
            config.beardStyle ===
            'full'
          ) {
            beardDepth =
              0.68;
          }

          d = Math.max(
            d,
            beardDepth
          );
        }

        /*
         * Keep lips/nose readable.
         */
        if (
          ellipse(
            x,
            y,
            cx,
            395,
            50,
            10
          )
        ) {
          d = Math.max(
            d,
            0.90
          );
        }
      }

      /*
       * ===================================================
       * FEMALE FACE CONTOUR
       * ===================================================
       */

      if (
        config.gender ===
        'female'
      ) {
        if (
          ellipse(
            x,
            y,
            cx,
            385,
            faceRx * 0.72,
            105
          )
        ) {
          d = Math.max(
            d,
            0.42
          );
        }
      }

      depth[index] =
        clamp(d, 0, 1);
    }
  }

  return depth;
}

/*
 * =========================================================
 * REFERENCE CARRIER
 * =========================================================
 *
 * This is the visual pattern the user sees.
 *
 * Important:
 * There are NO triangles.
 *
 * The carrier is made from:
 * - black/white vertical bars
 * - rectangular blocks
 * - stepped geometric sections
 *
 * It repeats every TILE_WIDTH pixels.
 */
function getCarrierPixel(
  x: number,
  y: number
) {
  const px =
    ((x % TILE_WIDTH) +
      TILE_WIDTH) %
    TILE_WIDTH;

  const py =
    ((y % TILE_WIDTH) +
      TILE_WIDTH) %
    TILE_WIDTH;

  const bx =
    Math.floor(px / BLOCK);

  const by =
    Math.floor(py / BLOCK);

  /*
   * Main checker structure.
   */
  let black =
    (bx + by) % 2 === 0;

  /*
   * Vertical blocks.
   */
  if (
    bx === 1 ||
    bx === 4 ||
    bx === 6
  ) {
    black = !black;
  }

  /*
   * Horizontal rectangular sections.
   */
  if (
    by === 2 ||
    by === 5
  ) {
    black = !black;
  }

  /*
   * Large rectangular centre block.
   */
  if (
    px >= 21 &&
    px < 35 &&
    py >= 21 &&
    py < 35
  ) {
    black = true;
  }

  /*
   * White centre cut.
   */
  if (
    px >= 24 &&
    px < 32 &&
    py >= 24 &&
    py < 32
  ) {
    black = false;
  }

  return black
    ? 0
    : 255;
}

/*
 * =========================================================
 * SAFE AUTOSTEREOGRAM
 * =========================================================
 *
 * Each row is generated independently.
 *
 * We create equivalence groups without recursive
 * operations and then fill them from the geometric carrier.
 */
function generateStereogram(
  config: MagicEyeConfig
) {
  const depth =
    createDepthMap(config);

  const output =
    new Uint8ClampedArray(
      WIDTH * HEIGHT
    );

  for (
    let y = 0;
    y < HEIGHT;
    y++
  ) {
    /*
     * Parent relationship for this row.
     */
    const parent =
      new Int32Array(WIDTH);

    for (
      let x = 0;
      x < WIDTH;
      x++
    ) {
      parent[x] = x;
    }

    /*
     * Find root.
     */
    const find = (
      start: number
    ) => {
      let root = start;

      let guard = 0;

      while (
        parent[root] !== root &&
        guard < WIDTH
      ) {
        root =
          parent[root];
        guard++;
      }

      return root;
    };

    /*
     * Join two pixels.
     */
    const join = (
      a: number,
      b: number
    ) => {
      const ra = find(a);
      const rb = find(b);

      if (ra === rb) {
        return;
      }

      if (ra < rb) {
        parent[rb] = ra;
      } else {
        parent[ra] = rb;
      }
    };

    /*
     * Create stereoscopic constraints.
     */
    for (
      let x = 0;
      x < WIDTH;
      x++
    ) {
      const d =
        depth[
          y * WIDTH + x
        ];

      if (d <= 0.02) {
        continue;
      }

      /*
       * Deeper/closer areas get
       * smaller separation.
       */
      const separation =
        Math.round(
          FAR_SEPARATION -
            d *
              MAX_DEPTH_SHIFT
        );

      const left =
        x -
        Math.floor(
          separation / 2
        );

      const right =
        left + separation;

      if (
        left < 0 ||
        right >= WIDTH
      ) {
        continue;
      }

      /*
       * Hidden surface protection.
       *
       * If either side already belongs to
       * a significantly closer feature,
       * do not create this constraint.
       */
      const leftDepth =
        depth[
          y * WIDTH + left
        ];

      const rightDepth =
        depth[
          y * WIDTH + right
        ];

      if (
        leftDepth >
          d + 0.16 ||
        rightDepth >
          d + 0.16
      ) {
        continue;
      }

      join(
        left,
        right
      );
    }

    /*
     * Every equivalence group receives
     * one carrier pixel.
     */
    const groupValue =
      new Int16Array(WIDTH);

    groupValue.fill(-1);

    for (
      let x = 0;
      x < WIDTH;
      x++
    ) {
      const root =
        find(x);

      if (
        groupValue[root] ===
        -1
      ) {
        groupValue[root] =
          getCarrierPixel(
            x,
            y
          );
      }

      output[
        y * WIDTH + x
      ] =
        groupValue[root];
    }
  }

  return output;
}

/*
 * =========================================================
 * COMPONENT
 * =========================================================
 */

export default function StereogramCanvas({
  config,
  paletteIndex,
  onGenerated,
}: Props) {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);

    const timer =
      window.setTimeout(() => {
        try {
          if (cancelled) {
            return;
          }

          const canvas =
            canvasRef.current;

          if (!canvas) {
            setLoading(false);
            return;
          }

          const ctx =
            canvas.getContext(
              '2d',
              {
                alpha: false,
              }
            );

          if (!ctx) {
            setLoading(false);
            return;
          }

          /*
           * Generate the hidden image.
           */
          const pixels =
            generateStereogram(
              config
            );

          if (cancelled) {
            return;
          }

          const imageData =
            ctx.createImageData(
              WIDTH,
              HEIGHT
            );

          for (
            let i = 0;
            i < pixels.length;
            i++
          ) {
            const p = i * 4;
            const value =
              pixels[i];

            imageData.data[p] =
              value;

            imageData.data[p + 1] =
              value;

            imageData.data[p + 2] =
              value;

            imageData.data[p + 3] =
              255;
          }

          ctx.putImageData(
            imageData,
            0,
            0
          );

          const dataUrl =
            canvas.toDataURL(
              'image/png'
            );

          if (!cancelled) {
            setLoading(false);

            if (onGenerated) {
              onGenerated(
                dataUrl
              );
            }
          }
        } catch (error) {
          console.error(
            'Love Magic Eye error:',
            error
          );

          if (!cancelled) {
            setLoading(false);
          }
        }
      }, 30);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    config,
    paletteIndex,
    onGenerated,
  ]);

  return (
    <div
      id="magic-eye-canvas"
      className="relative mx-auto w-full max-w-[400px] overflow-hidden rounded-2xl bg-white"
    >
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        className="block h-auto w-full"
        aria-label="Love Magic Eye hidden stereogram"
      />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/20 border-t-black" />

            <span className="text-sm text-black/70">
              Creating your hidden image...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
