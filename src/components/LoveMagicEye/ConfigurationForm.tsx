import { useState } from 'react';
import { Sparkles, Wand2, Glasses } from 'lucide-react';
import {
  type MagicEyeConfig,
  type Gender,
  type FaceTone,
  type HairStyle,
  type BeardStyle,
  type GlassesStyle,
  FACE_TONES,
  HAIR_STYLES,
  BEARD_STYLES,
  GLASSES_STYLES,
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
  const [showHelp, setShowHelp] = useState(false);

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
        ${collapsed ? 'max-h-0 opacity-0' : 'max-h-[1400px] opacity-100'}
      `}
    >
      <div className="rounded-3xl border border-pink-100 bg-white/90 p-5 shadow-xl shadow-pink-100 backdrop-blur-xl sm:p-6">

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-600 text-white shadow-lg shadow-pink-200">
            <Wand2 className="h-5 w-5" />
          </div>

          <div>
            <h3 className="font-display text-lg font-bold text-slate-900">
              Lover Astro Card 
            </h3>

            <p className="text-xs text-slate-400">
              Create a personalized love power card.
            </p>
            <button
              type="button"
              onClick={() => setShowHelp(true)}
              aria-expanded={showHelp}
              className="mt-3 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-xs font-semibold text-purple-700 transition hover:bg-purple-100"
            >
              ✨ How to Use Lover Astro Card
            </button>
          </div>
        </div>
        
        {/* How to Use Popup */}
        {showHelp && (
          <div
            className="mb-5 rounded-2xl border border-purple-200 bg-gradient-to-br from-pink-50 to-purple-50 p-5 shadow-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lover-astro-help-title"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h4
                id="lover-astro-help-title"
                className="text-base font-bold text-slate-900"
              >
                How to Use Lover Astro Card
              </h4>

              <button
                type="button"
                onClick={() => setShowHelp(false)}
                aria-label="Close instructions"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xl text-slate-500 transition hover:bg-white"
              >
                ×
              </button>
            </div>

            <p className="mb-3 text-sm leading-6 text-slate-600">
              Create a personalized anime-style love card for your
              partner by following these simple steps.
            </p>

            <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-600">
              <li>Enter your partner's name in the name field.</li>
              <li>Choose the gender for the character you want to create.</li>
              <li>Select a face tone and hairstyle that match your preferred look.</li>
              <li>If you select male, you can also choose a beard design.</li>
              <li>Choose whether the character should wear eyeglasses.</li>
              <li>Click Generate Lover Astro Card to reveal your personalized cosmic card.</li>
              <li>Explore your card and share it with someone special using the available sharing options.</li>
            </ol>
            <div className="mt-4 rounded-xl border border-purple-100 bg-white/80 p-3">
              <h5 className="mb-1 text-sm font-bold text-purple-800">
                A Little Disclaimer
              </h5>

              <p className="text-xs leading-5 text-slate-600">
                This tool is designed for entertainment and romantic
                inspiration. Its cosmic themes are creative and are not
                scientifically proven predictions or guarantees about
                love and relationships.
              </p>
            </div>

            {/* SEO Information Section Hidden Inside Help Accordion */}
            <div className="mt-4 pt-4 border-t border-purple-100 text-left text-xs leading-relaxed text-slate-500 space-y-3">
              <div>
                <h6 className="font-bold text-slate-800 mb-0.5">How the Lover Astro Card Mapping Works</h6>
                <p>
                  The Lover Astro Card is an advanced relationship exploration tool designed to reveal the cosmic blueprint behind your partner's love aura. By evaluating specific physical and energetic traits, our specialized custom algorithm maps out a unique astrological profile. This profile identifies the fundamental cosmic energies influencing your relationship dynamics, allowing for a deeper understanding of your natural romantic connection.
                </p>
              </div>

              <div>
                <h6 className="font-bold text-slate-800 mb-0.5">The Role of Cosmic Planets & Birth Gemstones</h6>
                <p>
                  Every relationship vibrates under the unique frequency of ruling celestial bodies, such as the affectionate energy of Venus or the deep intuitive nature of the Moon. Along with discovering their central love planet, the tool calculates a sacred gemstone—ranging from protective Opals and deep Rubies to stabilizing Amethysts. These natural stones serve as geometric symbols of strength, loyalty, and balance within your bond.
                </p>
              </div>

              <div>
                <h6 className="font-bold text-slate-800 mb-0.5">Daily Relationship Predictions</h6>
                <p>
                  Astrological forces shift constantly, meaning your romantic aura receives fresh inspiration day by day. By analyzing the current calendar timeline alongside your custom personal profile key, the card provides updated relationship guidance, gentle affection goals, and cosmic daily check-ins. Read these customized predictions regularly to align your intentions, build meaningful communication, and nurture lasting closeness with your partner.
                </p>
              </div>
            </div>
          </div>
        )}
            
        {/* Partner Name */}
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
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
          />
        </div>

        {/* Gender */}
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

        {/* Character Options */}
        <div
          className={`
            transition-all duration-300 ease-in-out overflow-hidden
            ${config.gender ? 'max-h-[900px] opacity-100' : 'max-h-0 opacity-0'}
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
                    ${
                      config.faceTone === tone.id
                        ? 'border-pink-400 bg-pink-50 shadow-md shadow-pink-100'
                        : 'border-slate-200 bg-white hover:border-pink-200'
                    }
                  `}
                >
<svg
  width="34"
  height="34"
  viewBox="0 0 40 40"
  aria-hidden="true"
>
  <path
    d="M20 3.5C11.4 3.5 5 10.2 5 19.2c0 9.4 6.2 17.3 15 17.3s15-7.9 15-17.3C35 10.2 28.6 3.5 20 3.5Z"
    fill={tone.color}
    stroke="#D1D5DB"
    strokeWidth="1.5"
  />
</svg>

                  <span className="text-center text-[11px] font-medium leading-tight text-slate-600">
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
                    ${
                      config.hairStyle === hair.id
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

          {/* Beard Style - Male Only */}
          <div
            className={`
              transition-all duration-300 ease-in-out overflow-hidden
              ${
                config.gender === 'male'
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
                    onClick={() =>
                      update('beardStyle', beard.id as BeardStyle)
                    }
                    className={`
                      flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3
                      text-xs font-medium transition-all duration-200
                      ${
                        config.beardStyle === beard.id
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

          {/* Glasses */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Eyeglasses
            </label>

            <div className="grid grid-cols-2 gap-2">
              {GLASSES_STYLES.map((glasses) => (
                <button
                  key={glasses.id}
                  type="button"
                  onClick={() =>
                    update('glasses', glasses.id as GlassesStyle)
                  }
                  className={`
                    flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-3
                    text-xs font-semibold transition-all duration-200
                    ${
                      config.glasses === glasses.id
                        ? 'border-fuchsia-400 bg-fuchsia-50 text-fuchsia-700 shadow-md shadow-fuchsia-100'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-fuchsia-200'
                    }
                  `}
                >
                  {glasses.id === 'glasses' && (
                    <Glasses className="h-5 w-5" />
                  )}

                  {glasses.id === 'none' && (
                    <span className="text-base leading-none">○</span>
                  )}

                  {glasses.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {error}
          </p>
        )}

        {/* Generate Lover Power Card */}
        <button
          type="button"
          onClick={handleGenerate}
          className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-600 px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-pink-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-pink-300 active:scale-[0.98]"
        >
          <Sparkles className="h-4 w-4" />
          Generate Lover Astro Card
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
        ${
          active
            ? `bg-gradient-to-r ${activeClass} text-white shadow-md`
            : 'border-slate-200 bg-white text-slate-600 hover:border-pink-200'
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
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="9" r="5" />
      <path d="M12 14v8" />
      <path d="M9 19h6" />
    </svg>
  );
}

function MarsIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10" cy="14" r="5" />
      <path d="M14 10l7-7" />
      <path d="M14 3h7v7" />
    </svg>
  );
}

function HairIcon({ style }: { style: string }) {
  const commonProps = {
    width: 34,
    height: 34,
    viewBox: '0 0 40 40',
    fill: 'currentColor',
    'aria-hidden': true as const,
  };

  if (style === 'bald') {
    return (
      <svg {...commonProps}>
        <path
          d="M20 7C13 7 9 11 9 17c0 2 1 3 2 4 1-5 4-8 9-8s8 3 9 8c1-1 2-2 2-4 0-6-4-10-11-10Z"
        />
      </svg>
    );
  }

  if (style === 'curly') {
    return (
      <svg {...commonProps}>
        <path d="
          M10 21
          C5 18 7 12 12 12
          C10 6 17 4 20 9
          C23 3 31 7 29 13
          C35 14 35 21 30 23
          L29 18
          C26 15 23 16 20 16
          C16 16 13 17 11 20Z
        " />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="
        M8 23
        C7 14 12 7 20 7
        C28 7 33 14 32 23
        L28 18
        C25 15 22 14 19 14
        C15 14 12 17 10 22Z
      " />
    </svg>
  );
}

function BeardIcon({ style }: { style: string }) {
  const commonProps = {
    width: 34,
    height: 34,
    viewBox: '0 0 40 40',
    fill: 'currentColor',
    'aria-hidden': true as const,
  };

  if (style === 'full') {
    return (
      <svg {...commonProps}>
        <path d="
          M7 7
          C10 13 9 19 11 25
          C13 32 17 36 20 38
          C23 36 27 32 29 25
          C31 19 30 13 33 7
          C29 13 25 15 20 15
          C15 15 11 13 7 7Z
        " />
      </svg>
    );
  }

  if (style === 'short') {
    return (
      <svg {...commonProps}>
        <path d="
          M10 9
          C12 15 12 22 15 27
          C17 30 19 32 20 33
          C21 32 23 30 25 27
          C28 22 28 15 30 9
          C26 15 23 17 20 17
          C17 17 14 15 10 9Z
        " />
      </svg>
    );
  }

  if (style === 'stubble') {
    return (
      <svg {...commonProps}>
        <path
          d="
            M11 12
            L14 17 L17 15 L20 18
            L23 15 L26 17 L29 12
            L27 23 L24 27 L20 29
            L16 27 L13 23Z
          "
        />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="
        M15 13
        L17 17 L20 14
        L23 17 L25 13
        L23 22 L20 26 L17 22Z
      " />
    </svg>
  );
}



