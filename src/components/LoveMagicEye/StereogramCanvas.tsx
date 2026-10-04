import { useCallback, useEffect, useRef, useState } from 'react';
import { PALETTES } from './palettes';
import type { MagicEyeConfig } from './types';

interface StereogramCanvasProps {
  config: MagicEyeConfig;
  paletteIndex: number;
  generateKey: number;
  onCanvasReady?: (dataUrl: string) => void;
}

const WIDTH = 400;
const HEIGHT = 600;

/* -------------------------------------------------- */
/* Structural Helpers (Face Geometry Mapping)        */
/* -------------------------------------------------- */

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function ellipse(x: number, y: number, cx: number, cy: number, rx: number, ry: number) {
  const dx = (x - cx) / rx;
  const dy = (y - cy) / ry;
  return dx * dx + dy * dy;
}

function roundedBox(x: number, y: number, cx: number, cy: number, halfW: number, halfH: number, radius: number) {
  const dx = Math.abs(x - cx) - halfW + radius;
  const dy = Math.abs(y - cy) - halfH + radius;
  const ax = Math.max(dx, 0);
  const ay = Math.max(dy, 0);
  return Math.sqrt(ax * ax + ay * ay) + Math.min(Math.max(dx, dy), 0) - radius;
}

const TONE_MODIFIERS = {
  dark: { browRidge: 0.06, noseWidth: 1.18, noseTipDepth: 0.04, lipFullness: 0.10, cheekbone: 0.05 },
  wheatish: { browRidge: 0.04, noseWidth: 1.08, noseTipDepth: 0.02, lipFullness: 0.06, cheekbone: 0.03 },
  fair: { browRidge: 0.02, noseWidth: 0.92, noseTipDepth: 0.0, lipFullness: 0.03, cheekbone: 0.01 },
} as const;

function calculateFaceMap(x: number, y: number, config: MagicEyeConfig): number {
  const cx = WIDTH / 2;
  const cy = HEIGHT / 2 - 20;
  const tone = TONE_MODIFIERS[config.faceTone] ?? TONE_MODIFIERS.wheatish;
  let density = 0;

  let headRX = 80;
  let headRY = 110;
  if (config.faceStructure === 'round') { headRX = 88; headRY = 98; }
  if (config.faceStructure === 'square') { headRX = 86; headRY = 108; }

  const headValue = ellipse(x, y, cx, cy, headRX, headRY);

  if (headValue < 1) {
    density = 0.4 + (1 - headValue) * 0.3;

    // आँखें
    const leftEye = ellipse(x, y, cx - 28, cy - 12, 14, 8);
    const rightEye = ellipse(x, y, cx + 28, cy - 12, 14, 8);
    if (leftEye < 1) density -= (1 - leftEye) * 0.25;
    if (rightEye < 1) density -= (1 - rightEye) * 0.25;

    // नाक
    const nose = roundedBox(x, y, cx, cy + 15, 8 * tone.noseWidth, 25, 4);
    if (nose < 0) density += 0.35 + tone.browRidge;

    // मुँह
    const mouth = ellipse(x, y, cx, cy + 55, 20, 6);
    if (mouth < 1) density += (1 - mouth) * 0.2;

    // जबड़ा और दाढ़ी
    if (config.gender === 'male' && config.beardStyle !== 'clean') {
      const beard = ellipse(x, y, cx, cy + 60, 50, 40);
      if (beard < 1) density += 0.15;
    }
  }
  return clamp(density, 0, 1);
}

/* -------------------------------------------------- */
/* Main Component                                     */
/* -------------------------------------------------- */

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

    try {
      canvas.width = WIDTH;
      canvas.height = HEIGHT;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      const image = ctx.createImageData(WIDTH, HEIGHT);
      const pixels = image.data;

      // ग्रिड पैरामीटर्स (इमेज 2 से बिल्कुल मेल खाते हुए)
      const linePeriod = 24; // लाइनों के बीच की दूरी (पिक्सल्स में)

      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
          
          // चेहरे का प्रभाव (0 से 1 के बीच)
          const faceEffect = calculateFaceMap(x, y, config);

          // 1. बेस ग्रिड फॉर्मूला (Pure Mathematical Op-Art Matrix)
          // यह पूरे कैनवास पर बिना कटे ज़िग-ज़ैग और डायमंड ग्रिड बनाता है
          const gridX = Math.abs((x % (linePeriod * 2)) - linePeriod);
          const gridY = Math.abs((y % (linePeriod * 2)) - linePeriod);
          
          // 2. वेव मॉड्यूलेशन (चेहरे के फीचर्स के हिसाब से वेव एम्प्लीट्यूड बदलना)
          // यह फॉर्मूला लाइनों को तोड़ता नहीं है, बल्कि उन्हें एक स्मूथ फ्लो देता है
          const waveShift = faceEffect * 7.5;
          
          // डायमंड पैटर्न्स का कंबिनेशन (इमेज 2 की हुबहू नकल)
          const basePattern = Math.abs(gridX - gridY);
          
          // रेखाओं को ब्लैक और व्हाइट पट्टियों में कनवर्ट करना (थ्रेशोल्डिंग)
          let finalSignal = Math.sin((basePattern + waveShift) * (Math.PI / linePeriod));

          // किनारों को स्मूथ (Anti-aliasing) करना ताकि फटी हुई इमेज न बने
          const edgeSmoothness = 0.25;
          const normalizedSignal = clamp((finalSignal / edgeSmoothness + 1) / 2, 0, 1);
          const colorValue = Math.round(normalizedSignal * 255);

          const index = (y * WIDTH + x) * 4;
          pixels[index]     = colorValue; // R
          pixels[index + 1] = colorValue; // G
          pixels[index + 2] = colorValue; // B
          pixels[index + 3] = 255;        // A
        }
      }

      ctx.putImageData(image, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      onCanvasReady?.(dataUrl);

    } catch (error) {
      console.error('Love Op-Art grid generation error:', error);
    } finally {
      setRendering(false);
    }
  }, [config, onCanvasReady]);

  useEffect(() => {
    if (generateKey > 0) {
      render();
    }
  }, [generateKey, render]);

  const palette = PALETTES[paletteIndex % PALETTES.length];

  return (
    <div className="w-full flex flex-col items-center">
      <div
        id="magic-eye-canvas"
        className="relative w-full max-w-[400px] mx-auto overflow-hidden rounded-3xl"
        style={{
          background: '#000',
          border: `2px solid ${palette.primary}30`,
          boxShadow: `0 0 30px ${palette.primary}35, 0 0 60px ${palette.secondary}18`,
        }}
      >
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          className="block w-full h-auto"
          style={{ aspectRatio: '400 / 600' }}
        />

        {rendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/25 backdrop-blur-[2px]">
            <div className="w-9 h-9 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          </div>
        )}
      </div>

      <p
        className="mt-2 text-[10px] sm:text-xs font-mono uppercase tracking-[0.22em]"
        style={{ color: palette.primary }}
      >
        Love Illusion Art
      </p>
    </div>
  );
}



