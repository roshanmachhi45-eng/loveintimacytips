import { useCallback, useEffect, useRef, useState } from 'react';
import { PALETTES, type ColorPalette } from './palettes';
import type { MagicEyeConfig } from './types';

interface StereogramCanvasProps {
  config: MagicEyeConfig & { faceStructure?: string; faceTone?: string; hairStyle?: string };
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

    const palette: ColorPalette = PALETTES[paletteIndex % PALETTES.length];

    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext('2d')!;

    // ==========================================
    // 1. IN-BUILT 3D RETRO DEPTH MAP GENERATOR 
    // ==========================================
    const getDepth = (x: number, y: number): number => {
      let depth = 0;
      const cx = CANVAS_W / 2;
      const cy = CANVAS_H / 2 - 30; 

      let rx = 70;
      let ry = 95;
      const structure = config.faceStructure || 'Oval';
      
      if (structure === 'Square') { rx = 80; ry = 85; }
      else if (structure === 'Round') { rx = 80; ry = 80; }

      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 1) {
        if (structure === 'Square') {
          depth = (1 - Math.max(Math.abs(dx), Math.abs(dy))) * 0.7;
        } else {
          depth = Math.cos(dist * Math.PI / 2) * 0.7;
        }

        const noseX = Math.abs(x - cx);
        const noseY = y - (cy - 10);
        if (noseX < 8 && noseY > 0 && noseY < 35) {
          depth += (1 - noseX / 8) * 0.25;
        }

        // MALE SPECIFIC 3D FEATURES (BEARD IMPLEMENTATION)
        if (config.gender === 'Male' && config.beardStyle && config.beardStyle !== 'Clean Shaven') {
          const isJawArea = dy > 0.2 && Math.abs(dx) < 0.8;
          if (isJawArea) {
            if (config.beardStyle === 'Full Beard') {
              depth += 0.15; 
            } else if (config.beardStyle === 'Stubble') {
              depth += 0.05 + (Math.random() * 0.03); 
            } else if (config.beardStyle === 'Short Beard') {
              depth += 0.1;
            }
          }
        }
      }

      // HAIR STYLE 3D IMPLEMENTATION (MALE & FEMALE)
      const hair = config.hairStyle || 'Straight';
      if (hair !== 'Bald') {
        const isHairArea = dy < -0.4 && dist < 1.3;
        const isSideHair = Math.abs(dx) > 0.6 && dy > -0.4 && dy < 0.5;

        if (isHairArea || isSideHair) {
          if (hair === 'Curly Hair' || hair === 'Curly') {
            depth = Math.max(depth, 0.4) + Math.sin(x * 0.2) * Math.cos(y * 0.2) * 0.15;
          } else if (hair === 'Straight Hair' || hair === 'Straight') {
            depth = Math.max(depth, 0.5) + (1 - Math.abs(dx)) * 0.1;
          }
        }
      }

      // FACE TONE ADJUSTMENT
      if (config.faceTone === 'Fair / USA Type') depth *= 1.05;
      if (config.faceTone === 'Dark / West Indies') depth *= 0.95;

      // 3D NAME EMBEDDING LOGIC
      if (config.name.trim() && y > CANVAS_H - 100 && y < CANVAS_H - 60) {
        const nameX = x - (cx - (config.name.trim().length * 7));
        if (nameX > 0 && nameX < config.name.trim().length * 15) {
          depth = Math.max(depth, 0.25); 
        }
      }

      return Math.min(Math.max(depth, 0), 1);
    };

    // 2. Fill background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    bgGrad.addColorStop(0, palette.bg);
    bgGrad.addColorStop(1, palette.bg);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // 3. Draw scattered stars
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

    // 4. Generate high-density pattern strip
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

    // ==========================================
    // 5. PERFECT 1990s RETRO SIRDS ALGORITHM 
    // ==========================================
    const finalImage = ctx.createImageData(CANVAS_W, CANVAS_H);
    const fData = finalImage.data;

    for (let y = 0; y < CANVAS_H; y++) {
      const same = new Int32Array(CANVAS_W);
      for (let x = 0; x < CANVAS_W; x++) same[x] = x;

      for (let x = 0; x < CANVAS_W; x++) {
        const depth = getDepth(x, y);
        const sep = PATTERN_W - Math.round(depth * MAX_SHIFT);
        const left = x - Math.round(sep / 2);
        const right = left + sep;

        if (left >= 0 && right < CANVAS_W) {
          same[right] = left;
        }
      }

      const rowPixels = new Uint8ClampedArray(CANVAS_W * 4);
      for (let x = 0; x < CANVAS_W; x++) {
        if (same[x] === x) {
          const pX = x % PATTERN_W;
          const pIdx = (y * PATTERN_W + pX) * 4;
          rowPixels[x * 4] = pData[pIdx];
          rowPixels[x * 4 + 1] = pData[pIdx + 1];
          rowPixels[x * 4 + 2] = pData[pIdx + 2];
          rowPixels[x * 4 + 3] = 255;
        } else {
          const srcX = same[x];
          rowPixels[x * 4] = rowPixels[srcX * 4];
          rowPixels[x * 4 + 1] = rowPixels[srcX * 4 + 1];
          rowPixels[x * 4 + 2] = rowPixels[srcX * 4 + 2];
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

    // 6. Overlay glowing neon hearts
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

    // 7. Draw name as overlay text if needed
    if (config.name.trim()) {
      ctx.save();
      ctx.font = 'bold 13px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.05;
      ctx.fillStyle = palette.textColor;
      for (let y = 40; y < CANVAS_H; y += 50) {
        ctx.fillText(config.name.trim(), CANVAS_W / 2, y);
      }
      ctx.restore();
    }

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
        />
        {rendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="h-8 w-8 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          </div>
        )}
      </div>
      <p className="mt-2 text-xs font-mono uppercase tracking-widest" style={{ color: palette.primary }}>
        {palette.name} Matrix Engine
      </p>
    </div>
  );
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.3);
  ctx.bezierCurveTo(x, y, x - size, y, x - size, y + size * 0.5);
  ctx.bezierCurveTo(x - size, y + size * 0.9, x, y + size * 1.1, x, y + size * 1.3);
  ctx.bezierCurveTo(x, y + size * 1.1, x + size, y + size * 0.9, x + size, y + size * 0.5);
  ctx.bezierCurveTo(x + size, y, x, y, x, y + size * 0.3);
  ctx.fill();
}


