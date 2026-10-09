import type { CSSProperties } from 'react';
import type { MagicEyeConfig } from './types';
import { getCosmicDailyResult } from './cosmicCardLogic';

interface LoverPowerCardProps {
  config: MagicEyeConfig;
}

function StarField() {
  const stars = [
    [8, 12, 2], [19, 25, 1.5], [85, 11, 2],
    [92, 29, 1.5], [12, 42, 1], [78, 37, 2],
    [90, 53, 1], [7, 65, 2], [24, 72, 1.5],
    [83, 76, 2], [15, 88, 1], [94, 91, 1.5],
    [35, 9, 1], [67, 18, 1.5], [6, 31, 1],
    [95, 43, 1.5], [28, 56, 1], [72, 61, 1.5],
    [42, 81, 2], [62, 91, 1],
  ];

  return (
    <>
      {stars.map(([x, y, size], index) => (
        <circle
          key={index}
          cx={`${x}%`}
          cy={`${y}%`}
          r={size}
          fill="#ffffff"
          opacity={index % 3 === 0 ? 0.95 : 0.55}
        />
      ))}
    </>
  );
}

function PlanetArtwork({
  primary,
  secondary,
  glow,
}: {
  primary: string;
  secondary: string;
  glow: string;
}) {
  return (
    <svg
      viewBox="0 0 320 270"
      role="img"
      aria-label="A glowing planet floating in a cosmic nebula"
      className="h-auto w-full"
    >
      <defs>
        <radialGradient id="cosmicPlanetSurface" cx="30%" cy="25%" r="80%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="22%" stopColor={secondary} />
          <stop offset="62%" stopColor={primary} />
          <stop offset="100%" stopColor="#130b31" />
        </radialGradient>

        <linearGradient id="cosmicPlanetRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="40%" stopColor={secondary} />
          <stop offset="70%" stopColor={primary} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.25" />
        </linearGradient>

        <radialGradient id="cosmicPlanetGlow">
          <stop offset="0%" stopColor={glow} stopOpacity="0.65" />
          <stop offset="65%" stopColor={glow} stopOpacity="0.16" />
          <stop offset="100%" stopColor={glow} stopOpacity="0" />
        </radialGradient>

        <clipPath id="cosmicPlanetClip">
          <circle cx="160" cy="126" r="68" />
        </clipPath>

        <filter id="cosmicPlanetShadow">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>

      <circle
        cx="160"
        cy="126"
        r="112"
        fill="url(#cosmicPlanetGlow)"
      />

      <circle
        cx="160"
        cy="126"
        r="78"
        fill={glow}
        opacity="0.18"
        filter="url(#cosmicPlanetShadow)"
      />

      <ellipse
        cx="160"
        cy="143"
        rx="112"
        ry="32"
        transform="rotate(-19 160 143)"
        fill="none"
        stroke="url(#cosmicPlanetRing)"
        strokeWidth="2.5"
        opacity="0.9"
      />

      <ellipse
        cx="160"
        cy="143"
        rx="112"
        ry="32"
        transform="rotate(-19 160 143)"
        fill="none"
        stroke="#ffffff"
        strokeWidth="0.7"
        opacity="0.65"
      />

      <circle
        cx="160"
        cy="126"
        r="68"
        fill="url(#cosmicPlanetSurface)"
      />

      <g clipPath="url(#cosmicPlanetClip)">
        <path
          d="M75 112 Q110 75 145 104 T220 91 T250 119"
          fill="none"
          stroke="#ffffff"
          strokeWidth="12"
          opacity="0.12"
        />

        <path
          d="M80 151 Q122 125 153 150 T222 139 T244 165"
          fill="none"
          stroke={secondary}
          strokeWidth="17"
          opacity="0.35"
        />

        <path
          d="M92 178 Q132 150 163 177 T223 163"
          fill="none"
          stroke="#ffffff"
          strokeWidth="5"
          opacity="0.18"
        />

        <circle cx="124" cy="93" r="14" fill="#ffffff" opacity="0.1" />
        <circle cx="193" cy="153" r="22" fill="#170b35" opacity="0.12" />
      </g>

      <circle
        cx="160"
        cy="126"
        r="68"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1"
        opacity="0.65"
      />

      <path
        d="M120 77 Q140 61 161 62"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.7"
      />

      <ellipse
        cx="160"
        cy="143"
        rx="112"
        ry="32"
        transform="rotate(-19 160 143)"
        fill="none"
        stroke={primary}
        strokeWidth="3"
        strokeDasharray="78 240"
        strokeLinecap="round"
      />

      <circle cx="78" cy="171" r="3" fill="#ffffff" />
      <circle cx="244" cy="107" r="2.5" fill="#ffffff" />
      <circle cx="222" cy="57" r="2" fill={secondary} />
    </svg>
  );
}

