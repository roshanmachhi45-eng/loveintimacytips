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
 * Beginner-friendly autostereogram settings.
 *
 * A larger pattern period makes the image easier to fuse on
 * phone/tablet screens than the previous very dense pattern.
 */
const PATTERN_W = 100;
const MAX_DEPTH_SHIFT = 28;

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '');

  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function seededRandom(seed: number) {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;

    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/*
 * Smooth heart mask.
 *
 * Returns 0 for background and up to 1 for the centre of
 * the heart. The gradual falloff is intentional because
 * smooth depth gradients are easier to perceive than a
 * completely flat hard-edged depth shape.
 */
function getHeartDepth(x: number, y: number): number {
  const cx = CANVAS_W / 2;
  const cy = 285;

  const px = (x - cx) / 118;
  const py = (y - cy) / 108;

  /*
   * Classic implicit heart:
   * (x²+y²-1)³ - x²y³ <= 0
   */
  const x2 = px * px;
  const y2 = py * py;

  const heartEquation =
    Math.pow(x2 + y2 - 1, 3) - x2 * Math.pow(py, 3);

  if (heartEquation > 0) {
    return 0;
  }

  /*
   * Distance-like falloff.
   * The centre becomes the strongest foreground area.
   */
  const distance = Math.sqrt(
    Math.min(1, (px * px) + (py * py))
  );

  let depth = 1 - distance * 0.72;

  /*
   * Make the upper lobes and lower point smoother.
   */
  const verticalShape = 1 - Math.min(1, Math.abs(py) * 0.25);

  depth *= verticalShape;

  return Math.max(0, Math.min(1, depth));
}

/*
 * Very subtle visible preview.
 *
 * This is NOT the stereoscopic information.
 * It is intentionally faint and blurred so a beginner
 * can understand where the hidden shape is.
 */
function drawSoftHeartPreview(
  ctx: CanvasRenderingContext2D,
  palette: ColorPalette
) {
  const cx = CANVAS_W / 2;
  const cy = 285;

  ctx.save();

  ctx.globalAlpha = 0.13;
  ctx.filter = 'blur(10px)';
  ctx.fillStyle = palette.heartColor;

  ctx.beginPath();

  ctx.moveTo(cx, cy + 100);

  ctx.bezierCurveTo(
    cx - 18,
    cy + 78,
    cx - 112,
    cy + 20,
    cx - 112,
    cy - 35
  );

  ctx.bezierCurveTo(
    cx - 112,
    cy - 82,
    cx - 55,
    cy - 100,
    cx,
    cy - 50
  );

  ctx.bezierCurveTo(
    cx + 55,
    cy - 100,
    cx + 112,
    cy - 82,
    cx + 112,
    cy - 35
  );

  ctx.bezierCurveTo(
    cx + 112,
    cy + 20,
    cx + 18,
    cy + 78,
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendering, setRendering] = useState(false);

  const render = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    setRendering(true);

    const palette: ColorPalette =
      PALETTES[paletteIndex % PALETTES.length];

    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setRendering(false);
      return;
    }

    /*
     * ----------------------------------------------------
     * 1. BACKGROUND
     * ----------------------------------------------------
     */

    const background = ctx.createLinearGradient(
      0,
      0,
      0,
      CANVAS_H
    );

    background.addColorStop(0, palette.bg);
    background.addColorStop(1, palette.bg);

    ctx.fillStyle = background;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    /*
     * ----------------------------------------------------
     * 2. CREATE A SMALL RANDOM DOT PATTERN
     * ----------------------------------------------------
     *
     * Instead of generating a completely independent
     * random field for every pixel, we create one seamless
     * horizontal strip and repeat it.
     *
     * The hidden depth changes the repeat distance.
     */

    const pattern = new Uint8ClampedArray(
      PATTERN_W * 4
    );

    const seed =
      generateKey * 928371 +
      paletteIndex * 73129 +
      config.name.length * 97;

    const random = seededRandom(seed);

    const patternColors =
      palette.patternColors.length > 0
        ? palette.patternColors
        : [palette.primary, palette.secondary];

    for (let x = 0; x < PATTERN_W; x++) {
      /*
       * Keep the dots reasonably high contrast.
       */
      const color =
        patternColors[
          Math.floor(random() * patternColors.length)
        ];

      const rgb = hexToRgb(color);

      const index = x * 4;

      pattern[index] = rgb.r;
      pattern[index + 1] = rgb.g;
      pattern[index + 2] = rgb.b;
      pattern[index + 3] = 255;
    }

    /*
     * ----------------------------------------------------
     * 3. DEPTH MAP
     * ----------------------------------------------------
     *
     * We keep the heart very large and simple for the first
     * reliable version.
     *
     * 0 = background
     * 1 = closest part of heart
     */

    const depthMap = new Float32Array(
      CANVAS_W * CANVAS_H
    );

    for (let y = 0; y < CANVAS_H; y++) {
      for (let x = 0; x < CANVAS_W; x++) {
        depthMap[y * CANVAS_W + x] =
          getHeartDepth(x, y);
      }
    }

    /*
     * ----------------------------------------------------
     * 4. BUILD AUTOSTEREOGRAM
     * ----------------------------------------------------
     *
     * Each row is independent.
     *
     * Background:
     *   repeat period = PATTERN_W
     *
     * Heart:
     *   repeat period becomes smaller
     *
     * That small change in repetition is what carries the
     * binocular disparity used by the Magic Eye illusion.
     */

    const image = ctx.createImageData(
      CANVAS_W,
      CANVAS_H
    );

    const pixels = image.data;

    for (let y = 0; y < CANVAS_H; y++) {
      const row = new Uint8ClampedArray(
        CANVAS_W * 4
      );

      for (let x = 0; x < CANVAS_W; x++) {
        const depth =
          depthMap[y * CANVAS_W + x];

        /*
         * Stronger depth = smaller repeat period.
         */
        const separation =
          PATTERN_W -
          Math.round(depth * MAX_DEPTH_SHIFT);

        /*
         * First pattern-width area is seeded directly
         * from the random pattern.
         */
        if (x < PATTERN_W) {
          const patternX = x % PATTERN_W;
          const patternIndex = patternX * 4;
          const outputIndex = x * 4;

          row[outputIndex] =
            pattern[patternIndex];

          row[outputIndex + 1] =
            pattern[patternIndex + 1];

          row[outputIndex + 2] =
            pattern[patternIndex + 2];

          row[outputIndex + 3] = 255;

          continue;
        }

        /*
         * The source pixel is shifted according to depth.
         */
        let sourceX =
          x - separation;

        /*
         * Safety boundary.
         */
        if (sourceX < 0) {
          sourceX = x % PATTERN_W;
        }

        const outputIndex = x * 4;
        const sourceIndex = sourceX * 4;

        row[outputIndex] =
          row[sourceIndex];

        row[outputIndex + 1] =
          row[sourceIndex + 1];

        row[outputIndex + 2] =
          row[sourceIndex + 2];

        row[outputIndex + 3] = 255;
      }

      /*
       * Copy row into final image.
       */
      const rowStart = y * CANVAS_W * 4;

      for (let x = 0; x < CANVAS_W * 4; x++) {
        pixels[rowStart + x] = row[x];
      }
    }

    /*
     * ----------------------------------------------------
     * 5. DRAW STEREOGRAM
     * ----------------------------------------------------
     */

    ctx.putImageData(image, 0, 0);

    /*
     * ----------------------------------------------------
     * 6. VERY SUBTLE BEGINNER PREVIEW
     * ----------------------------------------------------
     *
     * The stereogram remains the main image.
     *
     * This faint blurred heart is deliberately low opacity.
     * It gives beginners a visual clue without drawing a
     * hard obvious heart over the stereogram.
     */

    drawSoftHeartPreview(ctx, palette);

    /*
     * ----------------------------------------------------
     * 7. SMALL VIEWING GUIDE
     * ----------------------------------------------------
     *
     * Two dots near the upper part are easier to use on
     * mobile than dots placed at the bottom of a tall image.
     */

    ctx.save();

    ctx.globalAlpha = 0.72;
    ctx.fillStyle = palette.textColor;

    ctx.beginPath();
    ctx.arc(
      CANVAS_W / 2 - 18,
      34,
      3,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.beginPath();
    ctx.arc(
      CANVAS_W / 2 + 18,
      34,
      3,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.restore();

    /*
     * ----------------------------------------------------
     * 8. VERY FAINT PARTNER NAME
     * ----------------------------------------------------
     *
     * The name is intentionally NOT part of the first
     * stereogram depth test. We only show it subtly after
     * the engine has been proven stable.
     */

    if (config.name.trim()) {
      ctx.save();

      ctx.globalAlpha = 0.08;
      ctx.fillStyle = palette.textColor;
      ctx.font =
        '600 14px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';

      ctx.filter = 'blur(1px)';

      ctx.fillText(
        config.name.trim(),
        CANVAS_W / 2,
        CANVAS_H - 32
      );

      ctx.restore();
    }

    /*
     * ----------------------------------------------------
     * 9. EXPORT
     * ----------------------------------------------------
     */

    const dataUrl =
      canvas.toDataURL('image/png');

    onCanvasReady?.(dataUrl);

    setRendering(false);
  }, [
    config,
    paletteIndex,
    generateKey,
    onCanvasReady,
  ]);

  useEffect(() => {
    if (generateKey > 0) {
      const frame =
        window.requestAnimationFrame(() => {
          render();
        });

      return () => {
        window.cancelAnimationFrame(frame);
      };
    }
  }, [generateKey, render]);

  const palette: ColorPalette =
    PALETTES[paletteIndex % PALETTES.length];

  return (
    <div className="flex flex-col items-center w-full">
      <div
        className="relative w-full max-w-[400px] mx-auto"
        style={{
          boxShadow: `
            0 0 30px ${palette.primary}40,
            0 0 60px ${palette.secondary}20
          `,
          borderRadius: '1.5rem',
          overflow: 'hidden',
          border: `2px solid ${palette.primary}30`,
          background: palette.bg,
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
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
            <div
              className="h-8 w-8 rounded-full border-2 border-white/30 border-t-white animate-spin"
            />
          </div>
        )}
      </div>

      <p
        className="mt-2 text-xs font-mono uppercase tracking-widest"
        style={{
          color: palette.primary,
        }}
      >
        {palette.name} Magic Eye
      </p>

      <div
        className="mt-3 max-w-[400px] px-5 text-center"
        style={{
          color: palette.textColor,
        }}
      >
        <p className="text-sm font-medium">
          Relax your eyes and look slightly
          <span className="font-bold"> behind </span>
          the screen.
        </p>

        <p className="mt-1 text-xs opacity-70">
          The soft heart is only a gentle guide.
          Let the repeating dots merge and the
          hidden 3D heart should appear.
        </p>
      </div>
    </div>
  );
}
