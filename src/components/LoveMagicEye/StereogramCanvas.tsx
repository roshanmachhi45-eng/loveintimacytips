import React, { useEffect, useRef, useState } from 'react';
import type { MagicEyeConfig } from './types';

interface Props {
  config: MagicEyeConfig;
  paletteIndex: number;
  onGenerated?: (dataUrl: string) => void;
}

const WIDTH = 400;
const HEIGHT = 600;

const TILE = 48;
const BASE_SEPARATION = 92;
const MAX_DEPTH_SHIFT = 22;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function insideEllipse(
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
 * -------------------------------------------------------
 * 1. HIDDEN FACE DEPTH MAP
 * -------------------------------------------------------
 *
 * Black/background = far away
 * Higher value = closer hidden surface
 */
function createDepthMap(config: MagicEyeConfig) {
  const depth = new Float32Array(WIDTH * HEIGHT);

  const cx = WIDTH / 2;

  const faceWidth =
    config.faceStructure === 'round'
      ? 250
      : config.faceStructure === 'square'
        ? 260
        : 225;

  const faceHeight =
    config.faceStructure === 'round'
      ? 300
      : config.faceStructure === 'square'
        ? 315
        : 335;

  const faceCx = cx;
  const faceCy = 315;

  const rx = faceWidth / 2;
  const ry = faceHeight / 2;

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const i = y * WIDTH + x;

      let value = 0;

      /*
       * Main face.
       */
      if (
        insideEllipse(
          x,
          y,
          faceCx,
          faceCy,
          rx,
          ry
        )
      ) {
        const nx = (x - faceCx) / rx;
        const ny = (y - faceCy) / ry;

        const surface = Math.sqrt(
          Math.max(
            0,
            1 - nx * nx - ny * ny
          )
        );

        value = 0.30 + surface * 0.25;
      }

      /*
       * Hair.
       */
      if (config.hairStyle !== 'bald') {
        if (
          insideEllipse(
            x,
            y,
            cx,
            175,
            rx * 1.04,
            90
          )
        ) {
          value = Math.max(value, 0.55);
        }

        if (
          config.hairStyle === 'curly'
        ) {
          const curls =
            insideEllipse(
              x,
              y,
              cx - 80,
              160,
              45,
              50
            ) ||
            insideEllipse(
              x,
              y,
              cx + 80,
              160,
              45,
              50
            ) ||
            insideEllipse(
              x,
              y,
              cx - 95,
              210,
              35,
              55
            ) ||
            insideEllipse(
              x,
              y,
              cx + 95,
              210,
              35,
              55
            );

          if (curls) {
            value = Math.max(value, 0.62);
          }
        }
      }

      /*
       * Eyes.
       */
      if (
        insideEllipse(
          x,
          y,
          cx - 52,
          278,
          25,
          11
        ) ||
        insideEllipse(
          x,
          y,
          cx + 52,
          278,
          25,
          11
        )
      ) {
        value = Math.max(value, 0.86);
      }

      /*
       * Eyebrows.
       */
      if (
        insideEllipse(
          x,
          y,
          cx - 52,
          252,
          42,
          8
        ) ||
        insideEllipse(
          x,
          y,
          cx + 52,
          252,
          42,
          8
        )
      ) {
        value = Math.max(value, 0.72);
      }

      /*
       * Nose.
       */
      if (
        insideEllipse(
          x,
          y,
          cx,
          326,
          13,
          48
        )
      ) {
        value = Math.max(value, 0.76);
      }

      /*
       * Nose tip.
       */
      if (
        insideEllipse(
          x,
          y,
          cx,
          355,
          23,
          14
        )
      ) {
        value = Math.max(value, 0.92);
      }

      /*
       * Cheeks.
       */
      if (
        insideEllipse(
          x,
          y,
          cx - 72,
          340,
          38,
          28
        ) ||
        insideEllipse(
          x,
          y,
          cx + 72,
          340,
          38,
          28
        )
      ) {
        value = Math.max(value, 0.45);
      }

      /*
       * Mouth.
       */
      if (
        insideEllipse(
          x,
          y,
          cx,
          394,
          48,
          10
        )
      ) {
        value = Math.max(value, 0.91);
      }

      /*
       * Chin.
       */
      if (
        insideEllipse(
          x,
          y,
          cx,
          430,
          50,
          26
        )
      ) {
        value = Math.max(value, 0.55);
      }

      /*
       * Male beard.
       */
      if (
        config.gender === 'male' &&
        config.beardStyle !== 'clean'
      ) {
        if (
          insideEllipse(
            x,
            y,
            cx,
            395,
            105,
            92
          )
        ) {
          const beard =
            config.beardStyle === 'full'
              ? 0.67
              : config.beardStyle === 'short'
                ? 0.57
                : 0.46;

          value = Math.max(
            value,
            beard
          );
        }
      }

      depth[i] = clamp(
        value,
        0,
        1
      );
    }
  }

  return depth;
}

