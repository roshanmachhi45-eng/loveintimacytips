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
      ? 112
      : config.faceStructure === 'square'
        ? 120
        : 108;

  const faceHeight =
    config.faceStructure === 'round'
      ? 120
      : config.faceStructure === 'square'
        ? 116
        : 130;

  const displayName =
    config.name.trim().slice(0, 20) || 'YOUR LOVER';

  return (
    <div className="mx-auto w-full max-w-[560px] px-1 sm:px-3">
      <div
        className="
          relative overflow-hidden rounded-[26px]
          border-[4px] border-black
          bg-[#120c1c]
          shadow-[0_10px_0_#000,0_18px_32px_rgba(0,0,0,0.28)]
        "
      >
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-52 w-52 rounded-full bg-pink-500/25 blur-3xl" />
          <div className="absolute -right-20 top-32 h-60 w-60 rounded-full bg-violet-500/25 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-3xl" />

          <div className="absolute left-[8%] top-[25%] h-px w-[85%] rotate-[18deg] bg-white/10" />
          <div className="absolute left-[8%] top-[42%] h-px w-[85%] rotate-[-16deg] bg-white/10" />
        </div>

        <div className="relative z-10 p-3 sm:p-4">

          {/* Top strip */}
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <div
              className="
                rounded-full border-2 border-black
                bg-yellow-300 px-3 py-1
                text-[9px] font-black uppercase
                tracking-[0.15em] text-black
                shadow-[3px_3px_0_#000]
                sm:text-[10px]
              "
            >
              LOVEONS • POWER CARD
            </div>

            <div
              className="
                rounded-full border-2 border-black
                bg-white px-3 py-1
                text-[9px] font-black text-black
                shadow-[3px_3px_0_#000]
              "
            >
              LV. 99
            </div>
          </div>

          {/* Name */}
          <div
            className="
              relative overflow-hidden rounded-2xl
              border-[3px] border-black
              bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-600
              px-3 py-2.5 text-center
              shadow-[4px_4px_0_#000]
            "
          >
            <div className="absolute inset-x-0 top-0 h-1/2 bg-white/10" />

            <h2
              className="
                relative z-10 break-words
                text-xl font-black uppercase italic
                leading-none tracking-tight text-white
                [text-shadow:3px_3px_0_#000]
                sm:text-2xl
              "
            >
              {displayName}
            </h2>

            <p
              className="
                relative z-10 mt-1
                text-[8px] font-black uppercase
                tracking-[0.32em] text-yellow-300
                [text-shadow:1px_1px_0_#000]
                sm:text-[10px]
              "
            >
              THE LOVE BOSS
            </p>
          </div>

          {/* Character panel */}
          <div
            className="
              relative mt-3 overflow-hidden rounded-2xl
              border-[3px] border-black
              bg-gradient-to-b from-[#32145a] via-[#21112f] to-[#110a18]
              shadow-[4px_4px_0_#000]
            "
          >
            {/* Decorative stars */}
            <span className="absolute left-4 top-4 text-xl text-yellow-300">
              ✦
            </span>

            <span className="absolute right-5 top-6 text-lg text-pink-300">
              ✦
            </span>

            <span className="absolute left-8 top-24 text-sm text-white/60">
              ✧
            </span>

            <span className="absolute right-8 top-28 text-xl text-fuchsia-300">
              ✦
            </span>

            {/* Glow */}
            <div className="absolute left-1/2 top-[48%] h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-500/20 blur-3xl" />

            {/* Character */}
            <div className="relative flex h-[270px] items-end justify-center sm:h-[300px]">
              <svg
                viewBox="0 0 360 330"
                className="h-full w-full max-w-[350px]"
                role="img"
                aria-label={`${displayName} anime love character`}
              >
                <defs>
                  <linearGradient
                    id="lpBody"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#ff4fa3" />
                    <stop offset="100%" stopColor="#713cff" />
                  </linearGradient>

                  <linearGradient
                    id="lpHair"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={isFemale ? '#ff4fa3' : '#8b5cf6'}
                    />
                    <stop
                      offset="100%"
                      stopColor={isFemale ? '#8b5cf6' : '#312e81'}
                    />
                  </linearGradient>

                  <linearGradient
                    id="lpEye"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#ffd6f5" />
                  </linearGradient>

                  <linearGradient
                    id="lpIris"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#d946ef" />
                    <stop offset="100%" stopColor="#5b21b6" />
                  </linearGradient>
                </defs>

                {/* Shoulder / body */}
                <path
                  d="M72 330 C78 274 116 254 180 254 C244 254 282 274 288 330Z"
                  fill="url(#lpBody)"
                  stroke="#000"
                  strokeWidth="8"
                />

                {/* Inner shirt */}
                <path
                  d="M128 330 L145 266 L180 295 L215 266 L232 330Z"
                  fill="#17111f"
                  stroke="#000"
                  strokeWidth="7"
                />

                {/* Neck */}
                <path
                  d="M151 237 L151 274 Q180 294 209 274 L209 237Z"
                  fill={faceColor}
                  stroke="#000"
                  strokeWidth="7"
                />

                {/* Hair behind head */}
                {config.hairStyle !== 'bald' && (
                  <path
                    d={
                      config.hairStyle === 'curly'
                        ? 'M105 150 Q88 105 108 72 Q125 39 180 42 Q235 39 252 72 Q272 105 255 150 L235 119 Q219 91 180 91 Q141 91 125 119Z'
                        : 'M104 151 Q87 98 110 62 Q133 32 180 35 Q227 32 250 62 Q273 98 256 151 L235 110 Q215 78 180 78 Q145 78 125 110Z'
                    }
                    fill="url(#lpHair)"
                    stroke="#000"
                    strokeWidth="8"
                  />
                )}

                {/* Face */}
                <rect
                  x={180 - faceWidth / 2}
                  y="72"
                  width={faceWidth}
                  height={faceHeight}
                  rx={
                    config.faceStructure === 'square'
                      ? 24
                      : config.faceStructure === 'round'
                        ? 52
                        : 45
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
                        d="M106 113 Q108 52 180 48 Q252 52 254 113 L230 92 Q212 69 180 69 Q148 69 130 92Z"
                        fill="url(#lpHair)"
                        stroke="#000"
                        strokeWidth="7"
                      />
                    ) : (
                      <>
                        <circle
                          cx="116"
                          cy="85"
                          r="23"
                          fill="url(#lpHair)"
                          stroke="#000"
                          strokeWidth="6"
                        />
                        <circle
                          cx="143"
                          cy="58"
                          r="26"
                          fill="url(#lpHair)"
                          stroke="#000"
                          strokeWidth="6"
                        />
                        <circle
                          cx="180"
                          cy="51"
                          r="29"
                          fill="url(#lpHair)"
                          stroke="#000"
                          strokeWidth="6"
                        />
                        <circle
                          cx="217"
                          cy="58"
                          r="26"
                          fill="url(#lpHair)"
                          stroke="#000"
                          strokeWidth="6"
                        />
                        <circle
                          cx="244"
                          cy="85"
                          r="23"
                          fill="url(#lpHair)"
                          stroke="#000"
                          strokeWidth="6"
                        />
                      </>
                    )}
                  </>
                )}

                {/* Eyebrows */}
                <path
                  d="M130 132 Q146 123 160 130"
                  fill="none"
                  stroke="#28171d"
                  strokeWidth="6"
                  strokeLinecap="round"
                />

                <path
                  d="M200 130 Q214 123 230 132"
                  fill="none"
                  stroke="#28171d"
                  strokeWidth="6"
                  strokeLinecap="round"
                />

                {/* Left eye */}
                <ellipse
                  cx="146"
                  cy="157"
                  rx="22"
                  ry="25"
                  fill="url(#lpEye)"
                  stroke="#000"
                  strokeWidth="5"
                />

                <ellipse
                  cx="146"
                  cy="161"
                  rx="12"
                  ry="17"
                  fill="url(#lpIris)"
                  stroke="#000"
                  strokeWidth="3"
                />

                <ellipse
                  cx="146"
                  cy="165"
                  rx="5"
                  ry="9"
                  fill="#111827"
                />

                <circle cx="140" cy="151" r="5" fill="#fff" />
                <circle cx="151" cy="157" r="2.5" fill="#fff" />

                {/* Right eye */}
                <ellipse
                  cx="214"
                  cy="157"
                  rx="22"
                  ry="25"
                  fill="url(#lpEye)"
                  stroke="#000"
                  strokeWidth="5"
                />

                <ellipse
                  cx="214"
                  cy="161"
                  rx="12"
                  ry="17"
                  fill="url(#lpIris)"
                  stroke="#000"
                  strokeWidth="3"
                />

                <ellipse
                  cx="214"
                  cy="165"
                  rx="5"
                  ry="9"
                  fill="#111827"
                />

                <circle cx="208" cy="151" r="5" fill="#fff" />
                <circle cx="219" cy="157" r="2.5" fill="#fff" />

                {/* Blush */}
                <path
                  d="M123 194 l8 3 M121 200 l9 3 M237 194 l-8 3 M239 200 l-9 3"
                  stroke="#ff4f81"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Nose */}
                <path
                  d="M180 174 Q175 190 181 192"
                  fill="none"
                  stroke="#6b3f32"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Smile */}
                <path
                  d="M163 204 Q180 219 197 204"
                  fill="none"
                  stroke="#4a1f2c"
                  strokeWidth="5"
                  strokeLinecap="round"
                />

                {/* Glasses */}
                {config.glasses === 'glasses' && (
                  <g
                    fill="rgba(255,255,255,0.10)"
                    stroke="#111827"
                    strokeWidth="6"
                  >
                    <rect
                      x="117"
                      y="138"
                      width="57"
                      height="43"
                      rx="13"
                    />

                    <rect
                      x="186"
                      y="138"
                      width="57"
                      height="43"
                      rx="13"
                    />

                    <path d="M174 153 Q180 149 186 153" />

                    <path
                      d="M117 149 L103 144"
                      strokeLinecap="round"
                    />

                    <path
                      d="M243 149 L257 144"
                      strokeLinecap="round"
                    />
                  </g>
                )}

                {/* Beard */}
                {!isFemale && config.beardStyle !== 'clean' && (
                  <path
                    d={
                      config.beardStyle === 'stubble'
                        ? 'M138 201 Q180 228 222 201 L216 226 Q180 242 144 226Z'
                        : config.beardStyle === 'short'
                          ? 'M134 199 Q180 232 226 199 L218 242 Q180 258 142 242Z'
                          : 'M130 198 Q180 237 230 198 L220 263 Q180 283 140 263Z'
                    }
                    fill="#34251f"
                    fillOpacity={
                      config.beardStyle === 'stubble'
                        ? 0.42
                        : config.beardStyle === 'short'
                          ? 0.78
                          : 1
                    }
                    stroke="#000"
                    strokeWidth="5"
                  />
                )}

                {/* Heart */}
                <path
                  d="M180 277 C168 263 145 278 180 303 C215 278 192 263 180 277Z"
                  fill="#ff2f92"
                  stroke="#000"
                  strokeWidth="5"
                />

                {/* Power sparkle */}
                <path
                  d="M277 105 L282 118 L295 123 L282 128 L277 141 L272 128 L259 123 L272 118Z"
                  fill="#ffe14a"
                  stroke="#000"
                  strokeWidth="3"
                />
              </svg>
            </div>

            {/* Character badge */}
            <div
              className="
                absolute bottom-2.5 left-1/2
                -translate-x-1/2
                rounded-full border-2 border-black
                bg-white px-4 py-1
                text-[9px] font-black uppercase
                tracking-[0.16em] text-black
                shadow-[3px_3px_0_#000]
              "
            >
              {isFemale ? 'LOVE QUEEN' : 'LOVE KING'}
            </div>
          </div>

          {/* Stats heading */}
          <div className="mt-3 flex items-center justify-between">
            <h3
              className="
                text-xs font-black uppercase italic
                tracking-[0.12em] text-white
                [text-shadow:2px_2px_0_#000]
                sm:text-sm
              "
            >
              Partner Stats
            </h3>

            <span className="text-[9px] font-black uppercase text-pink-300 sm:text-[10px]">
              POWER RANK
            </span>
          </div>

          {/* Stats */}
          <div className="mt-1.5 grid grid-cols-3 gap-1.5">
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

          {/* Ability */}
          <div
            className="
              mt-2.5 rounded-xl border-2 border-dashed
              border-pink-300 bg-black/25
              px-3 py-2.5
            "
          >
            <div className="flex items-center gap-1.5">
              <span className="text-sm">⚡</span>

              <span
                className="
                  text-[9px] font-black uppercase
                  tracking-[0.12em] text-yellow-300
                  sm:text-[10px]
                "
              >
                Special Ability
              </span>
            </div>

            <h4
              className="
                mt-0.5 text-base font-black uppercase italic
                text-white
                [text-shadow:2px_2px_0_#000]
                sm:text-lg
              "
            >
              Emotional Damage
            </h4>

            <p className="mt-0.5 text-[10px] leading-relaxed text-white/75 sm:text-xs">
              Can get any gift by just looking cute.
            </p>
          </div>

          {/* Love power */}
          <div
            className="
              mt-2.5 flex items-center justify-between
              rounded-xl border-[3px] border-black
              bg-yellow-300 px-3 py-1.5
              text-black shadow-[3px_3px_0_#000]
            "
          >
            <span className="text-[9px] font-black uppercase tracking-wider">
              LOVE POWER
            </span>

            <div className="flex items-center gap-0.5 text-xs">
              ♥ ♥ ♥ ♥ ♥
            </div>

            <span className="text-[9px] font-black uppercase tracking-wider">
              MAX
            </span>
          </div>

          {/* Footer */}
          <div className="mt-2 text-center">
            <p
              className="
                text-[8px] font-black uppercase
                tracking-[0.3em] text-white/55
                sm:text-[9px]
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
        px-1.5 py-2 text-center
      `}
    >
      {warning && (
        <span
          className="
            absolute -right-1 -top-2
            rounded-full border-2 border-black
            bg-orange-400 px-1.5 py-0.5
            text-[6px] font-black uppercase
            text-black
          "
        >
          Warning
        </span>
      )}

      <div
        className={`
          text-lg font-black
          ${current.value}
          [text-shadow:1px_1px_0_#000]
          sm:text-xl
        `}
      >
        {value}
      </div>

      <div
        className="
          mt-0.5 text-[7px] font-bold
          uppercase leading-tight text-white/65
          sm:text-[8px]
        "
      >
        {label}
      </div>
    </div>
  );
}
