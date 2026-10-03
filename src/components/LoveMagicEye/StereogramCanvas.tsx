import { useCallback, useEffect, useRef, useState } from 'react';
import { PALETTES, type ColorPalette } from './palettes';
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
 * Simple beginner-friendly stereogram.
 *
 * The first version deliberately uses one large heart.
 * Once this renders correctly, we can put the personalized
 * face depth back into the same engine.
 */
const PATTERN_W = 96;
const MAX_SHIFT = 24;

function hexToRgb(hex: string) {
  const value = String(hex || '#888888').replace('#', '');

  const safe =
    value.length === 6 ? value : '888888';

  return {
    r: parseInt(safe.slice(0, 2), 16),
    g: parseInt(safe.slice(2, 4), 16),
    b: parseInt(safe.slice(4, 6), 16),
  };
}

function seededRandom(seed: number) {
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
      ((t ^ (t >>> 14)) >>> 0) /
      4294967296
    );
  };
}

/*
 * Large smooth heart depth.
 *
 * 0 = background
 * 1 = centre/closest part
 */
function getHeartDepth(
  x: number,
  y: number
): number {
  const cx = CANVAS_W / 2;
  const cy = 285;

  const px = (x - cx) / 118;
  const py = (y - cy) / 108;

  const x2 = px * px;
  const y2 = py * py;

  const equation =
    Math.pow(
      x2 + y2 - 1,
      3
    ) -
    x2 * Math.pow(py, 3);

  if (equation > 0) {
    return 0;
  }

  const distance = Math.sqrt(
    Math.min(
      1,
      px * px + py * py
    )
  );

  let depth =
    1 - distance * 0.65;

  /*
   * Smooth the depth so there is no hard
   * transition around the heart.
   */
  depth *=
    0.88 +
    Math.cos(distance * Math.PI) * 0.12;

  return Math.max(
    0,
    Math.min(1, depth)
  );
}

/*
 * Very faint visual guide.
 *
 * This is intentionally subtle.
 */
