import React from 'react';
import type { MagicEyeConfig } from './types';

interface LoverPowerCardProps {
  config: MagicEyeConfig;
}

export default function LoverPowerCard({
  config,
}: LoverPowerCardProps) {
  const isFemale = config.gender === 'female';

  const faceColor =
    config.faceTone === 'dark'
      ? '#8D5524'
      : config.faceTone === 'wheatish'
        ? '#C68642'
        : '#F1C27D';

  const faceWidth =
    config.faceStructure === 'round'
      ? 118
      : config.faceStructure === 'square'
        ? 126
        : 112;

  const faceHeight =
    config.faceStructure === 'round'
      ? 132
      : config.faceStructure === 'square'
        ? 128
        : 142;

  const displayName =
    config.name.trim().slice(0, 20) || 'YOUR LOVER';

  return (
    <div className="mx-auto w-full max-w-[600px] px-2 sm:px-4">
      <div
        className="
          relative overflow-hidden rounded-[28px]
          border-[4px] border-black
          bg-[#171022]
          shadow-[0_14px_0_#000,0_22px_40px_rgba(0,0,0,0.35)]
        "
      >
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="
              absolute -left-24 -top-24 h-64 w-64 rounded-full
              bg-pink-500/30 blur-3xl
            "
          />

          <div
            className="
              absolute -right-24 top-40 h-72 w-72 rounded-full
              bg-violet-500/30 blur-3xl
            "
          />

          <div
            className="
              absolute bottom-0 left-1/2 h-80 w-80
              -translate-x-1/2 rounded-full
              bg-fuchsia-500/10 blur-3xl
            "
          />

          {/* Comic rays */}
          <div className="absolute inset-0 opacity-20">
            <div
              className="
                absolute left-1/2 top-[28%] h-[500px] w-[3px]
                -translate-x-1/2 rotate-[18deg] bg-white
              "
            />
            <div
              className="
                absolute left-1/2 top-[28%] h-[500px] w-[3px]
                -translate-x-1/2 -rotate-[18deg] bg-white
              "
            />
            <div
              className="
                absolute left-1/2 top-[28%] h-[500px] w-[3px]
                -translate-x-1/2 rotate-[42deg] bg-white
              "
            />
            <div
              className="
                absolute left-1/2 top-[28%] h-[500px] w-[3px]
                -translate-x-1/2 -rotate-[42deg] bg-white
              "
            />
          </div>
        </div>

        {/* Main card content */}
        <div className="relative z-10 p-3 sm:p-5">

          {/* Top label */}
          <div className="mb-2 flex items-center justify-between gap-2">
            <div
              className="
                rounded-full border-2 border-black
                bg-yellow-300 px-3 py-1
                text-[10px] font-black uppercase tracking-[0.16em]
                text-black shadow-[3px_3px_0_#000]
                sm:text-xs
              "
            >
              LOVEONS • POWER CARD
            </div>

            <div
              className="
                rounded-full border-2 border-black
                bg-white px-3 py-1
                text-[10px] font-black text-black
                shadow-[3px_3px_0_#000]
              "
            >
              LV. 99
            </div>
          </div>

          {/* Name title */}
          <div
            className="
              relative overflow-hidden rounded-2xl
              border-[3px] border-black
              bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-600
              px-4 py-3
              text-center
              shadow-[5px_5px_0_#000]
            "
          >
            <div
              className="
                absolute inset-x-0 top-0 h-1/2
                bg-white/15
              "
            />

            <h2
              className="
                relative z-10 break-words
                text-xl font-black uppercase italic
                tracking-tight text-white
                [text-shadow:3px_3px_0_#000]
                sm:text-2xl
              "
            >
              {displayName}
            </h2>

            <p
              className="
                relative z-10 mt-0.5
                text-[10px] font-black uppercase
                tracking-[0.3em] text-yellow-300
                [text-shadow:1px_1px_0_#000]
                sm:text-xs
              "
            >
              THE LOVE BOSS
            </p>
          </div>

          {/* Character area */}
          <div
            className="
              relative mt-4 overflow-hidden rounded-2xl
              border-[3px] border-black
              bg-gradient-to-b from-[#3b195b] via-[#24133b] to-[#100b18]
              shadow-[5px_5px_0_#000]
            "
          >
            {/* Character glow */}
            <div
              className="
                absolute left-1/2 top-[52%]
                h-48 w-48 -translate-x-1/2 -translate-y-1/2
                rounded-full bg-pink-500/30 blur-3xl
              "
            />

            {/* Sparkles */}
            <div className="absolute left-4 top-5 text-xl text-yellow-300">
              ✦
            </div>

            <div className="absolute right-5 top-8 text-lg text-pink-300">
              ✦
            </div>

            <div className="absolute left-8 top-28 text-sm text-white/70">
              ✧
            </div>

            <div className="absolute right-10 top-36 text-xl text-fuchsia-300">
              ✦
            </div>

            {/* Character SVG */}
            <div className="relative flex h-[330px] items-end justify-center sm:h-[360px]">
              <svg
                viewBox="0 0 360 380"
                className="h-full w-full max-w-[360px]"
                role="img"
                aria-label={`${displayName} anime love power avatar`}
              >
                <defs>
                  <linearGradient
                    id="bodyGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#ff4fa3" />
                    <stop offset="100%" stopColor="#713cff" />
                  </linearGradient>

                  <linearGradient
                    id="hairGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={isFemale ? '#ff4fa3' : '#7c3aed'}
                    />
                    <stop
                      offset="100%"
                      stopColor={isFemale ? '#7c3aed' : '#312e81'}
                    />
                  </linearGradient>

                  <linearGradient
                    id="eyeGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#ffd6f2" />
                  </linearGradient>

                  <filter id="avatarShadow">
                    <feDropShadow
                      dx="0"
                      dy="7"
                      stdDeviation="5"
                      floodColor="#000000"
                      floodOpacity="0.55"
                    />
                  </filter>
                </defs>

                {/* Cape / shoulders */}
                <path
                  d="M74 380 C82 316 112 292 180 288 C248 292 278 316 286 380Z"
                  fill="url(#bodyGradient)"
                  stroke="#000"
                  strokeWidth="8"
                />

                {/* Collar */}
                <path
                  d="M139 300 L180 338 L221 300 L238 380 L122 380Z"
                  fill="#17101f"
                  stroke="#000"
                  strokeWidth="7"
                />

                {/* Neck */}
                <path
                  d="M151 272 L151 314 Q180 335 209 314 L209 272Z"
                  fill={faceColor}
                  stroke="#000"
                  strokeWidth="7"
                />

                {/* Hair behind face */}
                {config.hairStyle !== 'bald' && (
                  <path
                    d={
                      config.hairStyle === 'curly'
                        ? 'M111 172 Q94 123 118 90 Q132 53 180 55 Q228 53 242 90 Q266 123 249 172 L231 135 Q218 107 180 108 Q142 107 129 135Z'
                        : 'M108 170 Q91 117 116 82 Q138 48 180 50 Q222 48 244 82 Q269 117 252 170 L232 125 Q214 90 180 90 Q146 90 128 125Z'
                    }
                    fill="url(#hairGradient)"
                    stroke="#000"
                    strokeWidth="8"
                    filter="url(#avatarShadow)"
                  />
                )}

                {/* Face */}
                <rect
                  x={180 - faceWidth / 2}
                  y={88}
                  width={faceWidth}
                  height={faceHeight}
                  rx={
                    config.faceStructure === 'square'
                      ? 28
                      : config.faceStructure === 'round'
                        ? 55
                        : 48
                  }
                  fill={faceColor}
                  stroke="#000"
                  strokeWidth="7"
                />

                {/* Hair front */}
                {config.hairStyle !== 'bald' && (
                  <>
                    {config.hairStyle === 'straight' ? (
                      <path
                        d="M111 128 Q111 66 180 63 Q249 66 249 128 L229 107 Q214 87 180 87 Q146 87 131 107Z"
                        fill="url(#hairGradient)"
                        stroke="#000"
                        strokeWidth="7"
                      />
                    ) : (
                      <>
                        <circle
                          cx="122"
                          cy="101"
                          r="24"
                          fill="url(#hairGradient)"
                          stroke="#000"
                          strokeWidth="6"
                        />
                        <circle
                          cx="146"
                          cy="77"
                          r="27"
                          fill="url(#hairGradient)"
                          stroke="#000"
                          strokeWidth="6"
                        />
                        <circle
                          cx="180"
                          cy="69"
                          r="30"
                          fill="url(#hairGradient)"
                          stroke="#000"
                          strokeWidth="6"
                        />
                        <circle
                          cx="214"
                          cy="77"
                          r="27"
                          fill="url(#hairGradient)"
                          stroke="#000"
                          strokeWidth="6"
                        />
                        <circle
                          cx="238"
                          cy="101"
                          r="24"
                          fill="url(#hairGradient)"
                          stroke="#000"
                          strokeWidth="6"
                        />
                      </>
                    )}
                  </>
                )}

                {/* Eyebrows */}
                <path
                  d="M131 153 Q148 143 161 151"
                  fill="none"
                  stroke="#25151b"
                  strokeWidth="7"
                  strokeLinecap="round"
                />

                <path
                  d="M199 151 Q212 143 229 153"
                  fill="none"
                  stroke="#25151b"
                  strokeWidth="7"
                  strokeLinecap="round"
                />

                {/* Left anime eye */}
                <ellipse
                  cx="147"
                  cy="176"
                  rx="23"
                  ry="27"
                  fill="url(#eyeGradient)"
                  stroke="#000"
                  strokeWidth="6"
                />

                <ellipse
                  cx="147"
                  cy="181"
                  rx="12"
                  ry="17"
                  fill="#7c3aed"
                  stroke="#000"
                  strokeWidth="3"
                />

                <ellipse
                  cx="147"
                  cy="184"
                  rx="6"
                  ry="10"
                  fill="#111827"
                />

                <circle cx="142" cy="170" r="5" fill="#fff" />
                <circle cx="152" cy="177" r="2.5" fill="#fff" />

                {/* Right anime eye */}
                <ellipse
                  cx="213"
                  cy="176"
                  rx="23"
                  ry="27"
                  fill="url(#eyeGradient)"
                  stroke="#000"
                  strokeWidth="6"
                />

                <ellipse
                  cx="213"
                  cy="181"
                  rx="12"
                  ry="17"
                  fill="#7c3aed"
                  stroke="#000"
                  strokeWidth="3"
                />

                <ellipse
                  cx="213"
                  cy="184"
                  rx="6"
                  ry="10"
                  fill="#111827"
                />

                <circle cx="208" cy="170" r="5" fill="#fff" />
                <circle cx="218" cy="177" r="2.5" fill="#fff" />

                {/* Blush */}
                <path
                  d="M124 215 l8 3 M122 221 l9 3 M236 215 l-8 3 M238 221 l-9 3"
                  stroke="#ff4f81"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Nose */}
                <path
                  d="M180 190 Q175 207 181 209"
                  fill="none"
                  stroke="#6b3f32"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Smile */}
                <path
                  d="M163 222 Q180 239 197 222"
                  fill="none"
                  stroke="#4a1f2c"
                  strokeWidth="5"
                  strokeLinecap="round"
                />

                {/* Glasses */}
                {config.glasses === 'glasses' && (
                  <g
                    fill="none"
                    stroke="#111827"
                    strokeWidth="6"
                  >
                    <rect
                      x="119"
                      y="155"
                      width="53"
                      height="42"
                      rx="13"
                      fill="#ffffff"
                      fillOpacity="0.16"
                    />

                    <rect
                      x="188"
                      y="155"
                      width="53"
                      height="42"
                      rx="13"
                      fill="#ffffff"
                      fillOpacity="0.16"
                    />

                    <path d="M172 171 Q180 166 188 171" />

                    <path
                      d="M119 166 L105 160"
                      strokeLinecap="round"
                    />

                    <path
                      d="M241 166 L255 160"
                      strokeLinecap="round"
                    />
                  </g>
                )}

                {/* Beard - male only */}
                {!isFemale && config.beardStyle !== 'clean' && (
                  <path
                    d={
                      config.beardStyle === 'stubble'
                        ? 'M139 222 Q180 248 221 222 L214 249 Q180 267 146 249Z'
                        : config.beardStyle === 'short'
                          ? 'M135 219 Q180 255 225 219 L218 260 Q180 280 142 260Z'
                          : 'M131 217 Q180 260 229 217 L220 279 Q180 307 140 279Z'
                    }
                    fill="#34251f"
                    fillOpacity={
                      config.beardStyle === 'stubble'
                        ? 0.45
                        : config.beardStyle === 'short'
                          ? 0.75
                          : 1
                    }
                    stroke="#000"
                    strokeWidth="5"
                  />
                )}

                {/* Heart power symbol */}
                <path
                  d="M180 326 C168 312 143 328 180 355 C217 328 192 312 180 326Z"
                  fill="#ff2f92"
                  stroke="#000"
                  strokeWidth="5"
                />

                {/* Character sparkle */}
                <path
                  d="M279 116 L284 129 L297 134 L284 139 L279 152 L274 139 L261 134 L274 129Z"
                  fill="#ffe14a"
                  stroke="#000"
                  strokeWidth="3"
                />
              </svg>
            </div>

            {/* Character type badge */}
            <div
              className="
                absolute bottom-3 left-1/2
                -translate-x-1/2
                rounded-full border-2 border-black
                bg-white px-4 py-1.5
                text-[10px] font-black uppercase
                tracking-[0.18em] text-black
                shadow-[3px_3px_0_#000]
              "
            >
              {isFemale ? 'LOVE QUEEN' : 'LOVE KING'}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4">
            <div
              className="
                mb-2 flex items-center justify-between
                text-white
              "
            >
              <h3
                className="
                  text-sm font-black uppercase italic
                  tracking-[0.12em]
                  [text-shadow:2px_2px_0_#000]
                "
              >
                Partner Stats
              </h3>

              <span className="text-xs font-bold text-pink-300">
                POWER RANK
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <StatBox
                label="Arguments Won"
                value="99%"
                type="danger"
              />

              <StatBox
                label="Patience Level"
                value="12%"
                type="warning"
                warning
              />

              <StatBox
                label="Cuteness"
                value="100%"
                type="success"
              />
            </div>
          </div>

          {/* Special ability */}
          <div
            className="
              mt-4 rounded-2xl border-[3px] border-dashed
              border-pink-300 bg-black/30
              p-4
            "
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="text-lg">⚡</span>

              <span
                className="
                  text-xs font-black uppercase
                  tracking-[0.12em] text-yellow-300
                "
              >
                Special Ability
              </span>
            </div>

            <h4
              className="
                text-lg font-black uppercase italic
                text-white
                [text-shadow:2px_2px_0_#000]
              "
            >
              Emotional Damage
            </h4>

            <p className="mt-1 text-xs font-medium leading-relaxed text-white/80">
              Can get any gift by just looking cute.
            </p>
          </div>

          {/* Bottom power strip */}
          <div
            className="
              mt-4 flex items-center justify-between
              rounded-xl border-[3px] border-black
              bg-yellow-300 px-3 py-2
              text-black shadow-[4px_4px_0_#000]
            "
          >
            <span className="text-[10px] font-black uppercase tracking-wider">
              LOVE POWER
            </span>

            <div className="flex items-center gap-1">
              <span className="text-sm">♥</span>
              <span className="text-sm">♥</span>
              <span className="text-sm">♥</span>
              <span className="text-sm">♥</span>
              <span className="text-sm">♥</span>
            </div>

            <span className="text-[10px] font-black uppercase tracking-wider">
              MAX
            </span>
          </div>

          {/* Footer */}
          <div className="mt-4 text-center">
            <p
              className="
                text-[10px] font-black uppercase
                tracking-[0.28em] text-white/60
              "
            >
              Loveons.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------ */
/* Stat Box                                         */
/* ------------------------------------------------ */

function StatBox({
  label,
  value,
  type,
  warning = false,
}: {
  label: string;
  value: string;
  type: 'danger' | 'warning' | 'success';
  warning?: boolean;
}) {
  const styles = {
    danger: {
      border: 'border-red-400',
      value: 'text-red-400',
      bg: 'bg-red-500/10',
    },
    warning: {
      border: 'border-orange-400',
      value: 'text-orange-400',
      bg: 'bg-orange-500/10',
    },
    success: {
      border: 'border-emerald-400',
      value: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
  };

  const current = styles[type];

  return (
    <div
      className={`
        relative rounded-xl border-2
        ${current.border} ${current.bg}
        px-2 py-3 text-center
      `}
    >
      {warning && (
        <span
          className="
            absolute -right-1.5 -top-2
            rounded-full border-2 border-black
            bg-orange-400 px-1.5 py-0.5
            text-[7px] font-black uppercase
            text-black
          "
        >
          Warning
        </span>
      )}

      <div
        className={`
          text-xl font-black
          ${current.value}
          [text-shadow:1px_1px_0_#000]
          sm:text-2xl
        `}
      >
        {value}
      </div>

      <div
        className="
          mt-1 text-[8px] font-bold
          uppercase leading-tight text-white/65
          sm:text-[9px]
        "
      >
        {label}
      </div>
    </div>
  );
}
