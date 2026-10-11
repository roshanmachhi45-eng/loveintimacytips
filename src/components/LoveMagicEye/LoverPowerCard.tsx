import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { MagicEyeConfig } from './types';
import { getCosmicDailyResult } from './cosmicCardLogic';

interface LoverPowerCardProps {
  config: MagicEyeConfig;
}

const DISCLAIMER =
  'Disclaimer: For entertainment and romantic inspiration only. Not a scientific prediction.';

const SITE_URL = 'https://loveons.com/';

function StarField() {
  const stars = [
    [8, 12, 1.4],
    [19, 25, 1],
    [85, 11, 1.5],
    [92, 29, 1],
    [12, 42, 0.8],
    [78, 37, 1.5],
    [90, 53, 0.8],
    [7, 65, 1.5],
    [24, 72, 1],
    [83, 76, 1.5],
    [15, 88, 0.8],
    [94, 91, 1],
    [35, 9, 0.8],
    [67, 18, 1],
    [6, 31, 0.8],
    [95, 43, 1],
    [28, 56, 0.8],
    [72, 61, 1],
    [42, 81, 1.5],
    [62, 91, 0.8],
    [48, 16, 0.8],
    [56, 70, 1],
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
      aria-label="A glowing planet in a cosmic universe"
      className="h-auto w-full"
    >
      <defs>
        <radialGradient id="loveonsPlanetSurface" cx="30%" cy="25%" r="80%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="22%" stopColor={secondary} />
          <stop offset="62%" stopColor={primary} />
          <stop offset="100%" stopColor="#130b31" />
        </radialGradient>

        <linearGradient
          id="loveonsPlanetRing"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="40%" stopColor={secondary} />
          <stop offset="70%" stopColor={primary} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.25" />
        </linearGradient>

        <radialGradient id="loveonsPlanetGlow">
          <stop offset="0%" stopColor={glow} stopOpacity="0.65" />
          <stop offset="65%" stopColor={glow} stopOpacity="0.16" />
          <stop offset="100%" stopColor={glow} stopOpacity="0" />
        </radialGradient>

        <clipPath id="loveonsPlanetClip">
          <circle cx="160" cy="126" r="68" />
        </clipPath>

        <filter id="loveonsPlanetShadow">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>

      <circle
        cx="160"
        cy="126"
        r="112"
        fill="url(#loveonsPlanetGlow)"
      />

      <circle
        cx="160"
        cy="126"
        r="78"
        fill={glow}
        opacity="0.18"
        filter="url(#loveonsPlanetShadow)"
      />

      <ellipse
        cx="160"
        cy="143"
        rx="112"
        ry="32"
        transform="rotate(-19 160 143)"
        fill="none"
        stroke="url(#loveonsPlanetRing)"
        strokeWidth="2.5"
        opacity="0.9"
      />

      <circle
        cx="160"
        cy="126"
        r="68"
        fill="url(#loveonsPlanetSurface)"
      />

      <g clipPath="url(#loveonsPlanetClip)">
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
        <linearGradient
          id="loveonsGemSurface"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="28%" stopColor={secondary} />
          <stop offset="62%" stopColor={primary} />
          <stop offset="100%" stopColor="#1b0c3b" />
        </linearGradient>

        <radialGradient id="loveonsGemGlow">
          <stop offset="0%" stopColor={glow} stopOpacity="0.65" />
          <stop offset="100%" stopColor={glow} stopOpacity="0" />
        </radialGradient>

        <filter id="loveonsGemShadow">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      <circle
        cx="75"
        cy="73"
        r="61"
        fill="url(#loveonsGemGlow)"
      />

      <circle
        cx="75"
        cy="73"
        r="37"
        fill={glow}
        opacity="0.28"
        filter="url(#loveonsGemShadow)"
      />

      <g transform="translate(75 70)">
        <path
          d="M-36 -17 L-17 -37 L17 -37 L36 -17 L26 20 L0 40 L-26 20 Z"
          fill="url(#loveonsGemSurface)"
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

function makeShareMessage(
  name: string,
  planet: string,
  gemstone: string,
  loveMessage: string
) {
  return [
    `✨ The Universe of ${name} ✨`,
    '',
    '🌌 Your Cosmic Love Reading',
    `🪐 Planet: ${planet}`,
    `💎 Gemstone: ${gemstone}`,
    '',
    '💕 A Message for Your Heart',
    loveMessage,
    '',
    '✨ Let the universe inspire your love story.',
    '',
    `Discover your cosmic love card on Loveons: ${SITE_URL}`,
    '',
    DISCLAIMER,
  ].join('\n');
}

export default function LoverPowerCard({
  config,
}: LoverPowerCardProps) {
  const result = getCosmicDailyResult(config);
  const [copyStatus, setCopyStatus] = useState('');
  const [shareStatus, setShareStatus] = useState('');

  const name = config.name.trim() || 'Your Love';

  const cardStyle = {
    '--cosmic-background': result.background,
    '--cosmic-primary': result.primaryColor,
    '--cosmic-secondary': result.secondaryColor,
    '--cosmic-glow': result.glowColor,
  } as CSSProperties;

  const shareMessage = makeShareMessage(
    name,
    result.planetName,
    result.gemstoneName,
    result.loveMessage
  );

  const encodedMessage = encodeURIComponent(shareMessage);
  const encodedUrl = encodeURIComponent(SITE_URL);

  const shareToWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodedMessage}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const shareToTelegram = () => {
    window.open(
      `https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const shareToX = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodedMessage}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const shareToPinterest = () => {
    const description = encodeURIComponent(
      `The Universe of ${name} ✨ ${result.planetName}, ${result.gemstoneName}. ${result.loveMessage} ${DISCLAIMER}`
    );

    window.open(
      `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${description}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopyStatus('Message copied successfully! 💖');
    } catch {
      setCopyStatus(
        'Copy was unavailable in this browser. Please select and copy the message manually.'
      );
    }
  };

  const nativeShare = async () => {
    if (!navigator.share) {
      setShareStatus('Quick sharing is not supported by this browser.');
      return;
    }

    try {
      await navigator.share({
        title: `The Universe of ${name} | Loveons`,
        text: shareMessage,
        url: SITE_URL,
      });
      setShareStatus('Share menu opened successfully.');
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setShareStatus('Sharing could not be completed. Please try another option.');
      }
    }
  };

  return (
    <section
      className="mx-auto w-full max-w-md"
      aria-label={`Cosmic Love Astro Card for ${name}`}
    >
      {/* Cosmic card: 3:4 ratio, matching a 600 × 800 design */}
      <div
        className="relative isolate flex w-full flex-col overflow-hidden rounded-[28px] border border-white/20 p-4 text-white shadow-2xl sm:p-5"
        style={{
          ...cardStyle,
          aspectRatio: '3 / 4',
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
        <header className="relative z-10 shrink-0 text-center">
          <p
            className="text-[9px] font-semibold uppercase tracking-[0.3em] sm:text-[10px]"
            style={{ color: result.secondaryColor }}
          >
            LOVEONS • COSMIC LOVE
          </p>

          <div className="mx-auto mt-2 flex items-center justify-center gap-2">
            <span
              className="h-px w-7"
              style={{ background: result.primaryColor }}
            />

            <span
              className="text-[8px] uppercase tracking-[0.2em] sm:text-[9px]"
              style={{ color: result.secondaryColor }}
            >
              Your Cosmic Universe
            </span>

            <span
              className="h-px w-7"
              style={{ background: result.primaryColor }}
            />
          </div>

          <h2
            className="mt-2 break-words text-2xl font-semibold leading-tight tracking-tight sm:text-3xl"
            style={{
              color: '#ffffff',
              textShadow: `0 0 22px ${result.glowColor}90`,
            }}
          >
            The Universe
            <br />
            <span style={{ color: result.primaryColor }}>
              of {name}
            </span>
          </h2>

          <p className="mt-1 text-[10px] tracking-wide text-white/65 sm:text-xs">
            A little universe made just for you
          </p>
        </header>

        {/* Planet illustration */}
        <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-[245px] flex-1 items-center justify-center">
          <PlanetArtwork
            primary={result.primaryColor}
            secondary={result.secondaryColor}
            glow={result.glowColor}
          />
        </div>

        {/* Planet and gemstone information */}
        <div className="relative z-10 grid shrink-0 grid-cols-2 gap-2">
          <div
            className="rounded-xl border p-2 text-center sm:p-3"
            style={{
              background: '#ffffff08',
              borderColor: `${result.primaryColor}55`,
              backdropFilter: 'blur(12px)',
            }}
          >
            <p className="text-[8px] uppercase tracking-[0.18em] text-white/55">
              Your Planet
            </p>

            <p
              className="mt-1 text-base font-semibold sm:text-lg"
              style={{ color: result.primaryColor }}
            >
              {result.planetName}
            </p>

            <p className="mt-1 text-[9px] text-white/60">
              Cosmic guide
            </p>
          </div>

          <div
            className="rounded-xl border p-2 text-center sm:p-3"
            style={{
              background: '#ffffff08',
              borderColor: `${result.secondaryColor}55`,
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="mx-auto w-10 sm:w-12">
              <GemstoneArtwork
                primary={result.primaryColor}
                secondary={result.secondaryColor}
                glow={result.glowColor}
              />
            </div>

            <p
              className="text-sm font-semibold sm:text-base"
              style={{ color: result.secondaryColor }}
            >
              {result.gemstoneName}
            </p>

            <p className="mt-1 text-[9px] text-white/60">
              Cosmic gemstone
            </p>
          </div>
        </div>

        {/* Romantic message */}
        <div
          className="relative z-10 mt-3 shrink-0 rounded-xl border px-3 py-3 text-center sm:px-4"
          style={{
            background: 'linear-gradient(135deg, #ffffff12, #ffffff05)',
            borderColor: `${result.primaryColor}60`,
            backdropFilter: 'blur(14px)',
            boxShadow: `inset 0 0 24px ${result.glowColor}0c`,
          }}
        >
          <div
            className="mb-1 text-base"
            style={{ color: result.primaryColor }}
            aria-hidden="true"
          >
            ✧ ♥ ✧
          </div>

          <p
            className="text-[9px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: result.secondaryColor }}
          >
            A Message for Your Heart
          </p>

          <p className="mt-2 text-xs leading-5 text-white/90 sm:text-sm sm:leading-6">
            {result.loveMessage}
          </p>

          <p className="mt-2 text-[10px] italic text-white/65">
            The universe is full of little moments worth cherishing.
          </p>
        </div>

        {/* Footer and disclaimer */}
        <footer className="relative z-10 mt-auto shrink-0 pt-2 text-center">
          <div
            className="mx-auto mb-2 h-px w-16"
            style={{
              background: `linear-gradient(90deg, transparent, ${result.secondaryColor}, transparent)`,
            }}
          />

          <p
            className="text-[8px] font-medium uppercase tracking-[0.2em] sm:text-[9px]"
            style={{ color: result.secondaryColor }}
          >
            Made of stars • Made for love
          </p>

          <p className="mt-1 text-[8px] text-white/45">
            A creative cosmic reflection by Loveons
          </p>

          <p className="mt-1 text-[7px] leading-3 text-white/40 sm:text-[8px]">
            {DISCLAIMER}
          </p>
        </footer>
      </div>

      {/* Sharing tools */}
      <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-white shadow-lg">
        <h3 className="text-center text-lg font-semibold">
          Share the Cosmic Love 💖
        </h3>

        <p className="mt-1 text-center text-sm text-white/65">
          Send a little cosmic romance to someone special.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={shareToWhatsApp}
            className="rounded-xl bg-green-600 px-3 py-3 text-sm font-semibold text-white transition hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            WhatsApp
          </button>

          <button
            type="button"
            onClick={shareToTelegram}
            className="rounded-xl bg-sky-600 px-3 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-300"
          >
            Telegram
          </button>

          <button
            type="button"
            onClick={shareToX}
            className="rounded-xl bg-neutral-800 px-3 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            Share on X
          </button>

          <button
            type="button"
            onClick={shareToPinterest}
            className="rounded-xl bg-red-700 px-3 py-3 text-sm font-semibold text-white transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
          >
            Pinterest
          </button>

          <button
            type="button"
            onClick={copyMessage}
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-3 text-sm font-semibold text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            Copy Message
          </button>

          <button
            type="button"
            onClick={nativeShare}
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-3 text-sm font-semibold text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            More Options
          </button>
        </div>

        {copyStatus && (
          <p
            role="status"
            className="mt-3 break-words text-center text-sm text-emerald-300"
          >
            {copyStatus}
          </p>
        )}

        {shareStatus && (
          <p
            role="status"
            className="mt-3 break-words text-center text-sm text-white/70"
          >
            {shareStatus}
          </p>
        )}

        <p className="mt-4 text-center text-[11px] leading-5 text-white/45">
          {DISCLAIMER}
        </p>
      </div>
    </section>
  );
}
