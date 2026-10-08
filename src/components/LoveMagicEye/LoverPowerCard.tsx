import React from 'react';
import type { MagicEyeConfig } from './types';

interface LoverPowerCardProps {
  config: MagicEyeConfig;
}

const skinColors = {
  dark: {
    base: '#8A5638',
    light: '#A96E4B',
    shadow: '#633A27',
    highlight: '#C58962',
    blush: '#B85F58',
  },
  wheatish: {
    base: '#C88961',
    light: '#E0A77E',
    shadow: '#9D6045',
    highlight: '#F0C09B',
    blush: '#E77D82',
  },
  fair: {
    base: '#F0C3A5',
    light: '#FFD9C3',
    shadow: '#D99B83',
    highlight: '#FFE8DA',
    blush: '#F08B9A',
  },
};

const hairColors = {
  bald: '#2B2026',
  curly: '#241A24',
  straight: '#171522',
};

function AnimeCharacter({ config }: { config: MagicEyeConfig }) {
  const skin = skinColors[config.faceTone];
  const isFemale = config.gender === 'female';

  const faceWidth =
    config.faceStructure === 'round'
      ? 124
      : config.faceStructure === 'square'
        ? 132
        : 118;

  const faceBottom =
    config.faceStructure === 'square'
      ? 'M114 137 Q180 181 246 137 L241 205 Q228 263 180 279 Q132 263 119 205 Z'
      : config.faceStructure === 'round'
        ? 'M112 139 Q180 176 248 139 L242 209 Q230 268 180 279 Q130 268 118 209 Z'
        : 'M119 137 Q180 176 241 137 L237 207 Q225 264 180 280 Q135 264 123 207 Z';

  return (
    <svg
      viewBox="0 0 360 360"
      className="h-full w-full"
      role="img"
      aria-label={`Anime character for ${config.name || 'your partner'}`}
    >
      <defs>
        <linearGradient id="anime-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffd6ee" />
          <stop offset="48%" stopColor="#f5c8ff" />
          <stop offset="100%" stopColor="#c9b8ff" />
        </linearGradient>

        <linearGradient id="hair-main" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={isFemale ? '#29183d' : '#171522'} />
          <stop offset="55%" stopColor={isFemale ? '#4b2367' : '#292034'} />
          <stop offset="100%" stopColor={isFemale ? '#17101f' : '#100d17'} />
        </linearGradient>

        <linearGradient id="skin-main" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={skin.highlight} />
          <stop offset="45%" stopColor={skin.light} />
          <stop offset="100%" stopColor={skin.base} />
        </linearGradient>

        <linearGradient id="eye-iris" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isFemale ? '#c94fff' : '#37a7ff'} />
          <stop offset="55%" stopColor={isFemale ? '#7a24d8' : '#1764c7'} />
          <stop offset="100%" stopColor={isFemale ? '#32106e' : '#082f70'} />
        </linearGradient>

        <linearGradient id="shirt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#251936" />
          <stop offset="50%" stopColor="#5c247e" />
          <stop offset="100%" stopColor="#21152f" />
        </linearGradient>

        <filter id="soft-shadow">
          <feDropShadow
            dx="0"
            dy="7"
            stdDeviation="7"
            floodColor="#24122e"
            floodOpacity="0.28"
          />
        </filter>

        <filter id="eye-glow">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
      </defs>

      {/* Background */}
      <rect
        x="8"
        y="8"
        width="344"
        height="344"
        rx="34"
        fill="url(#anime-bg)"
      />

      <circle
        cx="58"
        cy="65"
        r="28"
        fill="#ffffff"
        opacity="0.3"
      />

      <circle
        cx="304"
        cy="82"
        r="42"
        fill="#ffffff"
        opacity="0.18"
      />

      <path
        d="M28 294 Q90 238 145 272 Q205 309 250 263 Q303 215 337 263 L337 352 L28 352 Z"
        fill="#ffffff"
        opacity="0.14"
      />

      {/* Decorative stars */}
      <g fill="#fff" opacity="0.75">
        <path d="M48 128 l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" />
        <path d="M306 145 l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" />
        <path d="M278 50 l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" />
      </g>

      {/* Neck */}
      <path
        d="M151 251 Q180 268 209 251 L214 301 Q180 323 146 301 Z"
        fill="url(#skin-main)"
        stroke="#261827"
        strokeWidth="4"
      />

      {/* Shoulders / outfit */}
      <path
        d="M92 352 Q95 302 145 286 Q180 308 215 286 Q265 302 268 352 Z"
        fill="url(#shirt)"
        stroke="#261827"
        strokeWidth="5"
      />

      <path
        d="M142 290 Q180 316 218 290"
        fill="none"
        stroke="#f4b7ff"
        strokeWidth="5"
        opacity="0.8"
      />

      {/* Ears */}
      <path
        d="M119 174 Q97 163 99 188 Q102 212 124 211"
        fill="url(#skin-main)"
        stroke="#261827"
        strokeWidth="4"
      />

      <path
        d="M241 174 Q263 163 261 188 Q258 212 236 211"
        fill="url(#skin-main)"
        stroke="#261827"
        strokeWidth="4"
      />

      {/* Face */}
      <path
        d={faceBottom}
        fill="url(#skin-main)"
        stroke="#261827"
        strokeWidth="5"
        filter="url(#soft-shadow)"
      />

      {/* Face side shadows */}
      <path
        d="M123 179 Q128 244 158 267 Q133 255 124 222 Z"
        fill={skin.shadow}
        opacity="0.28"
      />

      <path
        d="M237 179 Q232 244 202 267 Q227 255 236 222 Z"
        fill={skin.shadow}
        opacity="0.22"
      />

      {/* Anime hair back */}
      {config.hairStyle !== 'bald' && (
        <>
          {config.hairStyle === 'straight' ? (
            <path
              d="M105 157 Q92 58 180 43 Q268 58 255 157
                 L246 205 L226 174 L218 226 L198 171
                 L180 223 L160 170 L139 225 L134 173
                 L113 207 Z"
              fill="url(#hair-main)"
              stroke="#261827"
              strokeWidth="6"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d="M104 168
                 Q73 146 92 112
                 Q69 86 99 67
                 Q112 34 147 51
                 Q180 22 207 50
                 Q244 31 255 68
                 Q286 85 261 116
                 Q282 146 252 168
                 L237 198 L222 165
                 L202 207 L187 163
                 L165 207 L151 164
                 L127 201 L123 164 Z"
              fill="url(#hair-main)"
              stroke="#261827"
              strokeWidth="6"
              strokeLinejoin="round"
            />
          )}
        </>
      )}

      {/* Hair fringe */}
      {config.hairStyle !== 'bald' && (
        <g
          fill="url(#hair-main)"
          stroke="#261827"
          strokeWidth="4"
          strokeLinejoin="round"
        >
          <path d="M109 122 Q112 63 155 55 Q143 94 151 142 Q132 126 109 122 Z" />
          <path d="M140 108 Q151 56 180 48 Q175 92 180 146 Q159 126 140 108 Z" />
          <path d="M173 101 Q188 53 213 61 Q205 104 196 148 Q183 127 173 101 Z" />

          {isFemale && (
            <>
              <path d="M211 66 Q241 71 251 105 Q231 96 214 122 Q218 91 211 66 Z" />
              <path
                d="M101 92 Q78 112 93 160 Q105 143 116 127 Q107 112 101 92 Z"
              />
            </>
          )}
        </g>
      )}

      {/* Hair highlights */}
      {config.hairStyle !== 'bald' && (
        <g
          fill="none"
          stroke="#d993ff"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.55"
        >
          <path d="M126 81 Q143 64 159 63" />
          <path d="M183 62 Q203 57 219 72" />
        </g>
      )}

      {/* Eyebrows */}
      <path
        d="M129 151 Q148 140 163 150"
        fill="none"
        stroke="#35202a"
        strokeWidth="7"
        strokeLinecap="round"
      />

      <path
        d="M197 150 Q212 140 231 151"
        fill="none"
        stroke="#35202a"
        strokeWidth="7"
        strokeLinecap="round"
      />

      {/* Left anime eye */}
      <g>
        <path
          d="M124 169 Q145 143 169 169 Q147 191 124 169 Z"
          fill="#fff"
          stroke="#261827"
          strokeWidth="5"
        />

        <ellipse
          cx="147"
          cy="169"
          rx="13"
          ry="17"
          fill="url(#eye-iris)"
          stroke="#261827"
          strokeWidth="3"
        />

        <ellipse
          cx="147"
          cy="172"
          rx="5"
          ry="9"
          fill="#120c22"
        />

        <circle cx="152" cy="163" r="5" fill="#fff" />
        <circle cx="142" cy="178" r="2.5" fill="#fff" opacity="0.85" />

        <path
          d="M124 166 Q145 138 170 165"
          fill="none"
          stroke="#261827"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>

      {/* Right anime eye */}
      <g>
        <path
          d="M191 169 Q215 143 236 169 Q213 191 191 169 Z"
          fill="#fff"
          stroke="#261827"
          strokeWidth="5"
        />

        <ellipse
          cx="213"
          cy="169"
          rx="13"
          ry="17"
          fill="url(#eye-iris)"
          stroke="#261827"
          strokeWidth="3"
        />

        <ellipse
          cx="213"
          cy="172"
          rx="5"
          ry="9"
          fill="#120c22"
        />

        <circle cx="218" cy="163" r="5" fill="#fff" />
        <circle cx="208" cy="178" r="2.5" fill="#fff" opacity="0.85" />

        <path
          d="M190 165 Q214 138 238 166"
          fill="none"
          stroke="#261827"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>

      {/* Eye glow */}
      <ellipse
        cx="147"
        cy="170"
        rx="18"
        ry="22"
        fill="#c76aff"
        opacity="0.16"
        filter="url(#eye-glow)"
      />

      <ellipse
        cx="213"
        cy="170"
        rx="18"
        ry="22"
        fill="#5d9cff"
        opacity="0.14"
        filter="url(#eye-glow)"
      />

      {/* Nose */}
      <path
        d="M180 173 Q174 194 179 199 Q185 202 190 197"
        fill="none"
        stroke={skin.shadow}
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Blush */}
      <g
        stroke={skin.blush}
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.7"
      >
        <path d="M125 205 l14 -5" />
        <path d="M128 212 l15 -5" />
        <path d="M235 205 l-14 -5" />
        <path d="M232 212 l-15 -5" />
      </g>

      {/* Mouth */}
      <path
        d={
          isFemale
            ? 'M165 220 Q180 233 195 220 Q181 245 165 220 Z'
            : 'M165 223 Q180 232 195 223 Q181 237 165 223 Z'
        }
        fill={isFemale ? '#a83268' : '#7d4055'}
        stroke="#261827"
        strokeWidth="3"
      />

      {isFemale && (
        <path
          d="M169 225 Q180 228 191 225"
          fill="none"
          stroke="#ffd1df"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      )}

      {/* Glasses */}
      {config.glasses === 'glasses' && (
        <g
          fill="rgba(255,255,255,0.08)"
          stroke="#171522"
          strokeWidth="5"
        >
          <rect x="116" y="151" width="59" height="43" rx="15" />
          <rect x="185" y="151" width="59" height="43" rx="15" />

          <path d="M175 164 Q180 160 185 164" fill="none" />
          <path d="M116 162 L105 157" fill="none" />
          <path d="M244 162 L255 157" fill="none" />

          <path
            d="M123 157 Q143 150 165 158"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            opacity="0.35"
          />

          <path
            d="M192 157 Q212 150 235 158"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            opacity="0.35"
          />
        </g>
      )}

      {/* Beard */}
      {!isFemale && config.beardStyle !== 'clean' && (
        <g fill="#2a1d25" opacity="0.86">
          {config.beardStyle === 'stubble' && (
            <>
              <path d="M143 231 Q180 250 217 231 Q210 263 180 267 Q150 263 143 231 Z" />
              <g fill="#6d4b45" opacity="0.55">
                {Array.from({ length: 18 }).map((_, index) => {
                  const x = 150 + (index % 6) * 10;
                  const y = 240 + Math.floor(index / 6) * 7;
                  return <circle key={index} cx={x} cy={y} r="1.5" />;
                })}
              </g>
            </>
          )}

          {config.beardStyle === 'short' && (
            <path d="M141 229 Q180 250 219 229 Q213 270 180 273 Q147 270 141 229 Z" />
          )}

          {config.beardStyle === 'full' && (
            <path d="M132 222 Q180 250 228 222 L220 270 Q203 288 180 289 Q157 288 140 270 Z" />
          )}
        </g>
      )}

      {/* Face highlight */}
      <path
        d="M143 116 Q151 103 161 99"
        fill="none"
        stroke={skin.highlight}
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.65"
      />

      {/* Small anime sparkle */}
      <g fill="#fff">
        <path d="M76 238 l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" opacity="0.8" />
        <path d="M286 230 l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" opacity="0.8" />
      </g>
    </svg>
  );
}

