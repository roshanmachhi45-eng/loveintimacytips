import { useState } from 'react';
import { Sparkles, Wand2 } from 'lucide-react';
import {
  type MagicEyeConfig,
  type Gender,
  type FaceTone,
  type FaceStructure,
  type HairStyle,
  type BeardStyle,
  FACE_TONES,
  FACE_STRUCTURES,
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

  const update = <K extends keyof MagicEyeConfig>(
    field: K,
    value: MagicEyeConfig[K]
  ) => {
    setError('');
    onChange({
      ...config,
      [field]: value,
    });
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
        ${collapsed ? 'max-h-0 opacity-0' : 'max-h-[1600px] opacity-100'}
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
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
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
              onClick={() => update('gender', 'female')}
              icon={<VenusIcon />}
              label="Female"
              activeClass="from-pink-500 to-rose-500 border-rose-400"
            />

            <GenderButton
              active={config.gender === 'male'}
              onClick={() => update('gender', 'male')}
              icon={<MarsIcon />}
              label="Male"
              activeClass="from-violet-500 to-indigo-500 border-violet-400"
            />
          </div>
        </div>

        {/* Appearance Options */}
        <div
          className={`
            transition-all duration-300 ease-in-out overflow-hidden
            ${config.gender ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'}
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
                  aria-label={tone.label}
                  className={`
                    group flex flex-col items-center gap-2 rounded-xl border-2 p-3
                    transition-all duration-200
                    ${
                      config.faceTone === tone.id
                        ? 'border-pink-400 bg-pink-50 shadow-md shadow-pink-100'
                        : 'border-slate-200 bg-white hover:border-pink-200'
                    }
                  `}
                >
                  <FaceToneIcon
                    tone={tone.id}
                    color={tone.color}
                    active={config.faceTone === tone.id}
                  />

                  <span
                    className={`
                      text-[11px] font-semibold text-center leading-tight
                      ${
                        config.faceTone === tone.id
                          ? 'text-pink-700'
                          : 'text-slate-600'
                      }
                    `}
                  >
                    {tone.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Face Structure */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Face Structure
            </label>

            <div className="grid grid-cols-3 gap-2">
              {FACE_STRUCTURES.map((structure) => (
                <button
                  key={structure.id}
                  type="button"
                  onClick={() =>
                    update(
                      'faceStructure',
                      structure.id as FaceStructure
                    )
                  }
                  aria-label={structure.label}
                  className={`
                    flex flex-col items-center gap-2 rounded-xl border-2 p-3
                    transition-all duration-200
                    ${
                      config.faceStructure === structure.id
                        ? 'border-violet-400 bg-violet-50 text-violet-700 shadow-md shadow-violet-100'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-violet-200'
                    }
                  `}
                >
                  <FaceStructureIcon
                    structure={structure.id}
                    active={config.faceStructure === structure.id}
                  />

                  <span className="text-[11px] font-semibold text-center leading-tight">
                    {structure.label}
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
                  onClick={() =>
                    update('hairStyle', hair.id as HairStyle)
                  }
                  aria-label={hair.label}
                  className={`
                    flex flex-col items-center justify-center gap-2 rounded-xl border-2 px-2 py-3
                    text-xs font-medium transition-all duration-200
                    ${
                      config.hairStyle === hair.id
                        ? 'border-violet-400 bg-violet-50 text-violet-700 shadow-md shadow-violet-100'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-violet-200'
                    }
                  `}
                >
                  <HairIcon
                    style={hair.id}
                    active={config.hairStyle === hair.id}
                  />

                  <span className="text-[11px] font-semibold text-center leading-tight">
                    {hair.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Male-only Beard */}
          <div
            className={`
              transition-all duration-300 ease-in-out overflow-hidden
              ${
                config.gender === 'male'
                  ? 'max-h-[400px] opacity-100'
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
                    aria-label={beard.label}
                    className={`
                      flex flex-col items-center gap-2 rounded-xl border-2 px-2 py-3
                      text-xs font-medium transition-all duration-200
                      ${
                        config.beardStyle === beard.id
                          ? 'border-indigo-400 bg-indigo-50 text-indigo-700 shadow-md shadow-indigo-100'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200'
                      }
                    `}
                  >
                    <BeardIcon
                      style={beard.id}
                      active={config.beardStyle === beard.id}
                    />

                    <span className="text-[11px] font-semibold text-center leading-tight">
                      {beard.label}
                    </span>
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

        {/* Generate */}
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

/* -------------------------------------------------------
   Gender Button
------------------------------------------------------- */

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
            : 'border-slate-200 bg-white text-slate-600 hover:border-violet-200'
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}

/* -------------------------------------------------------
   Face Tone Icon
------------------------------------------------------- */

function FaceToneIcon({
  tone,
  color,
  active,
}: {
  tone: FaceTone;
  color: string;
  active: boolean;
}) {
  const hairColor =
    tone === 'dark'
      ? '#24150d'
      : tone === 'wheatish'
        ? '#3a2417'
        : '#6b4530';

  return (
    <svg
      width="46"
      height="46"
      viewBox="0 0 46 46"
      fill="none"
      aria-hidden="true"
    >
      {/* Hair */}
      <path
        d="M12 20C11 11 17 6 23 6C30 6 35 11 34 20"
        fill={hairColor}
      />

      {/* Face */}
      <path
        d="M14 19C14 12 18 9 23 9C28 9 32 12 32 19V25C32 32 28 37 23 37C18 37 14 32 14 25V19Z"
        fill={color}
      />

      {/* Ears */}
      <circle cx="13.5" cy="23" r="2.5" fill={color} />
      <circle cx="32.5" cy="23" r="2.5" fill={color} />

      {/* Eyes */}
      <circle cx="19" cy="22" r="1.3" fill="#2b211c" />
      <circle cx="27" cy="22" r="1.3" fill="#2b211c" />

      {/* Nose */}
      <path
        d="M23 22.5V27L21 28"
        stroke="#6b4634"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Smile */}
      <path
        d="M19.5 30C21.5 31.5 24.5 31.5 26.5 30"
        stroke="#6b4634"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {active && (
        <circle
          cx="37"
          cy="9"
          r="5"
          fill="#ec4899"
        />
      )}

      {active && (
        <path
          d="M34.5 9L36.2 10.7L39.5 7.3"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

/* -------------------------------------------------------
   Face Structure Icon
------------------------------------------------------- */

function FaceStructureIcon({
  structure,
  active,
}: {
  structure: FaceStructure;
  active: boolean;
}) {
  const facePath =
    structure === 'round'
      ? 'M23 7C14 7 9 13 9 22C9 31 14 39 23 39C32 39 37 31 37 22C37 13 32 7 23 7Z'
      : structure === 'square'
        ? 'M13 8H33C36 8 38 10 38 13V29C38 34 33 38 23 39C13 38 8 34 8 29V13C8 10 10 8 13 8Z'
        : 'M23 6C14 6 10 12 10 21C10 31 15 39 23 40C31 39 36 31 36 21C36 12 32 6 23 6Z';

  return (
    <svg
      width="46"
      height="46"
      viewBox="0 0 46 46"
      fill="none"
      aria-hidden="true"
    >
      {/* Hair */}
      <path
        d="M11 20C11 11 16 6 23 6C30 6 35 11 35 20"
        stroke={active ? '#7c3aed' : '#64748b'}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Face */}
      <path
        d={facePath}
        fill={active ? '#ede9fe' : '#f8fafc'}
        stroke={active ? '#7c3aed' : '#64748b'}
        strokeWidth="1.8"
      />

      {/* Eyes */}
      <circle cx="18" cy="22" r="1.5" fill="#475569" />
      <circle cx="28" cy="22" r="1.5" fill="#475569" />

      {/* Nose */}
      <path
        d="M23 22V27L21 28"
        stroke="#64748b"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Mouth */}
      <path
        d="M19 31C21 32.5 25 32.5 27 31"
        stroke="#64748b"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* -------------------------------------------------------
   Hair Icon
------------------------------------------------------- */

function HairIcon({
  style,
  active,
}: {
  style: HairStyle;
  active: boolean;
}) {
  const stroke = active ? '#7c3aed' : '#64748b';
  const hairFill = active ? '#ede9fe' : '#f1f5f9';

  if (style === 'bald') {
    return (
      <svg
        width="42"
        height="42"
        viewBox="0 0 42 42"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M10 20C10 11 15 7 21 7C28 7 32 12 32 20"
          stroke={stroke}
          strokeWidth="2"
          strokeLinecap="round"
        />

        <path
          d="M13 19C13 13 16 10 21 10C26 10 29 13 29 19V27C29 33 25 36 21 36C17 36 13 33 13 27V19Z"
          fill={hairFill}
          stroke={stroke}
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  if (style === 'curly') {
    return (
      <svg
        width="42"
        height="42"
        viewBox="0 0 42 42"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M9 22C8 16 10 10 15 9C17 5 22 6 24 8C28 5 34 9 33 13C37 15 35 21 33 23"
          fill={hairFill}
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M12 20C14 17 14 14 16 13M18 18C20 15 19 12 21 10M24 17C26 14 26 11 28 10M29 19C31 16 31 14 32 13"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        <path
          d="M13 20V28C13 33 17 36 21 36C25 36 29 33 29 28V20"
          fill="#f8fafc"
          stroke={stroke}
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  return (
    <svg
      width="42"
      height="42"
      viewBox="0 0 42 42"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 21C9 12 14 7 21 7C28 7 33 12 33 21"
        fill={hairFill}
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M13 20V29C13 33 17 36 21 36C25 36 29 33 29 29V20"
        fill="#f8fafc"
        stroke={stroke}
        strokeWidth="1.5"
      />

      <path
        d="M13 18C16 12 18 10 21 9C25 10 28 13 29 18"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* -------------------------------------------------------
   Beard Icon
------------------------------------------------------- */

function BeardIcon({
  style,
  active,
}: {
  style: BeardStyle;
  active: boolean;
}) {
  const stroke = active ? '#4f46e5' : '#64748b';

  const beardOpacity =
    style === 'full'
      ? 1
      : style === 'short'
        ? 0.72
        : style === 'stubble'
          ? 0.32
          : 0;

  return (
    <svg
      width="42"
      height="42"
      viewBox="0 0 42 42"
      fill="none"
      aria-hidden="true"
    >
      {/* Head */}
      <path
        d="M11 19C11 11 15 7 21 7C27 7 31 11 31 19V26C31 32 27 36 21 36C15 36 11 32 11 26V19Z"
        fill="#f8fafc"
        stroke={stroke}
        strokeWidth="1.6"
      />

      {/* Hair */}
      <path
        d="M11 19C11 11 15 7 21 7C27 7 31 11 31 19"
        stroke={stroke}
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      {/* Eyes */}
      <circle cx="17" cy="20" r="1.2" fill={stroke} />
      <circle cx="25" cy="20" r="1.2" fill={stroke} />

      {/* Beard */}
      <path
        d="M12.5 25C13.5 32 17 35 21 35C25 35 28.5 32 29.5 25C27 27 25 28 21 28C17 28 15 27 12.5 25Z"
        fill={stroke}
        fillOpacity={beardOpacity}
        stroke={style === 'clean' ? 'none' : stroke}
        strokeWidth="1"
      />

      {/* Stubble dots */}
      {style === 'stubble' && (
        <>
          <circle cx="16" cy="27" r="0.8" fill={stroke} />
          <circle cx="19" cy="29" r="0.8" fill={stroke} />
          <circle cx="22" cy="28" r="0.8" fill={stroke} />
          <circle cx="25" cy="29" r="0.8" fill={stroke} />
          <circle cx="27" cy="27" r="0.8" fill={stroke} />
        </>
      )}
    </svg>
  );
}

/* -------------------------------------------------------
   Gender Icons
------------------------------------------------------- */

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
      aria-hidden="true"
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
      aria-hidden="true"
    >
      <circle cx="10" cy="14" r="5" />
      <path d="M14 10l7-7" />
      <path d="M14 3h7v7" />
    </svg>
  );
          }