function GemstoneArtwork({
  primary,
  secondary,
  glow,
}: {
  primary: string;
  secondary: string;
  glow: string;
}) {
  return (
    <svg
      viewBox="0 0 150 145"
      role="img"
      aria-label="A sparkling cosmic gemstone"
      className="h-auto w-full"
    >
      <defs>
        <linearGradient id="cosmicGemSurface" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="28%" stopColor={secondary} />
          <stop offset="62%" stopColor={primary} />
          <stop offset="100%" stopColor="#1b0c3b" />
        </linearGradient>

        <radialGradient id="cosmicGemGlow">
          <stop offset="0%" stopColor={glow} stopOpacity="0.65" />
          <stop offset="100%" stopColor={glow} stopOpacity="0" />
        </radialGradient>

        <filter id="cosmicGemShadow">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      <circle
        cx="75"
        cy="73"
        r="61"
        fill="url(#cosmicGemGlow)"
      />

      <circle
        cx="75"
        cy="73"
        r="37"
        fill={glow}
        opacity="0.28"
        filter="url(#cosmicGemShadow)"
      />

      <g transform="translate(75 70)">
        <path
          d="M-36 -17 L-17 -37 L17 -37 L36 -17 L26 20 L0 40 L-26 20 Z"
          fill="url(#cosmicGemSurface)"
          stroke="#ffffff"
          strokeWidth="1.2"
          strokeOpacity="0.85"
        />

        <path
          d="M-36 -17 L-17 -37 L-10 -10 L0 40 L-26 20 Z"
          fill="#ffffff"
          opacity="0.2"
        />

        <path
          d="M-17 -37 L17 -37 L0 -10 Z"
          fill="#ffffff"
          opacity="0.75"
        />

        <path
          d="M-17 -37 L-10 -10 L-36 -17 Z"
          fill={secondary}
          opacity="0.9"
        />

        <path
          d="M17 -37 L10 -10 L36 -17 Z"
          fill={primary}
          opacity="0.8"
        />

        <path
          d="M-36 -17 L-10 -10 L0 40 L-26 20 Z"
          fill={primary}
          opacity="0.65"
        />

        <path
          d="M36 -17 L10 -10 L0 40 L26 20 Z"
          fill="#14082f"
          opacity="0.45"
        />

        <path
          d="M-10 -10 L10 -10 L0 40 Z"
          fill={secondary}
          opacity="0.75"
        />

        <path
          d="M-17 -37 L-10 -10 L10 -10 L17 -37"
          fill="none"
          stroke="#ffffff"
          strokeWidth="0.8"
          opacity="0.75"
        />
      </g>

      <path
        d="M27 29 L31 39 L41 43 L31 47 L27 57 L23 47 L13 43 L23 39 Z"
        fill="#ffffff"
      />

      <path
        d="M119 90 L122 97 L129 100 L122 103 L119 110 L116 103 L109 100 L116 97 Z"
        fill="#ffffff"
      />

      <circle cx="112" cy="29" r="2" fill="#ffffff" />
      <circle cx="39" cy="107" r="1.8" fill={secondary} />
    </svg>
  );
}