export default function LoverPowerCard({
  config,
}: LoverPowerCardProps) {
  const name = config.name.trim() || 'Your Partner';

  return (
    <div className="mx-auto w-full max-w-[560px]">
      <div
        className="overflow-hidden rounded-[28px] border-[3px] border-slate-950 bg-[#120c19] shadow-[0_18px_45px_rgba(36,18,46,0.28)]"
      >
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-fuchsia-600 via-pink-500 to-violet-600 px-5 py-4 text-center">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -left-8 -top-10 h-28 w-28 rounded-full bg-white blur-2xl" />
            <div className="absolute -bottom-10 -right-8 h-32 w-32 rounded-full bg-white blur-2xl" />
          </div>

          <p className="relative text-[10px] font-black tracking-[0.28em] text-white/80">
            LOVEONS • POWER CARD
          </p>

          <h2 className="relative mt-1 text-[25px] font-black uppercase leading-none tracking-tight text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.4)]">
            {name}
          </h2>

          <div className="relative mt-2 inline-flex rounded-full border border-white/40 bg-black/20 px-3 py-1">
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white">
              THE ULTIMATE BOSS
            </span>
          </div>
        </div>

        {/* Character */}
        <div className="bg-[#211329] px-3 pt-3">
          <div className="overflow-hidden rounded-[22px] border-2 border-white/15 bg-[#30203b]">
            <div className="h-[300px] sm:h-[330px]">
              <AnimeCharacter config={config} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-[#120c19] px-4 pb-4 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-black tracking-[0.18em] text-white">
              PARTNER STATS
            </h3>

            <span className="rounded-full bg-pink-500/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-pink-300">
              MAX POWER
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-center">
              <p className="text-[9px] font-black uppercase tracking-wider text-red-300">
                Arguments Won
              </p>
              <p className="mt-1 text-2xl font-black text-white">99%</p>
            </div>

            <div className="rounded-2xl border border-orange-400/25 bg-orange-500/10 p-3 text-center">
              <div className="mb-1 flex justify-center">
                <span className="rounded-full bg-orange-500 px-1.5 py-0.5 text-[7px] font-black uppercase text-white">
                  Warning
                </span>
              </div>

              <p className="text-[9px] font-black uppercase tracking-wider text-orange-300">
                Patience
              </p>

              <p className="mt-1 text-2xl font-black text-white">12%</p>
            </div>

            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-center">
              <p className="text-[9px] font-black uppercase tracking-wider text-emerald-300">
                Cuteness
              </p>
              <p className="mt-1 text-2xl font-black text-white">100%</p>
            </div>
          </div>

          {/* Ability */}
          <div className="mt-3 rounded-2xl border-2 border-dashed border-fuchsia-400/40 bg-gradient-to-r from-fuchsia-500/10 to-violet-500/10 p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-fuchsia-300">
              SPECIAL ABILITY
            </p>

            <h4 className="mt-1 text-lg font-black text-white">
              Emotional Damage
            </h4>

            <p className="mt-1 text-xs leading-relaxed text-slate-300">
              Can get any gift by just looking cute.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
            <span className="text-[10px] font-black tracking-[0.22em] text-white/45">
              LOVEONS.COM
            </span>

            <span className="text-[9px] font-bold text-white/35">
              MADE WITH LOVE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
