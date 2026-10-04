import { useCallback, useState } from 'react';
import { Eye, RefreshCw, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Seo from '../Seo';
import ConfigurationForm from './ConfigurationForm';
import StereogramCanvas from './StereogramCanvas';
import ViralShareCard from './ViralShareCard';
import { DEFAULT_CONFIG, type MagicEyeConfig } from './types';
import { PALETTES, getRandomPalette } from './palettes';

const ROMANTIC_LINES = [
  'Your love shines brighter than any star in the galaxy.',
  'Two souls, one hidden universe waiting to be discovered.',
  'The magic between you two is written in the stars.',
  'Every glance reveals a love deeper than words can say.',
  'Your hearts beat in perfect harmony, seen and unseen.',
  'A connection so pure, it transcends the visible world.',
  'In the hidden depths, your love story is etched forever.',
  'The aura of your bond glows with cosmic energy.',
];

export default function LoveMagicEye() {
  const [config, setConfig] = useState<MagicEyeConfig>(DEFAULT_CONFIG);
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [generateKey, setGenerateKey] = useState(0);
  const [formCollapsed, setFormCollapsed] = useState(false);
  const [canvasDataUrl, setCanvasDataUrl] = useState('');

  const handleGenerate = useCallback(() => {
    const newIdx = getRandomPalette(paletteIndex);
    setPaletteIndex(newIdx);
    setGenerateKey((prev) => prev + 1);
    setFormCollapsed(true);

    // Scroll to canvas
    window.setTimeout(() => {
      document.getElementById('magic-eye-canvas')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 100);
  }, [paletteIndex]);

  const handleRegenerate = useCallback(() => {
    const newIdx = getRandomPalette(paletteIndex);
    setPaletteIndex(newIdx);
    setGenerateKey((prev) => prev + 1);
  }, [paletteIndex]);

  const handleReset = useCallback(() => {
    setFormCollapsed(false);
    setGenerateKey(0);
    setCanvasDataUrl('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCanvasReady = useCallback((dataUrl: string) => {
    setCanvasDataUrl(dataUrl);
  }, []);

  return (
    <>
      <Seo
        title="Love Magic Eye — Decode Your Partner's Hidden 3D Aura | Loveons.com"
        description="Generate a personalized 3D Magic Eye stereogram of your partner's aura. Relax your vision and discover the hidden holographic energy of your relationship."
        path="/love-magic-eye"
      />

      <div className="mx-auto max-w-md px-1">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-violet-200">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-slate-900">
                Love Magic Eye
              </h1>
              <p className="text-xs text-slate-400">
                Decode your partner's hidden 3D aura
              </p>
            </div>
          </div>

          <Link
            to="/"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition-all hover:border-violet-200 hover:bg-violet-50 hover:text-violet-500"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        {/* Configuration Form (collapsible) */}
        <ConfigurationForm
          config={config}
          onChange={setConfig}
          onGenerate={handleGenerate}
          collapsed={formCollapsed}
        />

        {/* Stereogram Canvas */}
        {generateKey > 0 && (
          <div id="magic-eye-canvas" className="mt-5 scroll-mt-24">
            <StereogramCanvas
              config={config}
              paletteIndex={paletteIndex}
              generateKey={generateKey}
              onCanvasReady={handleCanvasReady}
            />

            {/* Partner name + romantic line below the image */}
            {generateKey > 0 && (
              <div className="mt-4 text-center">
                <p
                  className="font-display text-2xl font-bold"
                  style={{
                    background:
                      'linear-gradient(to right, #8b5cf6, #ec4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {config.name.trim() || 'Your Partner'}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {ROMANTIC_LINES[
                    Math.floor(
                      Math.random() * ROMANTIC_LINES.length
                    )
                  ]}
                </p>
              </div>
            )}

            {/* Viral Share Card with countdown */}
            <ViralShareCard
              config={config}
              canvasDataUrl={canvasDataUrl}
              paletteName={PALETTES[paletteIndex % PALETTES.length].name}
            />

            {/* Action Buttons */}
            <div className="mt-4 flex gap-2.5">
              <button
                type="button"
                onClick={handleRegenerate}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-violet-200 bg-white px-4 py-3 text-sm font-semibold text-violet-600 transition-all hover:bg-violet-50 active:scale-95"
              >
                <RefreshCw className="h-4 w-4" />
                New Pattern
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-pink-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition-all hover:-translate-y-0.5 active:scale-95"
              >
                Start Over
              </button>
            </div>
          </div>
        )}

        {/* Info section when no generation yet */}
        {generateKey === 0 && (
          <div className="mt-4 rounded-2xl border border-violet-100 bg-violet-50/50 p-5 text-center">
            <p className="text-sm leading-relaxed text-slate-600">
              Enter your partner's details above and click{' '}
              <span className="font-semibold text-violet-600">
                Generate Magic Image
              </span>{' '}
              to create a stunning 3D autostereogram. Relax your eyes and look
              through the pattern to reveal their hidden holographic aura.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
