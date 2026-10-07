import { useCallback, useState } from 'react';
import { ArrowLeft, RefreshCw, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Seo from '../Seo';
import ConfigurationForm from './ConfigurationForm';
import LoverPowerCard from './LoverPowerCard';
import { DEFAULT_CONFIG, type MagicEyeConfig } from './types';

export default function LoveMagicEye() {
  const [config, setConfig] = useState<MagicEyeConfig>(DEFAULT_CONFIG);
  const [generateKey, setGenerateKey] = useState(0);
  const [formCollapsed, setFormCollapsed] = useState(false);

  const handleGenerate = useCallback(() => {
    setGenerateKey((prev) => prev + 1);
    setFormCollapsed(true);

    window.setTimeout(() => {
      document.getElementById('lover-power-card')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 100);
  }, []);

  const handleRegenerate = useCallback(() => {
    setGenerateKey((prev) => prev + 1);
  }, []);

  const handleReset = useCallback(() => {
    setFormCollapsed(false);
    setGenerateKey(0);
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  return (
    <>
      <Seo
        title="Lover Power Card — Create Your Partner's Love Power Card | Loveons.com"
        description="Create a personalized anime-style Lover Power Card for your partner. Choose their look, generate their love stats, and discover their special love power."
        path="/love-magic-eye"
      />

      <div className="mx-auto max-w-md px-1">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-600 text-white shadow-lg shadow-pink-200">
              <Sparkles className="h-6 w-6" />
            </div>

            <div>
              <h1 className="font-display text-xl font-bold text-slate-900">
                Lover Power Card
              </h1>

              <p className="text-xs text-slate-400">
                Create your partner's ultimate love card
              </p>
            </div>
          </div>

          <Link
            to="/"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition-all hover:border-pink-200 hover:bg-pink-50 hover:text-pink-500"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        {/* Configuration Form */}
        <ConfigurationForm
          config={config}
          onChange={setConfig}
          onGenerate={handleGenerate}
          collapsed={formCollapsed}
        />

        {/* Lover Power Card */}
        {generateKey > 0 && (
          <div
            id="lover-power-card"
            className="mt-5 scroll-mt-24"
          >
            <LoverPowerCard config={config} />

            {/* Action Buttons */}
            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={handleRegenerate}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-pink-200 bg-white px-4 py-3 text-sm font-semibold text-pink-600 transition-all hover:bg-pink-50 active:scale-95"
              >
                <RefreshCw className="h-4 w-4" />
                New Card
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-pink-200 transition-all hover:-translate-y-0.5 active:scale-95"
              >
                <Sparkles className="h-4 w-4" />
                Start Over
              </button>
            </div>
          </div>
        )}

        {/* Info section before generation */}
        {generateKey === 0 && (
          <div className="mt-4 rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50/70 to-violet-50/70 p-5 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-pink-500 shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>

            <p className="text-sm leading-relaxed text-slate-600">
              Enter your partner's details above and click{' '}
              <span className="font-semibold text-pink-600">
                Generate Lover Power Card
              </span>{' '}
              to create their personalized anime-style love card.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
