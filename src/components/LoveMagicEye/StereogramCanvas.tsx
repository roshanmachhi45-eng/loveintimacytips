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
 * Width of the repeating random-dot source pattern.
 * Smaller values create stronger stereoscopic repetition.
 */
const PATTERN_W = 72;

/*
 * Maximum depth displacement.
 * Kept moderate so the stereogram remains comfortable to view.
 */
const MAX_SHIFT = 14;

const FALLBACK_PALETTE = {
  name: 'Love Matrix',
  bg: '#12091f',
  primary: '#ec4899',
  secondary: '#8b5cf6',
  starColor: '#ffffff',
  heartColor: '#f472b6',
  textColor: '#ffffff',
  patternColors: [
    '#f9a8d4',
    '#c084fc',
    '#818cf8',
    '#f5d0fe',
    '#ffffff',
    '#e879f9',
  ],
};

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

    if (!canvas) {
      return;
    }

    setRendering(true);

    try {
      /*
       * ------------------------------------------------------
       * SAFE PALETTE SELECTION
       * ------------------------------------------------------
       */

      const paletteCount = Array.isArray(PALETTES)
        ? PALETTES.length
        : 0;

      const numericPaletteIndex = Number.isFinite(paletteIndex)
        ? Math.floor(paletteIndex)
        : 0;

      const safePaletteIndex =
        paletteCount > 0
          ? ((numericPaletteIndex % paletteCount) + paletteCount) %
            paletteCount
          : 0;

      const palette: ColorPalette | typeof FALLBACK_PALETTE =
        paletteCount > 0
          ? PALETTES[safePaletteIndex] ?? FALLBACK_PALETTE
          : FALLBACK_PALETTE;

      /*
       * ------------------------------------------------------
       * CANVAS SETUP
       * ------------------------------------------------------
       */

      canvas.width = CANVAS_W;
      canvas.height = CANVAS_H;

      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setRendering(false);
        return;
      }

      /*
       * ------------------------------------------------------
       * SAFE CONFIG VALUES
       * ------------------------------------------------------
       *
       * These IDs match the current types.ts:
       *
       * gender:
       *   male / female
       *
       * faceStructure:
       *   oval / round / square
       *
       * faceTone:
       *   dark / wheatish / fair
       *
       * hairStyle:
       *   bald / curly / straight
       *
       * beardStyle:
       *   clean / stubble / short / full
       */

      const gender =
        config.gender === 'male' || config.gender === 'female'
          ? config.gender
          : 'female';

      const faceStructure =
        config.faceStructure === 'round' ||
        config.faceStructure === 'square' ||
        config.faceStructure === 'oval'
          ? config.faceStructure
          : 'oval';

      const faceTone =
        config.faceTone === 'dark' ||
        config.faceTone === 'fair' ||
        config.faceTone === 'wheatish'
          ? config.faceTone
          : 'wheatish';

      const hairStyle =
        config.hairStyle === 'bald' ||
        config.hairStyle === 'curly' ||
        config.hairStyle === 'straight'
          ? config.hairStyle
          : 'straight';

      const beardStyle =
        config.beardStyle === 'clean' ||
        config.beardStyle === 'stubble' ||
        config.beardStyle === 'short' ||
        config.beardStyle === 'full'
          ? config.beardStyle
          : 'clean';

      const partnerName =
        typeof config.name === 'string'
          ? config.name.trim().slice(0, 24)
          : '';

      /*
       * ------------------------------------------------------
       * 1. BACKGROUND
       * ------------------------------------------------------
       */

      const bgColor =
        typeof palette.bg === 'string'
          ? palette.bg
          : FALLBACK_PALETTE.bg;

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      /*
       * ------------------------------------------------------
       * 2. 3D DEPTH MAP
       * ------------------------------------------------------
       *
       * This is the important SIRDS depth structure.
       *
       * Higher depth value =
       * stronger horizontal stereoscopic displacement.
       */

      const getDepth = (x: number, y: number): number => {
        const cx = CANVAS_W / 2;
        const cy = CANVAS_H / 2 - 35;

        let rx = 72;
        let ry = 96;

        /*
         * FACE STRUCTURE
         */

        if (faceStructure === 'round') {
          rx = 82;
          ry = 82;
        }

        if (faceStructure === 'square') {
          rx = 82;
          ry = 86;
        }

        if (faceStructure === 'oval') {
          rx = 72;
          ry = 98;
        }

        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;

        const distance = Math.sqrt(
          dx * dx + dy * dy,
        );

        let depth = 0;

        /*
         * --------------------------------------------------
         * MAIN HEAD VOLUME
         * --------------------------------------------------
         */

        if (distance < 1) {
          if (faceStructure === 'square') {
            const edge = Math.max(
              Math.abs(dx),
              Math.abs(dy),
            );

            depth =
              (1 - edge) *
              0.72;
          } else {
            /*
             * Oval and round faces use radial depth.
             */
            depth =
              Math.cos(
                distance * Math.PI * 0.5,
              ) * 0.72;
          }

          /*
           * ------------------------------------------------
           * FOREHEAD / CHEEKBONE SHAPING
           * ------------------------------------------------
           */

          const upperFace =
            dy < -0.1 && dy > -0.65;

          if (upperFace) {
            depth +=
              (1 - Math.abs(dx)) *
              0.045;
          }

          /*
           * ------------------------------------------------
           * NOSE / CENTRAL RELIEF
           * ------------------------------------------------
           */

          const noseX = Math.abs(x - cx);
          const noseY = y - (cy - 10);

          if (
            noseX < 8 &&
            noseY > 0 &&
            noseY < 38
          ) {
            depth +=
              (1 - noseX / 8) *
              0.23;
          }

          /*
           * ------------------------------------------------
           * NOSE BRIDGE
           * ------------------------------------------------
           */

          if (
            noseX < 5 &&
            noseY > -20 &&
            noseY < 10
          ) {
            depth +=
              (1 - noseX / 5) *
              0.12;
          }

          /*
           * ------------------------------------------------
           * EYE SOCKET RELIEF
           * ------------------------------------------------
           */

          const eyeY = y - (cy - 22);

          if (
            eyeY > -7 &&
            eyeY < 9 &&
            Math.abs(dx) > 0.18 &&
            Math.abs(dx) < 0.62
          ) {
            depth -= 0.055;
          }

          /*
           * ------------------------------------------------
           * CHEEKBONE RELIEF
           * ------------------------------------------------
           */

          const cheekY = y - (cy + 5);

          if (
            cheekY > -5 &&
            cheekY < 30 &&
            Math.abs(dx) > 0.28 &&
            Math.abs(dx) < 0.72
          ) {
            depth += 0.06;
          }

          /*
           * ------------------------------------------------
           * CHIN RELIEF
           * ------------------------------------------------
           */

          const chinY = y - (cy + 58);

          if (
            chinY > -12 &&
            chinY < 20 &&
            Math.abs(dx) < 0.42
          ) {
            depth += 0.08;
          }

          /*
           * ------------------------------------------------
           * MALE BEARD DEPTH
           * ------------------------------------------------
           */

          if (
            gender === 'male' &&
            beardStyle !== 'clean'
          ) {
            const jawArea =
              dy > 0.18 &&
              dy < 0.82 &&
              Math.abs(dx) < 0.82;

            if (jawArea) {
              if (beardStyle === 'stubble') {
                /*
                 * Very subtle micro variation.
                 */
                const grain =
                  Math.sin(x * 1.73 + y * 0.91) *
                  Math.cos(y * 1.37);

                depth +=
                  0.045 +
                  Math.max(grain, 0) * 0.025;
              }

              if (beardStyle === 'short') {
                depth += 0.095;
              }

              if (beardStyle === 'full') {
                depth += 0.15;
              }
            }
          }
        }

        /*
         * ------------------------------------------------------
         * HAIR DEPTH
         * ------------------------------------------------------
         */

        if (hairStyle !== 'bald') {
          const hairTop =
            dy < -0.42 &&
            dy > -1.35 &&
            Math.abs(dx) < 1.12;

          const sideHair =
            Math.abs(dx) > 0.62 &&
            Math.abs(dx) < 1.22 &&
            dy > -0.65 &&
            dy < 0.45;

          if (hairTop || sideHair) {
            if (hairStyle === 'curly') {
              /*
               * Curly hair uses wave-like depth.
               */
              const curlWave =
                Math.sin(x * 0.21) *
                Math.cos(y * 0.18);

              depth =
                Math.max(depth, 0.34) +
                Math.max(curlWave, 0) * 0.13;
            }

            if (hairStyle === 'straight') {
              /*
               * Straight hair gets smoother depth.
               */
              depth =
                Math.max(depth, 0.42) +
                (1 - Math.abs(dx)) * 0.08;
            }
          }
        }

        /*
         * ------------------------------------------------------
         * FACE TONE SUBTLE DEPTH VARIATION
         * ------------------------------------------------------
         *
         * These are intentionally subtle. Face tone changes
         * the depth character without changing the stereogram
         * structure completely.
         */

        if (faceTone === 'dark') {
          depth *= 0.97;
        }

        if (faceTone === 'fair') {
          depth *= 1.03;
        }

        /*
         * ------------------------------------------------------
         * PARTNER NAME DEPTH LAYER
         * ------------------------------------------------------
         *
         * Name is integrated into the depth matrix near the
         * lower portion of the image.
         */

        if (partnerName.length > 0) {
          const nameWidth = Math.min(
            partnerName.length * 9,
            220,
          );

          const nameStart =
            cx - nameWidth / 2;

          const nameEnd =
            cx + nameWidth / 2;

          const nameTop =
            CANVAS_H - 118;

          const nameBottom =
            CANVAS_H - 62;

          if (
            x >= nameStart &&
            x <= nameEnd &&
            y >= nameTop &&
            y <= nameBottom
          ) {
            /*
             * Soft horizontal wave makes the name part of the
             * depth matrix rather than a flat block.
             */
            const nameWave =
              Math.sin(
                ((x - nameStart) /
                  Math.max(nameWidth, 1)) *
                  Math.PI,
              );

            depth = Math.max(
              depth,
              0.18 + nameWave * 0.13,
            );
          }
        }

        /*
         * Keep depth within safe SIRDS range.
         */
        return Math.min(
          Math.max(depth, 0),
          1,
        );
      };

      /*
       * ------------------------------------------------------
       * 3. SUBTLE BACKGROUND GRADIENT
       * ------------------------------------------------------
       */

      const gradient = ctx.createLinearGradient(
        0,
        0,
        0,
        CANVAS_H,
      );

      gradient.addColorStop(
        0,
        bgColor,
      );

      gradient.addColorStop(
        1,
        bgColor,
      );

      ctx.fillStyle = gradient;
      ctx.fillRect(
        0,
        0,
        CANVAS_W,
        CANVAS_H,
      );

      /*
       * ------------------------------------------------------
       * 4. RANDOM STARS
       * ------------------------------------------------------
       */

      const starColor =
        typeof palette.starColor === 'string'
          ? palette.starColor
          : FALLBACK_PALETTE.starColor;

      const STAR_COUNT = 60;

      for (
        let i = 0;
        i < STAR_COUNT;
        i++
      ) {
        const sx =
          Math.random() * CANVAS_W;

        const sy =
          Math.random() * CANVAS_H;

        const sr =
          Math.random() * 1.5 + 0.3;

        ctx.save();

        ctx.globalAlpha =
          Math.random() * 0.5 + 0.15;

        ctx.fillStyle = starColor;

        ctx.beginPath();

        ctx.arc(
          sx,
          sy,
          sr,
          0,
          Math.PI * 2,
        );

        ctx.fill();

        ctx.restore();
      }

      /*
       * ------------------------------------------------------
       * 5. RANDOM DOT PATTERN STRIP
       * ------------------------------------------------------
       */

      const patternColors =
        Array.isArray(palette.patternColors) &&
        palette.patternColors.length > 0
          ? palette.patternColors
          : FALLBACK_PALETTE.patternColors;

      const patternStrip =
        ctx.createImageData(
          PATTERN_W,
          CANVAS_H,
        );

      const patternData =
        patternStrip.data;

      for (
        let y = 0;
        y < CANVAS_H;
        y++
      ) {
        for (
          let x = 0;
          x < PATTERN_W;
          x++
        ) {
          const colorIndex =
            Math.floor(
              Math.random() *
                patternColors.length,
            );

          const hex =
            patternColors[colorIndex] ??
            FALLBACK_PALETTE.patternColors[0];

          /*
           * Accept normal 6-digit hex colors.
           * If an invalid value somehow enters the palette,
           * fall back safely.
           */

          const safeHex =
            typeof hex === 'string' &&
            /^#[0-9a-fA-F]{6}$/.test(hex)
              ? hex
              : '#ffffff';

          const r = parseInt(
            safeHex.slice(1, 3),
            16,
          );

          const g = parseInt(
            safeHex.slice(3, 5),
            16,
          );

          const b = parseInt(
            safeHex.slice(5, 7),
            16,
          );

          const index =
            (y * PATTERN_W + x) * 4;

          patternData[index] = r;
          patternData[index + 1] = g;
          patternData[index + 2] = b;
          patternData[index + 3] = 255;
        }
      }

      /*
       * ------------------------------------------------------
       * 6. TRUE SIRDS IMAGE CONSTRUCTION
       * ------------------------------------------------------
       *
       * For every row:
       *
       * 1. Start with independent pixels.
       * 2. Calculate separation from depth.
       * 3. Link corresponding pixels.
       * 4. Resolve linked pixels left-to-right.
       *
       * This creates the actual stereogram structure.
       */

      const finalImage =
        ctx.createImageData(
          CANVAS_W,
          CANVAS_H,
        );

      const finalData =
        finalImage.data;

      for (
        let y = 0;
        y < CANVAS_H;
        y++
      ) {
        const same =
          new Int32Array(CANVAS_W);

        for (
          let x = 0;
          x < CANVAS_W;
          x++
        ) {
          same[x] = x;
        }

        /*
         * Build correspondence map.
         */

        for (
          let x = 0;
          x < CANVAS_W;
          x++
        ) {
          const depth =
            getDepth(x, y);

          const separation =
            PATTERN_W -
            Math.round(
              depth * MAX_SHIFT,
            );

          const left =
            x -
            Math.round(
              separation / 2,
            );

          const right =
            left + separation;

          if (
            left >= 0 &&
            right < CANVAS_W
          ) {
            /*
             * Keep the nearer/stronger mapping.
             */
            same[right] = left;
          }
        }

        /*
         * Resolve pixels for this row.
         */

        const rowPixels =
          new Uint8ClampedArray(
            CANVAS_W * 4,
          );

        for (
          let x = 0;
          x < CANVAS_W;
          x++
        ) {
          const current =
            same[x];

          if (
            current === x ||
            current < 0 ||
            current >= CANVAS_W
          ) {
            const patternX =
              ((x % PATTERN_W) +
                PATTERN_W) %
              PATTERN_W;

            const sourceIndex =
              (y * PATTERN_W +
                patternX) *
              4;

            const targetIndex =
              x * 4;

            rowPixels[targetIndex] =
              patternData[sourceIndex];

            rowPixels[targetIndex + 1] =
              patternData[sourceIndex + 1];

            rowPixels[targetIndex + 2] =
              patternData[sourceIndex + 2];

            rowPixels[targetIndex + 3] =
              255;
          } else {
            const sourceIndex =
              current * 4;

            const targetIndex =
              x * 4;

            rowPixels[targetIndex] =
              rowPixels[sourceIndex];

            rowPixels[targetIndex + 1] =
              rowPixels[sourceIndex + 1];

            rowPixels[targetIndex + 2] =
              rowPixels[sourceIndex + 2];

            rowPixels[targetIndex + 3] =
              255;
          }
        }

        /*
         * Copy resolved row into final image.
         */

        for (
          let x = 0;
          x < CANVAS_W;
          x++
        ) {
          const sourceIndex =
            x * 4;

          const targetIndex =
            (y * CANVAS_W + x) * 4;

          finalData[targetIndex] =
            rowPixels[sourceIndex];

          finalData[targetIndex + 1] =
            rowPixels[sourceIndex + 1];

          finalData[targetIndex + 2] =
            rowPixels[sourceIndex + 2];

          finalData[targetIndex + 3] =
            255;
        }
      }

      /*
       * Put the actual SIRDS pixels onto canvas.
       */

      ctx.putImageData(
        finalImage,
        0,
        0,
      );

      /*
       * ------------------------------------------------------
       * 7. SOFT NEON HEARTS
       * ------------------------------------------------------
       */

      const heartColor =
        typeof palette.heartColor === 'string'
          ? palette.heartColor
          : FALLBACK_PALETTE.heartColor;

      const HEART_COUNT = 6;

      for (
        let i = 0;
        i < HEART_COUNT;
        i++
      ) {
        const hx =
          Math.random() * CANVAS_W;

        const hy =
          Math.random() * CANVAS_H;

        const hs =
          Math.random() * 10 + 5;

        ctx.save();

        ctx.globalAlpha =
          Math.random() * 0.12 + 0.04;

        ctx.shadowColor =
          heartColor;

        ctx.shadowBlur = 10;

        ctx.fillStyle =
          heartColor;

        drawHeart(
          ctx,
          hx,
          hy,
          hs,
        );

        ctx.restore();
      }

      /*
       * ------------------------------------------------------
       * 8. TRANSLUCENT PARTNER NAME
       * ------------------------------------------------------
       */

      if (partnerName.length > 0) {
        const textColor =
          typeof palette.textColor === 'string'
            ? palette.textColor
            : FALLBACK_PALETTE.textColor;

        ctx.save();

        ctx.font =
          'bold 13px Arial, sans-serif';

        ctx.textAlign = 'center';

        ctx.textBaseline =
          'middle';

        ctx.globalAlpha = 0.055;

        ctx.fillStyle =
          textColor;

        for (
          let y = 38;
          y < CANVAS_H;
          y += 48
        ) {
          ctx.fillText(
            partnerName,
            CANVAS_W / 2,
            y,
          );
        }

        ctx.restore();
      }

      /*
       * ------------------------------------------------------
       * 9. SMALL TITLE / BRAND TEXT
       * ------------------------------------------------------
       */

      ctx.save();

      ctx.font =
        '600 10px Arial, sans-serif';

      ctx.textAlign = 'center';

      ctx.globalAlpha = 0.035;

      ctx.fillStyle =
        typeof palette.textColor === 'string'
          ? palette.textColor
          : FALLBACK_PALETTE.textColor;

      ctx.fillText(
        'LOVEONS • MAGIC EYE',
        CANVAS_W / 2,
        CANVAS_H - 24,
      );

      ctx.restore();

      /*
       * ------------------------------------------------------
       * 10. CREATE SHARE IMAGE
       * ------------------------------------------------------
       */

      const dataUrl =
        canvas.toDataURL(
          'image/png',
        );

      if (
        typeof onCanvasReady ===
        'function'
      ) {
        onCanvasReady(dataUrl);
      }
    } catch (error) {
      /*
       * Prevent the entire React page from crashing if a
       * browser canvas implementation or unexpected palette
       * value causes an exception.
       */
      console.error(
        'Love Magic Eye render error:',
        error,
      );
    } finally {
      setRendering(false);
    }
  }, [
    config,
    paletteIndex,
    onCanvasReady,
  ]);

  /*
   * --------------------------------------------------------
   * RENDER WHEN GENERATE KEY CHANGES
   * --------------------------------------------------------
   */

  useEffect(() => {
    if (generateKey > 0) {
      render();
    }
  }, [
    generateKey,
    render,
  ]);

  /*
   * --------------------------------------------------------
   * SAFE DISPLAY PALETTE
   * --------------------------------------------------------
   */

  const paletteCount =
    Array.isArray(PALETTES)
      ? PALETTES.length
      : 0;

  const safeDisplayIndex =
    paletteCount > 0
      ? ((Math.floor(
          Number.isFinite(paletteIndex)
            ? paletteIndex
            : 0,
        ) %
          paletteCount) +
          paletteCount) %
        paletteCount
      : 0;

  const displayPalette =
    PALETTES[safeDisplayIndex] ??
    FALLBACK_PALETTE;

  const primaryColor =
    typeof displayPalette.primary === 'string'
      ? displayPalette.primary
      : FALLBACK_PALETTE.primary;

  const secondaryColor =
    typeof displayPalette.secondary === 'string'
      ? displayPalette.secondary
      : FALLBACK_PALETTE.secondary;

  const paletteName =
    typeof displayPalette.name === 'string'
      ? displayPalette.name
      : FALLBACK_PALETTE.name;

  /*
   * --------------------------------------------------------
   * UI
   * --------------------------------------------------------
   */

  return (
    <div className="flex w-full flex-col items-center">
      <div
        className="relative mx-auto w-full max-w-[400px] overflow-hidden rounded-3xl"
        style={{
          boxShadow: `
            0 0 30px ${primaryColor}40,
            0 0 60px ${secondaryColor}20
          `,
          border: `2px solid ${primaryColor}30`,
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
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          </div>
        )}
      </div>

      <p
        className="mt-2 text-center font-mono text-xs uppercase tracking-widest"
        style={{
          color: primaryColor,
        }}
      >
        {paletteName} Matrix Engine
      </p>

      <p className="mt-1 px-4 text-center text-[10px] leading-relaxed text-slate-400">
        Relax your eyes and look through the pattern
        to discover the hidden 3D depth.
      </p>
    </div>
  );
}

/*
 * ----------------------------------------------------------
 * HEART DRAWING
 * ----------------------------------------------------------
 */

function drawHeart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
) {
  ctx.beginPath();

  ctx.moveTo(
    x,
    y + size * 0.3,
  );

  ctx.bezierCurveTo(
    x,
    y,
    x - size,
    y,
    x - size,
    y + size * 0.5,
  );

  ctx.bezierCurveTo(
    x - size,
    y + size * 0.9,
    x,
    y + size * 1.1,
    x,
    y + size * 1.3,
  );

  ctx.bezierCurveTo(
    x,
    y + size * 1.1,
    x + size,
    y + size * 0.9,
    x + size,
    y + size * 0.5,
  );

  ctx.bezierCurveTo(
    x + size,
    y,
    x,
    y,
    x,
    y + size * 0.3,
  );

  ctx.fill();
        }


