import { useState } from 'react';
import { Sparkles, Wand2 } from 'lucide-react';
import {
  type MagicEyeConfig,
  type Gender,
  type FaceTone,
  type HairStyle,
  type BeardStyle,
  HAIR_STYLES,
  BEARD_STYLES,
} from './types';

// प्रीमियम स्किन टोन लिस्ट
const ENHANCED_FACE_TONES = [
  { id: 'Dark / West Indies', label: 'Deep Mahogany', color: '#5C4033' },
  { id: 'Wheatish / Indian', label: 'Warm Honey', color: '#C68B59' },
  { id: 'Fair / USA Type', label: 'Porcelain Glow', color: '#F3E5AB' }
];

// चेहरे की बनावट की नई लिस्ट
const FACE_STRUCTURES = [
  { id: 'Oval', label: 'Oval Face' },
  { id: 'Round', label: 'Round Face' },
  { id: 'Square', label: 'Square Face' }
];

interface ConfigurationFormProps {
  config: MagicEyeConfig & { faceStructure?: string };
  onChange: (config: any) => void;
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

  // डिफ़ॉल्ट फेस स्ट्रक्चर वैल्यू
  const currentStructure = config.faceStructure || 'Oval';

  const update = (field: string, value: string) => {
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
      <div className="rounded-3xl border border-violet-100 bg-white/85 p-5 shadow-xl shadow-violet-100 backdrop-blur-xl sm:p-6 font-sans">
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

        {/* Conditional Layer: Reveals when gender is picked */}
        <div
          className={`
            transition-all duration-300 ease-in-out overflow-hidden
            ${config.gender ? 'max-h-[850px] opacity-100' : 'max-h-0 opacity-0'}
          `}
        >
          {/* FACE STRUCTURE */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Face Structure
            </label>
            <div className="grid grid-cols-3 gap-2">
              {FACE_STRUCTURES.map((structure) => (
                <button
                  key={structure.id}
                  type="button"
                  onClick={() => update('faceStructure', structure.id)}
                  className={`
                    flex flex-col items-center gap-1.5 rounded-xl border-2 p-3
                    transition-all duration-200 text-xs font-semibold
                    ${currentStructure === structure.id
                      ? 'border-violet-400 bg-violet-50 text-violet-700 shadow-md shadow-violet-100'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-violet-200'
                    }
                  `}
                >
                  <FaceStructureIcon style={structure.id} />
                  <span className="text-[11px] leading-tight text-center">{structure.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* FACE TONE */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Face Tone
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ENHANCED_FACE_TONES.map((tone) => (
                <button
                  key={tone.id}
                  type="button"
                  onClick={() => update('faceTone', tone.id)}
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
                    className="h-7 w-7 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: tone.color }}
                  />
                  <span className="text-[11px] font-medium text-slate-600 text-center leading-tight">
                    {tone.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* HAIR STYLE */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Hair Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {HAIR_STYLES.map((hair) => (
                <button
                  key={hair.id}
                  type="button"
                  onClick={() => update('hairStyle', hair.id)}
                  className={`
                    flex flex-col items-center gap-1.5 rounded-xl border-2 p-3
                    text-xs font-medium transition-all duration-200
                    ${config.hairStyle === hair.id
                      ? 'border-violet-400 bg-violet-50 text-violet-700 shadow-md shadow-violet-100'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-violet-200'
                    }
                  `}
                >
                  <HairIcon style={hair.id} />
                  <span className="text-[11px] leading-tight text-center">{hair.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* BEARD STYLE */}
          <div
            className={`
              transition-all duration-300 ease-in-out overflow-hidden
              ${config.gender === 'male' ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}
            `}
          >
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Beard Design
              </label>
              <div className="grid grid-cols-2 gap-2">
                {BEARD_STYLES.map((beard) => (
                  <button
                    key={beard.id}
                    type="button"
                    onClick={() => update('beardStyle', beard.id)}
                    className={`
                      flex items-center gap-2 rounded-xl border-2 px-3 py-2.5
                      text-xs font-medium transition-all duration-200
                      ${config.beardStyle === beard.id
                        ? 'border-indigo-400 bg-indigo-50 text-indigo-700 shadow-md shadow-indigo-100'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200'
                      }
                    `}
                  >
                    <BeardIcon style={beard.id} />
                    <span className="text-[11px] leading-tight">{beard.label}</span>
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



