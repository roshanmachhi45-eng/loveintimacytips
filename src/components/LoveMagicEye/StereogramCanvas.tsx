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
/* Utility Helpers                                    */
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

/* -------------------------------------------------- */
/* Face-Tone Structural Modifiers                     */
/* -------------------------------------------------- */

const TONE_MODIFIERS = {
  dark: { browRidge: 0.06, noseWidth: 1.18, noseTipDepth: 0.04, lipFullness: 0.10, cheekbone: 0.05, foreheadHeight: 0.97 },
  wheatish: { browRidge: 0.04, noseWidth: 1.08, noseTipDepth: 0.02, lipFullness: 0.06, cheekbone: 0.03, foreheadHeight: 1.0 },
  fair: { browRidge: 0.02, noseWidth: 0.92, noseTipDepth: 0.0, lipFullness: 0.03, cheekbone: 0.01, foreheadHeight: 1.03 },
} as const;

/* -------------------------------------------------- */
/* Op-Art Face Geometry Engine                        */
/* -------------------------------------------------- */

function calculateFaceDensity(x: number, y: number, config: MagicEyeConfig): number {
  const cx = WIDTH / 2;
  const cy = HEIGHT / 2 - 20;
  const tone = TONE_MODIFIERS[config.faceTone] ?? TONE_MODIFIERS.wheatish;
  let intensity = 0;

  let headRX = 76;
  let headRY = 103;
  if (config.faceStructure === 'round') { headRX = 83; headRY = 92; }
  if (config.faceStructure === 'square') { headRX = 82; headRY = 101; }

  const headValue = ellipse(x, y, cx, cy, headRX, headRY);

  if (headValue < 1) {
    intensity = 0.32 + (1 - headValue) * 0.30;

    const centerValue = ellipse(x, y, cx, cy + 2, headRX * 0.66, headRY * 0.76);
    if (centerValue < 1) intensity += (1 - centerValue) * 0.18;

    if (config.faceStructure === 'oval') {
      const jaw = ellipse(x, y, cx, cy + 48, headRX * 0.72, headRY * 0.47);
      if (jaw < 1) intensity += (1 - jaw) * 0.12;
    }
    if (config.faceStructure === 'round') {
      const jaw = ellipse(x, y, cx, cy + 45, headRX * 0.82, headRY * 0.43);
      if (jaw < 1) intensity += (1 - jaw) * 0.16;
    }
    if (config.faceStructure === 'square') {
      const jawDistance = roundedBox(x, y, cx, cy + 42, 59, 53, 18);
      if (jawDistance < 0) intensity += 0.20;
    }

    const leftCheek = ellipse(x, y, cx - 29, cy + 19, 32, 27);
    const rightCheek = ellipse(x, y, cx + 29, cy + 19, 32, 27);
    if (leftCheek < 1) intensity += (1 - leftCheek) * (0.14 + tone.cheekbone);
    if (rightCheek < 1) intensity += (1 - rightCheek) * (0.14 + tone.cheekbone);

    const leftEyeSocket = ellipse(x, y, cx - 29, cy - 12, 22, 11);
    const rightEyeSocket = ellipse(x, y, cx + 29, cy - 12, 22, 11);
    if (leftEyeSocket < 1) intensity += (1 - leftEyeSocket) * 0.16;
    if (rightEyeSocket < 1) intensity += (1 - rightEyeSocket) * 0.16;

    const leftEye = ellipse(x, y, cx - 29, cy - 12, 8, 5);
    const rightEye = ellipse(x, y, cx + 29, cy - 12, 8, 5);
    if (leftEye < 1) intensity -= (1 - leftEye) * 0.10;
    if (rightEye < 1) intensity -= (1 - rightEye) * 0.10;

    const noseBridge = roundedBox(x, y, cx, cy + 11, 8 * tone.noseWidth, 29, 5);
    if (noseBridge < 0) intensity += 0.23 + tone.browRidge;

    const noseTip = ellipse(x, y, cx, cy + 35, 15, 10);
    if (noseTip < 1) intensity += (1 - noseTip) * (0.26 + tone.noseTipDepth);

    const leftNostril = ellipse(x, y, cx - 7, cy + 38, 5, 3);
    const rightNostril = ellipse(x, y, cx + 7, cy + 38, 5, 3);
    if (leftNostril < 1) intensity -= (1 - leftNostril) * 0.09;
    if (rightNostril < 1) intensity -= (1 - rightNostril) * 0.09;

    const upperLip = ellipse(x, y, cx, cy + 55, 23, 7);
    if (upperLip < 1) intensity += (1 - upperLip) * (0.14 + tone.lipFullness);

    const mouthOpening = ellipse(x, y, cx, cy + 58, 19, 3);
    if (mouthOpening < 1) intensity -= (1 - mouthOpening) * 0.10;

    const chin = ellipse(x, y, cx, cy + 75, 30, 20);
    if (chin < 1) intensity += (1 - chin) * 0.17;

    if (config.hairStyle !== 'bald') {
      const hair = ellipse(x, y, cx, cy - 73, headRX * 1.03, 51);
      if (hair < 1) {
        if (config.hairStyle === 'straight') {
          intensity += (1 - hair) * 0.32;
        } else {
          const curlWave = Math.sin(x * 0.34) * Math.cos(y * 0.21);
          intensity += (1 - hair) * (0.28 + curlWave * 0.045);
        }
      }
      const hairline = ellipse(x, y, cx, cy - 42, headRX * 0.82, 34);
      if (hairline < 1) intensity += (1 - hairline) * 0.12;
    }

    if (config.gender === 'male' && config.beardStyle !== 'clean') {
      const beard = ellipse(x, y, cx, cy + 55, 55, 47);
      if (beard < 1) {
        if (config.beardStyle === 'stubble') intensity += (1 - beard) * 0.10;
        if (config.beardStyle === 'short') intensity += (1 - beard) * 0.17;
        if (config.beardStyle === 'full') intensity += (1 - beard) * 0.25;
      }
    }
  }

  if (config.gender === 'male') {
    const maleJaw = ellipse(x, y, cx, cy + 52, 64, 46);
    if (maleJaw < 1) intensity += (1 - maleJaw) * 0.10;
  } else {
    const feminineContour = ellipse(x, y, cx, cy + 40, 57, 54);
    if (feminineContour < 1) intensity += (1 - feminineContour) * 0.08;
  }

  return clamp(intensity, 0, 1);
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

    try {
      canvas.width = WIDTH;
      canvas.height = HEIGHT;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      const image = ctx.createImageData(WIDTH, HEIGHT);
      const pixels = image.data;

      const cx = WIDTH / 2;
      const cy = HEIGHT / 2 - 20;
      
      // लाइनों की डेंसिटी (मोटाई)। इमेज 2 से मैच करने के लिए इसे 0.14 रखा है।
      const lineFrequency = 0.14; 
      
      // यह तय करता है कि इल्यूजन आर्ट में चेहर के फीचर्स कितने गहरे उभरेंगे
      const illusionStrength = 22; 

      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
          
          // चेहरे की डेंसिटी प्राप्त करें
          const faceValue = calculateFaceDensity(x, y, config);

          // लाइन्स को बिना तोड़े मोड़ने (Shift करने) का सही गणित:
          // कोऑर्डिनेट्स की दिशा में हलका सा विस्थापन (Displacement) जोड़ना
          const offsetX = x + (faceValue * illusionStrength);
          const offsetY = y + (faceValue * illusionStrength);

          // डायमंड इल्यूजन पैटर्न फॉर्मूला (काली और सफेद ज़िग-ज़ैग पट्टियों के लिए)
          const patternValue = Math.sin((Math.abs(offsetX - cx) + Math.abs(offsetY - cy)) * lineFrequency);

          // एंटी-अलियासिंग (Smooth Boundaries) ताकि धारियां फटी हुई या पिक्सेलेटेड न दिखें
          // थ्रेशोल्ड को स्मूथली मैप किया गया है
          const edgeSmoothness = 0.15;
          const norm = patternValue / edgeSmoothness;
          const smoothValue = clamp((norm + 1) / 2, 0, 1);
          const colorValue = Math.round(smoothValue * 255);

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
      console.error('Love Op-Art generation error:', error);
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