export default function LoverPowerCard({
  config,
}: LoverPowerCardProps) {
  const result = getCosmicDailyResult(config);

  const cardStyle = {
    '--cosmic-background': result.background,
    '--cosmic-primary': result.primaryColor,
    '--cosmic-secondary': result.secondaryColor,
    '--cosmic-glow': result.glowColor,
  } as CSSProperties;

  return (
    <section
      className="mx-auto w-full max-w-md"
      aria-label={`Cosmic Love Astro Card for ${config.name || 'you'}`}
    >
      <div
        className="relative isolate overflow-hidden rounded-[28px] border border-white/20 p-5 text-white shadow-2xl sm:p-7"
        style={{
          ...cardStyle,
          background: `
            radial-gradient(ellipse at 12% 12%, ${result.primaryColor}35 0%, transparent 42%),
            radial-gradient(ellipse at 90% 55%, ${result.secondaryColor}30 0%, transparent 42%),
            linear-gradient(155deg, ${result.background} 0%, #09071b 58%, ${result.background} 100%)
          `,
          boxShadow: `0 0 35px ${result.glowColor}25, 0 25px 70px #00000055`,
        }}
      >
        {/* Decorative cosmic background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="h-full w-full"
            aria-hidden="true"
          >
            <StarField />

            <circle
              cx="50%"
              cy="47%"
              r="36%"
              fill="none"
              stroke={result.secondaryColor}
              strokeWidth="0.25"
              opacity="0.3"
            />

            <circle
              cx="50%"
              cy="47%"
              r="43%"
              fill="none"
              stroke={result.primaryColor}
              strokeWidth="0.2"
              strokeDasharray="1 3"
              opacity="0.45"
            />

            <path
              d="M50 10 L88 47 L50 84 L12 47 Z"
              fill="none"
              stroke="#ffffff"
              strokeWidth="0.2"
              opacity="0.16"
            />

            <path
              d="M50 18 L80 47 L50 76 L20 47 Z"
              fill="none"
              stroke={result.secondaryColor}
              strokeWidth="0.2"
              opacity="0.2"
            />
          </svg>
        </div>

        {/* Header */}
        <header className="relative z-10 text-center">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.35em] sm:text-xs"
            style={{ color: result.secondaryColor }}
          >
            LOVEONS • COSMIC LOVE
          </p>

          <div className="mx-auto mt-4 flex items-center justify-center gap-3">
            <span
              className="h-px w-9"
              style={{ background: result.primaryColor }}
            />

            <span
              className="text-[10px] uppercase tracking-[0.25em]"
              style={{ color: result.secondaryColor }}
            >
              Your Cosmic Universe
            </span>

            <span
              className="h-px w-9"
              style={{ background: result.primaryColor }}
            />
          </div>

          <h2
            className="mt-4 break-words text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"
            style={{
              color: '#ffffff',
              textShadow: `0 0 22px ${result.glowColor}90`,
            }}
          >
            The Universe
            <br />
            <span style={{ color: result.primaryColor }}>
              of {config.name.trim() || 'Your Love'}
            </span>
          </h2>

          <p className="mt-3 text-xs tracking-wide text-white/65">
            A little universe made just for you
          </p>
        </header>

        {/* Planet illustration */}
        <div className="relative z-10 mx-auto mt-2 w-full max-w-[320px]">
          <PlanetArtwork
            primary={result.primaryColor}
            secondary={result.secondaryColor}
            glow={result.glowColor}
          />
        </div>

        {/* Planet and gemstone information */}
        <div className="relative z-10 -mt-1 grid grid-cols-2 gap-3">
          <div
            className="rounded-2xl border p-3 text-center"
            style={{
              background: '#ffffff08',
              borderColor: `${result.primaryColor}55`,
              backdropFilter: 'blur(12px)',
            }}
          >
            <p className="text-[9px] uppercase tracking-[0.25em] text-white/55">
              Your Planet
            </p>

            <p
              className="mt-2 text-lg font-semibold"
              style={{ color: result.primaryColor }}
            >
              {result.planetName}
            </p>

            <p className="mt-1 text-[10px] text-white/60">
              Cosmic guide
            </p>
          </div>

          <div
            className="rounded-2xl border p-3 text-center"
            style={{
              background: '#ffffff08',
              borderColor: `${result.secondaryColor}55`,
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="mx-auto w-14">
              <GemstoneArtwork
                primary={result.primaryColor}
                secondary={result.secondaryColor}
                glow={result.glowColor}
              />
            </div>

            <p
              className="text-base font-semibold"
              style={{ color: result.secondaryColor }}
            >
              {result.gemstoneName}
            </p>

            <p className="mt-1 text-[10px] text-white/60">
              Cosmic gemstone
            </p>
          </div>
        </div>

        {/* Romantic message panel */}
        <div
          className="relative z-10 mt-5 rounded-2xl border px-4 py-5 text-center sm:px-5"
          style={{
            background: 'linear-gradient(135deg, #ffffff12, #ffffff05)',
            borderColor: `${result.primaryColor}60`,
            backdropFilter: 'blur(14px)',
            boxShadow: `inset 0 0 24px ${result.glowColor}0c`,
          }}
        >
          <div
            className="mb-3 text-xl"
            style={{ color: result.primaryColor }}
            aria-hidden="true"
          >
            ✧ ♥ ✧
          </div>

          <p
            className="text-[10px] font-semibold uppercase tracking-[0.3em]"
            style={{ color: result.secondaryColor }}
          >
            A Message for Your Heart
          </p>

          <p className="mt-4 text-sm leading-7 text-white/90 sm:text-base">
            {result.loveMessage}
          </p>

          <div
            className="mx-auto mt-4 h-px w-16"
            style={{
              background: `linear-gradient(90deg, transparent, ${result.primaryColor}, transparent)`,
            }}
          />

          <p className="mt-3 text-xs italic text-white/65">
            The universe is full of little moments worth cherishing.
          </p>
        </div>

        {/* Footer */}
        <footer className="relative z-10 mt-5 text-center">
          <div
            className="mx-auto mb-3 h-px w-20"
            style={{
              background: `linear-gradient(90deg, transparent, ${result.secondaryColor}, transparent)`,
            }}
          />

          <p
            className="text-[10px] font-medium uppercase tracking-[0.3em]"
            style={{ color: result.secondaryColor }}
          >
            Made of stars • Made for love
          </p>

          <p className="mt-2 text-[9px] text-white/40">
            A creative cosmic reflection by Loveons
          </p>
        </footer>
      </div>
    </section>
  );
}
