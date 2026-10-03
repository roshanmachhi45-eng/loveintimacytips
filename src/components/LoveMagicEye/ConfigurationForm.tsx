import { useState } from 'react';
import { Venus, Mars, Sparkles, Wand2 } from 'lucide-react';
import {
  type MagicEyeConfig,
  type Gender,
  type FaceTone,
  type HairStyle,
  type BeardStyle,
  FACE_TONES,
  HAIR_STYLES,
  BEARD_STYLES,
} from './types';

interface ConfigurationFormProps {
  config: MagicEyeConfig;
  onChange: (config: MagicEyeConfig) => void;
  onGenerate: () => void;
  collapsed: boolean;
}

export default function ConfigurationForm({
  config,
  onChange,
  onGenerate,
  collapsed,
}: ConfigurationFormProps) {
  const [error, setError] = useState('');

  const update = (field: keyof MagicEyeConfig, value: string) => {
    setError('');
    onChange({ ...config, [field]: value });
  };

  const handleGenerate = () => {
    if (!config.name.trim()) {
      setError("Please enter your partner's name.");
      return;
    }
    onGenerate();
  };

  return (
    <div
      className={`
        transition-all duration-500 ease-in-out overflow-hidden
        ${collapsed ? 'max-h-0 opacity-0' : 'max-h-[1200px] opacity-100'}
      `}
    >
      <div className="rounded-3xl border border-violet-100 bg-white/85 p-5 shadow-xl shadow-violet-100 backdrop-blur-xl sm:p-6">
        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-lg shadow-violet-200">
            <Wand2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900">
              Configure Your Magic Eye
            </h3>
            <p className="text-xs text-slate-400">
              Describe your partner to reveal their hidden 3D aura.
            </p>
          </div>
        </div>

        {/* Phase 1: Partner Name */}
        <div className="mb-4">
          <label
            htmlFor="partner-name"
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            Partner's Name
          </label>
          <input
            id="partner-name"
            type="text"
            value={config.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Enter your partner's name..."
            maxLength={30}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
        </div>

        {/* Gender Toggle */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Gender
          </label>
          <div className="grid grid-cols-2 gap-2">
            <GenderButton
              active={config.gender === 'female'}
              onClick={() => update('gender', 'female' as Gender)}
              icon={<VenusIcon />}
              label="Female"
              activeClass="from-pink-500 to-rose-500 border-rose-400"
            />
            <GenderButton
              active={config.gender === 'male'}
              onClick={() => update('gender', 'male' as Gender)}
              icon={<MarsIcon />}
              label="Male"
              activeClass="from-violet-500 to-indigo-500 border-violet-400"
            />
          </div>
        </div>

        {/* Conditional: Face Tone + Hair Style (both genders) */}
        <div
          className={`
            transition-all duration-300 ease-in-out overflow-hidden
            ${config.gender ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}
          `}
        >
          {/* Face Tone */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Face Tone
            </label>
            <div className="grid grid-cols-3 gap-2">
              {FACE_TONES.map((tone) => (
                <button
                  key={tone.id}
                  type="button"
                  onClick={() => update('faceTone', tone.id as FaceTone)}
                  className={`
                    flex flex-col items-center gap-1.5 rounded-xl border-2 p-3
                    transition-all duration-200
                    ${config.faceTone === tone.id
                      ? 'border-violet-400 bg-violet-50 shadow-md shadow-violet-100'
                      : 'border-slate-200 bg-white hover:border-violet-200'
                    }
                  `}
                >
                  <span
                    className="h-8 w-8 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: tone.color }}
                  />
                  <span className="text-[11px] font-medium text-slate-600 text-center leading-tight">
                    {tone.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Hair Style */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Hair Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {HAIR_STYLES.map((hair) => (
                <button
                  key={hair.id}
                  type="button"
                  onClick={() => update('hairStyle', hair.id as HairStyle)}
                  className={`
                    flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-3
                    text-xs font-medium transition-all duration-200
                    ${config.hairStyle === hair.id
                      ? 'border-violet-400 bg-violet-50 text-violet-700 shadow-md shadow-violet-100'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-violet-200'
                    }
                  `}
                >
                  <HairIcon style={hair.id} />
                  {hair.label}
                </button>
              ))}
            </div>
          </div>

          {/* Male-only: Beard Style */}
          <div
            className={`
              transition-all duration-300 ease-in-out overflow-hidden
              ${config.gender === 'male'
                ? 'max-h-[300px] opacity-100'
                : 'max-h-0 opacity-0'
              }
            `}
          >
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Beard Design
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {BEARD_STYLES.map((beard) => (
                  <button
                    key={beard.id}
                    type="button"
                    onClick={() => update('beardStyle', beard.id as BeardStyle)}
                    className={`
                      flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3
                      text-xs font-medium transition-all duration-200
                      ${config.beardStyle === beard.id
                        ? 'border-indigo-400 bg-indigo-50 text-indigo-700 shadow-md shadow-indigo-100'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200'
                      }
                    `}
                  >
                    <BeardIcon style={beard.id} />
                    {beard.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {error}
          </p>
        )}

        {/* Generate Button */}
        <button
          type="button"
          onClick={handleGenerate}
          className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-300 active:scale-[0.98]"
        >
          <Sparkles className="h-4 w-4" />
          Generate Magic Image
        </button>
      </div>
    </div>
  );
}

/* ---- Gender Button ---- */
function GenderButton({
  active,
  onClick,
  icon,
  label,
  activeClass,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  activeClass: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3
        text-sm font-semibold transition-all duration-200
        ${active
          ? `bg-gradient-to-r ${activeClass} text-white shadow-md`
          : 'border-slate-200 bg-white text-slate-600 hover:border-violet-200'
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}

/* ---- SVG Icons ---- */
function VenusIcon() {
  return <Venus className="h-5 w-5" />;
}

function MarsIcon() {
  return <Mars className="h-5 w-5" />;
}

function HairIcon({ style }: { style: string }) {
  if (style === 'bald') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12c0-4 4-7 9-7s9 3 9 7" strokeDasharray="2 2" opacity="0.3" />
      </svg>
    );
  }
  if (style === 'curly') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="13" r="8" />
        <path d="M4 10c2-3 5-4 8-4s6 1 8 4" />
        <path d="M6 7c1-2 3-3 6-3s5 1 6 3" opacity="0.5" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="13" r="8" />
      <path d="M4 11c2-4 5-6 8-6s6 2 8 6" />
    </svg>
  );
}

function BeardIcon({ style }: { style: string }) {
  const opacity = style === 'full' ? 1 : style === 'short' ? 0.7 : style === 'stubble' ? 0.35 : 0;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="11" r="7" />
      <path
        d="M5 13c1 5 4 7 7 7s6-2 7-7"
        fill="currentColor"
        fillOpacity={opacity}
        strokeOpacity={opacity > 0 ? 1 : 0}
      />
    </svg>
  );
}
