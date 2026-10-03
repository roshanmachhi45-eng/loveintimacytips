import { useCallback, useEffect, useRef, useState } from 'react';
import { PALETTES, type ColorPalette } from './palettes';
import { generateDepthMap, sampleDepth } from './depthMap';
import type { MagicEyeConfig } from './types';

interface StereogramCanvasProps {
  config: MagicEyeConfig;
  paletteIndex: number;
  generateKey: number;
  onCanvasReady?: (dataUrl: string) => void;
}

const CANVAS_W = 400;
const CANVAS_H = 600;
const PATTERN_W = 80;
const MAX_DEPTH = 0.35;
const EYE_SEP = PATTERN_W;

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
    const ctx = canvas.getContext('2d')!;

    // 1. Generate depth map
    const depthCanvas = generateDepthMap({
      width: CANVAS_W,
      height: CANVAS_H,
      gender: config.gender,
      beardStyle: config.beardStyle,
      name: config.name,
    });

    // 2. Fill background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    bgGrad.addColorStop(0, palette.bg[0]);
    bgGrad.addColorStop(1, palette.bg[1]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // 3. Draw scattered stars in background
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

    // 4. Generate random pattern strip
    const patternStrip = ctx.createImageData(PATTERN_W, CANVAS_H);
    const pData = patternStrip.data;

    for (let y = 0; y < CANVAS_H; y++) {
      for (let x = 0; x < PATTERN_W; x++) {
        const colorIdx = Math.floor(Math.random() * palette.patternColors.length);
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

    // 5. Create final stereogram by shifting pattern based on depth
    const finalImage = ctx.createImageData(CANVAS_W, CANVAS_H);
    const fData = finalImage.data;

    for (let y = 0; y < CANVAS_H; y++) {
      // Copy first pattern strip column
      for (let x = 0; x < PATTERN_W; x++) {
        const srcIdx = (y * PATTERN_W + x) * 4;
        const dstIdx = (y * CANVAS_W + x) * 4;
        fData[dstIdx] = pData[srcIdx];
        fData[dstIdx + 1] = pData[srcIdx + 1];
        fData[dstIdx + 2] = pData[srcIdx + 2];
        fData[dstIdx + 3] = 255;
      }

      // For remaining columns, sample from EYE_SEP pixels back,
      // shifted by depth
      for (let x = PATTERN_W; x < CANVAS_W; x++) {
        const depth = sampleDepth(depthCanvas, x, y);
        const shift = Math.round(depth * MAX_DEPTH * EYE_SEP);
        const srcX = x - EYE_SEP + shift;

        if (srcX >= 0 && srcX < CANVAS_W) {
          const srcIdx = (y * CANVAS_W + srcX) * 4;
          const dstIdx = (y * CANVAS_W + x) * 4;
          fData[dstIdx] = fData[srcIdx];
          fData[dstIdx + 1] = fData[srcIdx + 1];
          fData[dstIdx + 2] = fData[srcIdx + 2];
          fData[dstIdx + 3] = 255;
        }
      }
    }

    // 6. Blit stereogram
    ctx.putImageData(finalImage, 0, 0);

    // 7. Overlay glowing neon hearts at random positions
    const heartCount = 8;
    for (let i = 0; i < heartCount; i++) {
      const hx = Math.random() * CANVAS_W;
      const hy = Math.random() * CANVAS_H;
      const hs = Math.random() * 12 + 6;
      ctx.save();
      ctx.globalAlpha = Math.random() * 0.15 + 0.05;
      ctx.shadowColor = palette.heartColor;
      ctx.shadowBlur = 15;
      ctx.fillStyle = palette.heartColor;
      drawHeart(ctx, hx, hy, hs);
      ctx.restore();
    }

    // 8. Draw geometric connection lines (subtle)
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.08;
    for (let i = 0; i < 15; i++) {
      const x1 = Math.random() * CANVAS_W;
      const y1 = Math.random() * CANVAS_H;
      const x2 = Math.random() * CANVAS_W;
      const y2 = Math.random() * CANVAS_H;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // 9. Draw name as translucent overlay text (part of the illusion)
    if (config.name.trim()) {
      ctx.save();
      ctx.font = 'bold 14px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.06;
      ctx.fillStyle = palette.textColor;
      for (let y = 30; y < CANVAS_H; y += 40) {
        ctx.fillText(config.name.trim(), CANVAS_W / 2, y);
      }
      ctx.restore();
    }

    // 10. Export data URL
    const dataUrl = canvas.toDataURL('image/png');
    onCanvasReady?.(dataUrl);
    setRendering(false);
  }, [config, paletteIndex, onCanvasReady]);

  useEffect(() => {
    if (generateKey > 0) {
      render();
    }
  }, [generateKey, render]);

  const palette = PALETTES[paletteIndex % PALETTES.length];

  return (
    <div className="flex flex-col items-center w-full">
      <div
        className="relative w-full max-w-[400px] mx-auto"
        style={{
          boxShadow: `0 0 30px ${palette.primary}40, 0 0 60px ${palette.secondary}20`,
          borderRadius: '1.5rem',
          overflow: 'hidden',
          border: `2px solid ${palette.primary}30`,
        }}
      >
        <canvas
          ref={canvasRef}
          className="block w-full h-auto"
          style={{ aspectRatio: '400 / 600' }}
          aria-label="Magic Eye stereogram — relax your vision to see the hidden 3D image"
        />
        {rendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="h-8 w-8 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          </div>
        )}
      </div>
      <p className="mt-2 text-xs font-semibold tracking-wide" style={{ color: palette.primary }}>
        {palette.name} Pattern
      </p>
    </div>
  );
}

function drawHeart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.3);
  ctx.bezierCurveTo(
    x, y,
    x - size, y,
    x - size, y + size * 0.5
  );
  ctx.bezierCurveTo(
    x - size, y + size * 0.9,
    x, y + size * 1.1,
    x, y + size * 1.3
  );
  ctx.bezierCurveTo(
    x, y + size * 1.1,
    x + size, y + size * 0.9,
    x + size, y + size * 0.5
  );
  ctx.bezierCurveTo(
    x + size, y,
    x, y,
    x, y + size * 0.3
  );
  ctx.fill();
}