/*
 * -------------------------------------------------------
 * 2. REFERENCE-STYLE BLACK/WHITE CARRIER
 * -------------------------------------------------------
 */
function carrier(x: number, y: number) {
  const px =
    ((x % TILE) + TILE) % TILE;

  const py =
    ((y % TILE) + TILE) % TILE;

  const cellX =
    Math.floor(px / 8);

  const cellY =
    Math.floor(py / 8);

  let black =
    (cellX + cellY) % 2 === 0;

  /*
   * Diagonal geometric cuts.
   */
  if (
    ((px + py) % 16) < 7
  ) {
    black = !black;
  }

  /*
   * Small square blocks.
   */
  if (
    px >= 16 &&
    px < 32 &&
    py >= 16 &&
    py < 32
  ) {
    black = !black;
  }

  if (
    px >= 40 &&
    px < 48 &&
    py >= 32 &&
    py < 40
  ) {
    black = !black;
  }

  return black ? 0 : 255;
}

/*
 * -------------------------------------------------------
 * 3. SAFE AUTOSTEREOGRAM GENERATOR
 * -------------------------------------------------------
 *
 * No recursive functions.
 * No Union-Find.
 * No unbounded loops.
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

  for (let y = 0; y < HEIGHT; y++) {
    /*
     * `source[x]` tells us which earlier pixel
     * this pixel should copy.
     */
    const source =
      new Int32Array(WIDTH);

    source.fill(-1);

    /*
     * Build left/right relationships.
     */
    for (
      let x = 0;
      x < WIDTH;
      x++
    ) {
      const d =
        depth[y * WIDTH + x];

      if (d < 0.05) {
        continue;
      }

      const separation = Math.round(
        BASE_SEPARATION -
          d * MAX_DEPTH_SHIFT
      );

      const half =
        Math.floor(
          separation / 2
        );

      const left =
        x - half;

      const right =
        x + half;

      if (
        left < 0 ||
        right >= WIDTH
      ) {
        continue;
      }

      /*
       * Only create a relationship when
       * the surrounding surface is not
       * significantly closer.
       */
      const leftD =
        depth[
          y * WIDTH + left
        ];

      const rightD =
        depth[
          y * WIDTH + right
        ];

      if (
        leftD > d + 0.18 ||
        rightD > d + 0.18
      ) {
        continue;
      }

      /*
       * Left pixel copies from right pixel.
       */
      source[right] = left;
    }

    /*
     * Render this row from left to right.
     */
    for (
      let x = 0;
      x < WIDTH;
      x++
    ) {
      const s = source[x];

      if (
        s >= 0 &&
        s < x
      ) {
        output[
          y * WIDTH + x
        ] =
          output[
            y * WIDTH + s
          ];
      } else {
        output[
          y * WIDTH + x
        ] =
          carrier(x, y);
      }
    }
  }

  return output;
}

/*
 * -------------------------------------------------------
 * 4. REACT COMPONENT
 * -------------------------------------------------------
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

    /*
     * Give browser one frame to paint.
     */
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
            canvas.getContext('2d');

          if (!ctx) {
            setLoading(false);
            return;
          }

          const pixels =
            generateStereogram(
              config
            );

          if (cancelled) {
            return;
          }

          const image =
            ctx.createImageData(
              WIDTH,
              HEIGHT
            );

          for (
            let i = 0;
            i < pixels.length;
            i++
          ) {
            const value =
              pixels[i];

            const p = i * 4;

            image.data[p] = value;
            image.data[p + 1] =
              value;
            image.data[p + 2] =
              value;
            image.data[p + 3] =
              255;
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

          if (!cancelled) {
            setLoading(false);
            onGenerated?.(
              dataUrl
            );
          }
        } catch (error) {
          console.error(
            'Love Magic Eye generation failed:',
            error
          );

          /*
           * Most important:
           * never leave the UI stuck
           * on the loading screen.
           */
          if (!cancelled) {
            setLoading(false);
          }
        }
      }, 20);

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
