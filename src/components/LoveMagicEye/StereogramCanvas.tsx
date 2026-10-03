
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
const PATTERN_W = 72;
const MAX_SHIFT = 14;

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

    // ------------------------------------------
    // 1. FACE AND FEATURE DEPTH MAP
    // ------------------------------------------

    const cx = CANVAS_W / 2;
    const cy = CANVAS_H / 2 - 30;

    const structure = config.faceStructure;
    const gender = config.gender;
    const hair = config.hairStyle;
    const beard = config.beardStyle;
    const faceTone = config.faceTone;

    const getDepth = (x: number, y: number): number => {
      let depth = 0;

      // Face proportions
      let rx = 70;
      let ry = 95;

      if (structure === 'square') {
        rx = 80;
        ry = 85;
      } else if (structure === 'round') {
        rx = 80;
        ry = 80;
      }

      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      const dist = Math.sqrt(dx * dx + dy * dy);

      // Different silhouettes for face structures
      let insideFace = false;
      let faceDepth = 0;

      if (structure === 'square') {
        const squareDist = Math.max(absDx, absDy);
        insideFace = squareDist < 1;

        if (insideFace) {
          faceDepth = (1 - squareDist) * 0.72;
        }
      } else if (structure === 'round') {
        insideFace = dist < 1;

        if (insideFace) {
          faceDepth = Math.cos(dist * Math.PI / 2) * 0.72;
        }
      } else {
        // Oval face
        insideFace = dist < 1;

        if (insideFace) {
          faceDepth = Math.cos(dist * Math.PI / 2) * 0.78;
        }
      }

      if (insideFace) {
        depth = faceDepth;

        // Cheekbone relief
        const cheekY = y - (cy + 8);
        const cheekLeft = Math.abs(x - (cx - 34));
        const cheekRight = Math.abs(x - (cx + 34));

        if (
          cheekY > -8 &&
          cheekY < 28 &&
          (cheekLeft < 18 || cheekRight < 18)
        ) {
          depth += 0.07;
        }

        // Nose bridge and tip
        const noseX = Math.abs(x - cx);
        const noseY = y - (cy - 10);

        if (noseX < 8 && noseY > 0 && noseY < 35) {
          depth += (1 - noseX / 8) * 0.25;
        }

        if (noseX < 13 && noseY >= 27 && noseY < 40) {
          depth += 0.08;
        }

        // Eye socket relief
        const eyeY = y - (cy - 17);
        const leftEyeX = Math.abs(x - (cx - 22));
        const rightEyeX = Math.abs(x - (cx + 22));

        if (
          eyeY > -5 &&
          eyeY < 5 &&
          (leftEyeX < 10 || rightEyeX < 10)
        ) {
          depth -= 0.06;
        }

        // Chin relief
        if (dy > 0.55 && absDx < 0.42) {
          depth += 0.06;
        }

        // ------------------------------------------
        // 2. MALE BEARD DEPTH
        // ------------------------------------------

        if (gender === 'male' && beard !== 'clean') {
          const jawArea =
            dy > 0.18 &&
            dy < 0.95 &&
            absDx < 0.88;

          if (jawArea) {
            if (beard === 'full') {
              depth += 0.17;
            } else if (beard === 'short') {
              depth += 0.11;
            } else if (beard === 'stubble') {
              // Gentle textured variation
              const texture =
                Math.sin(x * 1.7 + y * 0.8) *
                Math.cos(y * 1.3);

              depth += 0.045 + Math.abs(texture) * 0.035;
            }
          }
        }
      }

      // ------------------------------------------
      // 3. HAIR DEPTH
      // ------------------------------------------

      if (hair !== 'bald') {
        const hairTop = dy < -0.42 && dist < 1.35;
        const sideHair =
          absDx > 0.72 &&
          dy > -0.48 &&
          dy < 0.52 &&
          dist < 1.28;

        if (hairTop || sideHair) {
          if (hair === 'curly') {
            const curlTexture =
              Math.sin(x * 0.22) *
              Math.cos(y * 0.2);

            depth = Math.max(depth, 0.42) +
              curlTexture * 0.12;
          } else if (hair === 'straight') {
            const smoothHair =
              0.48 + (1 - Math.min(absDx, 1)) * 0.12;

            depth = Math.max(depth, smoothHair);
          }
        }
      }

      // ------------------------------------------
      // 4. FACE TONE RELIEF
      // ------------------------------------------

      // Tone adds only a subtle relief variation.
      // The selected tone remains represented by
      // the user's chosen configuration; the SIRDS
      // colors themselves are controlled by palette.
      if (faceTone === 'dark') {
        depth *= 0.97;
      } else if (faceTone === 'fair') {
        depth *= 1.03;
      }

      // ------------------------------------------
      // 5. PARTNER NAME DEPTH LAYER
      // ------------------------------------------

      const name = config.name.trim();

      if (
        name &&
        y > CANVAS_H - 100 &&
        y < CANVAS_H - 60
      ) {
        const nameWidth = Math.min(name.length * 15, 250);
        const nameLeft = cx - nameWidth / 2;
        const nameRight = cx + nameWidth / 2;

        if (x > nameLeft && x < nameRight) {
          const nameY = y - (CANVAS_H - 80);

          if (nameY > -10 && nameY < 10) {
            depth = Math.max(depth, 0.25);
          }
        }
      }

      return Math.min(Math.max(depth, 0), 1);
    };

    // ------------------------------------------
    // 6. BACKGROUND
    // ------------------------------------------

    const bgGrad = ctx.createLinearGradient(
      0,
      0,
      0,
      CANVAS_H
    );

    bgGrad.addColorStop(0, palette.bg);
    bgGrad.addColorStop(1, palette.bg);

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // ------------------------------------------
    // 7. SCATTERED STARS
    // ------------------------------------------

    const starCount = 60;

    for (let i = 0; i < starCount; i++) {
      const sx = Math.random() * CANVAS_W;
      const sy = Math.random() * CANVAS_H;
      const sr = Math.random() * 1.5 + 0.3;

      ctx.globalAlpha = Math.random() * 0.5 + 0.15;
      ctx.fillStyle = palette.starColor;

      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;

    // ------------------------------------------
    // 8. RANDOM DOT PATTERN STRIP
    // ------------------------------------------

    const patternStrip = ctx.createImageData(
      PATTERN_W,
      CANVAS_H
    );

    const pData = patternStrip.data;

    for (let y = 0; y < CANVAS_H; y++) {
      for (let x = 0; x < PATTERN_W; x++) {
        const colorIdx = Math.floor(
          Math.random() * palette.patternColors.length
        );

        const hex = palette.patternColors[colorIdx];

        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        const idx = (y * PATTERN_W + x) * 4;

        pData[idx] = r;
        pData[idx + 1] = g;
        pData[idx + 2] = b;
        pData[idx + 3] = 255;
      }
    }

    // ------------------------------------------
    // 9. SIRDS DEPTH-BASED PIXEL MAPPING
    // ------------------------------------------

    const finalImage = ctx.createImageData(
      CANVAS_W,
      CANVAS_H
    );

    const fData = finalImage.data;

    for (let y = 0; y < CANVAS_H; y++) {
      const same = new Int32Array(CANVAS_W);

      for (let x = 0; x < CANVAS_W; x++) {
        same[x] = x;
      }

      for (let x = 0; x < CANVAS_W; x++) {
        const depth = getDepth(x, y);

        const separation =
          PATTERN_W - Math.round(depth * MAX_SHIFT);

        const left = x - Math.round(separation / 2);
        const right = left + separation;

        if (left >= 0 && right < CANVAS_W) {
          same[right] = left;
        }
      }

      const rowPixels = new Uint8ClampedArray(
        CANVAS_W * 4
      );

      for (let x = 0; x < CANVAS_W; x++) {
        if (same[x] === x) {
          const patternX = x % PATTERN_W;
          const patternIdx =
            (y * PATTERN_W + patternX) * 4;

          rowPixels[x * 4] = pData[patternIdx];
          rowPixels[x * 4 + 1] = pData[patternIdx + 1];
          rowPixels[x * 4 + 2] = pData[patternIdx + 2];
          rowPixels[x * 4 + 3] = 255;
        } else {
          const sourceX = same[x];

          rowPixels[x * 4] =
            rowPixels[sourceX * 4];

          rowPixels[x * 4 + 1] =
            rowPixels[sourceX * 4 + 1];

          rowPixels[x * 4 + 2] =
            rowPixels[sourceX * 4 + 2];

          rowPixels[x * 4 + 3] = 255;
        }
      }

      for (let x = 0; x < CANVAS_W; x++) {
        const idx = (y * CANVAS_W + x) * 4;

        fData[idx] = rowPixels[x * 4];
        fData[idx + 1] = rowPixels[x * 4 + 1];
        fData[idx + 2] = rowPixels[x * 4 + 2];
        fData[idx + 3] = 255;
      }
    }

    ctx.putImageData(finalImage, 0, 0);

    // ------------------------------------------
    // 10. GLOWING HEARTS
    // ------------------------------------------

    const heartCount = 6;

    for (let i = 0; i < heartCount; i++) {
      const hx = Math.random() * CANVAS_W;
      const hy = Math.random() * CANVAS_H;
      const hs = Math.random() * 10 + 5;

      ctx.save();

      ctx.globalAlpha = Math.random() * 0.12 + 0.04;
      ctx.shadowColor = palette.heartColor;
      ctx.shadowBlur = 10;
      ctx.fillStyle = palette.heartColor;

      drawHeart(ctx, hx, hy, hs);

      ctx.restore();
    }

    // ------------------------------------------
    // 11. PARTNER NAME OVERLAY
    // ------------------------------------------

    if (config.name.trim()) {
      ctx.save();

      ctx.font = 'bold 13px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.05;
      ctx.fillStyle = palette.textColor;

      for (let y = 40; y < CANVAS_H; y += 50) {
        ctx.fillText(
          config.name.trim(),
          CANVAS_W / 2,
          y
        );
      }

      ctx.restore();
    }

    // ------------------------------------------
    // 12. EXPORT CANVAS
    // ------------------------------------------

    const dataUrl = canvas.toDataURL('image/png');

    onCanvasReady?.(dataUrl);
    setRendering(false);
  }, [config, paletteIndex, onCanvasReady]);

  useEffect(() => {
    if (generateKey > 0) {
      render();
    }
  }, [generateKey, render]);

  const palette =
    PALETTES[paletteIndex % PALETTES.length];

  return (
    <div className="flex w-full flex-col items-center">
      <div
        className="relative mx-auto w-full max-w-[400px]"
        style={{
          boxShadow: `0 0 30px ${palette.primary}40, 0 0 60px ${palette.secondary}20`,
          borderRadius: '1.5rem',
          overflow: 'hidden',
          border: `2px solid ${palette.primary}30`,
        }}
      >
        <canvas
          ref={canvasRef}
          className="block h-auto w-full"
          style={{ aspectRatio: '400 / 600' }}
        />

        {rendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          </div>
        )}
      </div>

      <p
        className="mt-2 text-xs font-mono uppercase tracking-widest"
        style={{ color: palette.primary }}
      >
        {palette.name} Matrix Engine
      </p>
    </div>
  );
}

// ------------------------------------------
// HEART DRAWING HELPER
// ------------------------------------------

function drawHeart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  ctx.beginPath();

  ctx.moveTo(x, y + size * 0.3);

  ctx.bezierCurveTo(
    x,
    y,
    x - size,
    y,
    x - size,
    y + size * 0.5
  );

  ctx.bezierCurveTo(
    x - size,
    y + size * 0.9,
    x,
    y + size * 1.1,
    x,
    y + size * 1.3
  );

  ctx.bezierCurveTo(
    x,
    y + size * 1.1,
    x + size,
    y + size * 0.9,
    x + size,
    y + size * 0.5
  );

  ctx.bezierCurveTo(
    x + size,
    y,
    x,
    y,
    x,
    y + size * 0.3
  );

  ctx.fill();
}