function drawSoftHeart(
  ctx: CanvasRenderingContext2D,
  color: string
) {
  const cx = CANVAS_W / 2;
  const cy = 285;

  ctx.save();

  ctx.globalAlpha = 0.12;
  ctx.filter = 'blur(9px)';
  ctx.fillStyle = color;

  ctx.beginPath();

  ctx.moveTo(
    cx,
    cy + 100
  );

  ctx.bezierCurveTo(
    cx - 20,
    cy + 75,
    cx - 112,
    cy + 22,
    cx - 112,
    cy - 35
  );

  ctx.bezierCurveTo(
    cx - 112,
    cy - 84,
    cx - 55,
    cy - 100,
    cx,
    cy - 48
  );

  ctx.bezierCurveTo(
    cx + 55,
    cy - 100,
    cx + 112,
    cy - 84,
    cx + 112,
    cy - 35
  );

  ctx.bezierCurveTo(
    cx + 112,
    cy + 22,
    cx + 20,
    cy + 75,
    cx,
    cy + 100
  );

  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

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

    if (!canvas) {
      return;
    }

    setRendering(true);

    try {
      const palette: ColorPalette =
        PALETTES[
          paletteIndex %
            PALETTES.length
        ];

      /*
       * ------------------------------------------------
       * CANVAS SETUP
       * ------------------------------------------------
       */

      canvas.width = CANVAS_W;
      canvas.height = CANVAS_H;

      const ctx =
        canvas.getContext('2d');

      if (!ctx) {
        return;
      }

      /*
       * ------------------------------------------------
       * BACKGROUND
       * ------------------------------------------------
       */

      ctx.fillStyle =
        palette.bg || '#111827';

      ctx.fillRect(
        0,
        0,
        CANVAS_W,
        CANVAS_H
      );

      /*
       * ------------------------------------------------
       * SAFE PATTERN COLORS
       * ------------------------------------------------
       *
       * Do NOT assume patternColors exists.
       */

      const paletteObject =
        palette as ColorPalette & {
          patternColors?: string[];
          heartColor?: string;
          textColor?: string;
        };

      const availableColors =
        Array.isArray(
          paletteObject.patternColors
        ) &&
        paletteObject.patternColors.length
          ? paletteObject.patternColors
          : [
              palette.primary ||
                '#8b5cf6',
              palette.secondary ||
                '#ec4899',
              '#ffffff',
            ];

      /*
       * ------------------------------------------------
       * RANDOM PATTERN
       * ------------------------------------------------
       */

      const pattern =
        new Uint8ClampedArray(
          PATTERN_W * 4
        );

      const random =
        seededRandom(
          generateKey * 7919 +
            paletteIndex * 997 +
            config.name.length * 31
        );

      for (
        let x = 0;
        x < PATTERN_W;
        x++
      ) {
        const color =
          availableColors[
            Math.floor(
              random() *
                availableColors.length
            )
          ];

        const rgb =
          hexToRgb(color);

        const index =
          x * 4;

        pattern[index] =
          rgb.r;

        pattern[index + 1] =
          rgb.g;

        pattern[index + 2] =
          rgb.b;

        pattern[index + 3] =
          255;
      }

      /*
       * ------------------------------------------------
       * FINAL IMAGE
       * ------------------------------------------------
       */

      const image =
        ctx.createImageData(
          CANVAS_W,
          CANVAS_H
        );

      const output =
        image.data;

      /*
       * ------------------------------------------------
       * ROW-BY-ROW STEREOGRAM
       * ------------------------------------------------
       */

      for (
        let y = 0;
        y < CANVAS_H;
        y++
      ) {
        const row =
          new Uint8ClampedArray(
            CANVAS_W * 4
          );

        for (
          let x = 0;
          x < CANVAS_W;
          x++
        ) {
          const depth =
            getHeartDepth(
              x,
              y
            );

          /*
           * Background repeats every PATTERN_W.
           *
           * Heart gradually reduces the repetition
           * distance, creating the hidden depth.
           */
          const separation =
            PATTERN_W -
            Math.round(
              depth * MAX_SHIFT
            );

          let sourceX =
            x - separation;

          /*
           * The beginning of every row is seeded
           * directly from the random pattern.
           */
          if (
            x < PATTERN_W
          ) {
            sourceX =
              x % PATTERN_W;

            const source =
              sourceX * 4;

            const target =
              x * 4;

            row[target] =
              pattern[source];

            row[target + 1] =
              pattern[source + 1];

            row[target + 2] =
              pattern[source + 2];

            row[target + 3] =
              255;

            continue;
          }

          /*
           * Safety clamp.
           */
          if (
            sourceX < 0
          ) {
            sourceX =
              x % PATTERN_W;
          }

          if (
            sourceX >= x
          ) {
            sourceX =
              x - 1;
          }

          const source =
            sourceX * 4;

          const target =
            x * 4;

          row[target] =
            row[source];

          row[target + 1] =
            row[source + 1];

          row[target + 2] =
            row[source + 2];

          row[target + 3] =
            255;
        }

        /*
         * Copy completed row.
         */
        const rowStart =
          y * CANVAS_W * 4;

        output.set(
          row,
          rowStart
        );
      }

      /*
       * ------------------------------------------------
       * DRAW GENERATED IMAGE
       * ------------------------------------------------
       */

      ctx.putImageData(
        image,
        0,
        0
      );

      /*
       * ------------------------------------------------
       * VERY FAINT HEART GUIDE
       * ------------------------------------------------
       */

      drawSoftHeart(
        ctx,
        paletteObject.heartColor ||
          palette.primary ||
          '#ec4899'
      );

      /*
       * ------------------------------------------------
       * VIEWING DOTS
       * ------------------------------------------------
       */

      ctx.save();

      ctx.globalAlpha = 0.7;

      ctx.fillStyle =
        paletteObject.textColor ||
        '#ffffff';

      ctx.beginPath();

      ctx.arc(
        CANVAS_W / 2 - 18,
        32,
        3,
        0,
        Math.PI * 2
      );

      ctx.fill();

      ctx.beginPath();

      ctx.arc(
        CANVAS_W / 2 + 18,
        32,
        3,
        0,
        Math.PI * 2
      );

      ctx.fill();

      ctx.restore();

      /*
       * ------------------------------------------------
       * PARTNER NAME
       * ------------------------------------------------
       *
       * Only a subtle visible label for now.
       * We will integrate the name into the depth map
       * after the heart engine is confirmed.
       */

      if (
        config.name &&
        config.name.trim()
      ) {
        ctx.save();

        ctx.globalAlpha =
          0.08;

        ctx.filter =
          'blur(1px)';

        ctx.fillStyle =
          paletteObject.textColor ||
          palette.primary ||
          '#ffffff';

        ctx.font =
          '600 14px system-ui, sans-serif';

        ctx.textAlign =
          'center';

        ctx.fillText(
          config.name.trim(),
          CANVAS_W / 2,
          CANVAS_H - 30
        );

        ctx.restore();
      }

      /*
       * ------------------------------------------------
       * SHARE IMAGE
       * ------------------------------------------------
       */

      const dataUrl =
        canvas.toDataURL(
          'image/png'
        );

      if (onCanvasReady) {
        onCanvasReady(
          dataUrl
        );
      }
    } catch (error) {
      /*
       * Important:
       * A rendering error must NEVER leave the
       * loading spinner permanently active.
       */
      console.error(
        'Love Magic Eye rendering error:',
        error
      );
    } finally {
      setRendering(false);
    }
  }, [
    config,
    paletteIndex,
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
        () => {
          render();
        }
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

  const palette: ColorPalette =
    PALETTES[
      paletteIndex %
        PALETTES.length
    ];

  return (
    <div className="flex w-full flex-col items-center">
      <div
        className="relative mx-auto w-full max-w-[400px]"
        style={{
          boxShadow: `
            0 0 30px ${
              palette.primary || '#8b5cf6'
            }40,
            0 0 60px ${
              palette.secondary || '#ec4899'
            }20
          `,
          borderRadius:
            '1.5rem',
          overflow:
            'hidden',
          border: `2px solid ${
            palette.primary ||
            '#8b5cf6'
          }30`,
          background:
            palette.bg ||
            '#111827',
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
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>
        )}
      </div>

      <p
        className="mt-2 text-xs font-mono uppercase tracking-widest"
        style={{
          color:
            palette.primary ||
            '#8b5cf6',
        }}
      >
        {palette.name} Magic Eye
      </p>

      <div
        className="mt-3 max-w-[400px] px-5 text-center"
        style={{
          color:
            palette.textColor ||
            palette.primary ||
            '#8b5cf6',
        }}
      >
        <p className="text-sm font-medium">
          Relax your eyes and look
          slightly behind the screen.
        </p>

        <p className="mt-1 text-xs opacity-70">
          A soft heart guide is
          visible while the hidden
          3D pattern is generated.
        </p>
      </div>
    </div>
  );
}
