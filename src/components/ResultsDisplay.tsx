
import { useEffect, useState } from 'react';
import {
  Heart,
  Sparkles,
  RefreshCw,
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import type { RecommendationResult } from '../lib/recommendations';

interface ResultsDisplayProps {
  result: RecommendationResult;
  onReset: () => void;
}

const difficultyColors: Record<string, string> = {
  Beginner: 'bg-emerald-100 text-emerald-700',
  Intermediate: 'bg-amber-100 text-amber-700',
  Advanced: 'bg-rose-100 text-rose-700',
};

const FALLBACK_IMAGE =
  '/images/recommendations/lasting-love.webp';

function handleImgError(
  e: React.SyntheticEvent<HTMLImageElement>
) {
  const img = e.currentTarget;

  if (
    img.src !== FALLBACK_IMAGE &&
    !img.src.endsWith('lasting-love.webp')
  ) {
    img.src = FALLBACK_IMAGE;
  }
}

export default function ResultsDisplay({
  result,
  onReset,
}: ResultsDisplayProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let current = 0;

    const target = result.score;

    const interval = setInterval(() => {
      current += 2;

      if (current >= target) {
        current = target;
        clearInterval(interval);
      }

      setDisplayScore(current);
    }, 25);

    return () => clearInterval(interval);
  }, [result.score]);

  const circumference = 2 * Math.PI * 52;

  const strokeDashoffset =
    circumference -
    (displayScore / 100) * circumference;

  /*
   * Shared result message
   */
  const getShareText = () => {
    return `❤️ Loveons Love Match

Our Love Match Score is ${result.score}%.

Discover your own love match on Loveons.com ❤️

For entertainment purposes only. Loveons results are not scientific.`;
  };

  /*
   * Current page URL
   */
  const getShareUrl = () => {
    if (
      typeof window !== 'undefined'
    ) {
      return window.location.href;
    }

    return 'https://loveons.com';
  };

  /*
   * Native device sharing
   */
  const handleNativeShare = async () => {
    const shareText = getShareText();
    const shareUrl = getShareUrl();

    if (
      typeof navigator !== 'undefined' &&
      navigator.share
    ) {
      try {
        await navigator.share({
          title: 'Loveons.com ❤️ Love Match',
          text: shareText,
          url: shareUrl,
        });

        return;
      } catch (error) {
        /*
         * User cancelled the share sheet.
         * Do nothing.
         */
        if (
          error instanceof DOMException &&
          error.name === 'AbortError'
        ) {
          return;
        }
      }
    }

    /*
     * If native sharing is not supported,
     * copy the result instead.
     */
    await handleCopyLink();
  };

  /*
   * WhatsApp
   */
  const handleWhatsAppShare = () => {
    const text =
      `${getShareText()}\n\n${getShareUrl()}`;

    const whatsappUrl =
      `https://wa.me/?text=${encodeURIComponent(text)}`;

    window.open(
      whatsappUrl,
      '_blank',
      'noopener,noreferrer'
    );
  };

  /*
   * Facebook
   */
  const handleFacebookShare = () => {
    const shareUrl =
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        getShareUrl()
      )}`;

    window.open(
      shareUrl,
      '_blank',
      'noopener,noreferrer'
    );
  };

  /*
   * X / Twitter
   */
  const handleXShare = () => {
    const text =
      `❤️ My Loveons Love Match Score is ${result.score}%!`;

    const xUrl =
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}&url=${encodeURIComponent(
        getShareUrl()
      )}`;

    window.open(
      xUrl,
      '_blank',
      'noopener,noreferrer'
    );
  };

  /*
   * Telegram
   */
  const handleTelegramShare = () => {
    const telegramUrl =
      `https://t.me/share/url?url=${encodeURIComponent(
        getShareUrl()
      )}&text=${encodeURIComponent(
        getShareText()
      )}`;

    window.open(
      telegramUrl,
      '_blank',
      'noopener,noreferrer'
    );
  };

  /*
   * Copy link
   */
  const handleCopyLink = async () => {
    const shareText =
      `${getShareText()}\n\n${getShareUrl()}`;

    try {
      if (
        navigator.clipboard &&
        window.isSecureContext
      ) {
        await navigator.clipboard.writeText(
          shareText
        );
      } else {
        const textarea =
          document.createElement('textarea');

        textarea.value = shareText;

        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';

        document.body.appendChild(textarea);

        textarea.focus();
        textarea.select();

        document.execCommand('copy');

        document.body.removeChild(textarea);
      }

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-4 fade-in">

      {/* Score Card */}
      <div className="result-card bg-white rounded-3xl shadow-xl shadow-rose-100 border border-rose-100 p-6 text-center">

        <div className="flex items-center justify-center gap-2 mb-4">

          <Sparkles className="w-5 h-5 text-purple-500" />

          <h2 className="font-display text-xl font-bold text-gray-800">
            Your Compatibility Score
          </h2>

        </div>

        <div className="relative inline-flex items-center justify-center mb-4">

          <svg
            className="w-32 h-32 -rotate-90"
            viewBox="0 0 120 120"
          >

            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="#ffe4e6"
              strokeWidth="10"
            />

            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="url(#scoreGradient)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                transition:
                  'stroke-dashoffset 0.05s linear',
              }}
            />

            <defs>

              <linearGradient
                id="scoreGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >

                <stop
                  offset="0%"
                  stopColor="#f43f5e"
                />

                <stop
                  offset="100%"
                  stopColor="#a855f7"
                />

              </linearGradient>

            </defs>

          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">

            <span className="score-number font-display text-4xl font-bold bg-gradient-to-r from-rose-500 to-purple-500 bg-clip-text text-transparent">
              {displayScore}
            </span>

            <span className="text-xs text-gray-400 font-medium">
              out of 100
            </span>

          </div>

        </div>

        <p className="text-sm text-gray-600 leading-relaxed px-2">
          {result.summary}
        </p>

      </div>

      {/* Random Images - Pink Tinted */}
      <div className="result-card bg-white rounded-3xl shadow-xl shadow-rose-100 border border-rose-100 p-6">

        <div className="flex items-center gap-2 mb-4">

          <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />

          <h3 className="font-display text-lg font-bold text-gray-800">
            Moments of Love
          </h3>

        </div>

        <div className="grid grid-cols-3 gap-3">

          {result.images.map((img, i) => (

            <div
              key={i}
              className="relative rounded-2xl overflow-hidden group aspect-[3/4]"
            >

              <img
                src={img.url}
                alt={img.caption}
                onError={handleImgError}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />

              {/* Pink tint overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-rose-500/40 via-rose-400/20 to-pink-300/30 mix-blend-multiply" />

              <div className="absolute inset-0 bg-rose-500/10" />

              <div className="absolute bottom-0 left-0 right-0 p-2">

                <p className="text-xs font-semibold text-white drop-shadow-md text-center">
                  {img.caption}
                </p>

              </div>

            </div>

          ))}

        </div>

      </div>

      {/* Tips Card */}
      <div className="result-card bg-white rounded-3xl shadow-xl shadow-rose-100 border border-rose-100 p-6">

        <div className="flex items-center gap-2 mb-4">

          <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />

          <h3 className="font-display text-lg font-bold text-gray-800">
            Relationship Tips
          </h3>

        </div>

        <div className="space-y-4">

          {result.tips.map((tip, i) => (

            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-xl bg-rose-50/50 border border-rose-100"
            >

              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-rose-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                {i + 1}
              </div>

              <div>

                <h4 className="font-semibold text-gray-800 text-sm mb-1">
                  {tip.title}
                </h4>

                <p className="text-sm text-gray-600 leading-relaxed">
                  {tip.text}
                </p>

              </div>

            </div>

          ))}

        </div>

      </div>

      {/* Activities Card */}
      <div className="result-card bg-white rounded-3xl shadow-xl shadow-rose-100 border border-rose-100 p-6">

        <div className="flex items-center gap-2 mb-4">

          <Sparkles className="w-5 h-5 text-purple-500" />

          <h3 className="font-display text-lg font-bold text-gray-800">
            Recommended Couple Activities
          </h3>

        </div>

        <p className="text-xs text-gray-400 mb-4">
          Based on your personalities and connection
        </p>

        <div className="space-y-3">

          {result.activities.map((act, i) => (

            <div
              key={i}
              className="p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-purple-50 border border-rose-100 hover:shadow-md hover:shadow-rose-100 transition-all"
            >

              <div className="flex items-start justify-between gap-2 mb-2">

                <div className="flex items-center gap-2">

                  <span className="text-2xl">
                    {act.emoji}
                  </span>

                  <h4 className="font-display font-bold text-gray-800 text-base">
                    {act.name}
                  </h4>

                </div>

                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    difficultyColors[act.difficulty]
                  }`}
                >
                  {act.difficulty}
                </span>

              </div>

              <p className="text-sm text-gray-600 leading-relaxed mb-2">
                {act.description}
              </p>

              <p className="text-xs text-rose-500 font-medium">

                <span className="font-semibold">
                  Benefits:
                </span>{' '}

                {act.benefits}

              </p>

            </div>

          ))}

        </div>

      </div>

      {/* Share Section */}
      <div className="result-card bg-white rounded-3xl shadow-xl shadow-rose-100 border border-rose-100 p-5">

        <div className="text-center mb-4">

          <div className="flex items-center justify-center gap-2 mb-1">

            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />

            <h3 className="font-display text-lg font-bold text-gray-800">
              Share Your Love Match
            </h3>

          </div>

          <p className="text-xs text-gray-400">
            Share your Loveons result with friends
          </p>

        </div>

        {/* Main Share Button */}
        <button
          type="button"
          onClick={handleNativeShare}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-500 text-white font-semibold text-sm shadow-lg shadow-rose-200 hover:from-rose-600 hover:to-purple-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >

          <Share2 className="w-4 h-4" />

          Share Your Result

        </button>

        {/* Social buttons */}
        <div className="grid grid-cols-2 gap-2 mt-3">

          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-semibold hover:bg-[#1da851] active:scale-[0.98] transition-all"
          >
            WhatsApp
          </button>

          <button
            type="button"
            onClick={handleFacebookShare}
            className="py-2.5 rounded-xl bg-[#1877F2] text-white text-xs font-semibold hover:bg-[#166fe5] active:scale-[0.98] transition-all"
          >
            Facebook
          </button>

          <button
            type="button"
            onClick={handleXShare}
            className="py-2.5 rounded-xl bg-black text-white text-xs font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all"
          >
            X
          </button>

          <button
            type="button"
            onClick={handleTelegramShare}
            className="py-2.5 rounded-xl bg-[#229ED9] text-white text-xs font-semibold hover:bg-[#1d8fc5] active:scale-[0.98] transition-all"
          >
            Telegram
          </button>

        </div>

        {/* Copy Result */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="w-full mt-2 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >

          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-500" />

              <span className="text-emerald-600">
                Result Copied!
              </span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />

              Copy Result
            </>
          )}

        </button>

        {/* Disclaimer */}
        <p className="text-[10px] text-gray-400 text-center leading-relaxed mt-3 px-2">
          For entertainment purposes only. Loveons results are not scientific and should not be used as a measure of real relationship compatibility.
        </p>

      </div>

      {/* Reset Button */}
      <button
        type="button"
        onClick={onReset}
        className="w-full py-3.5 rounded-2xl bg-white border-2 border-rose-200 text-rose-600 font-semibold text-sm shadow-sm hover:bg-rose-50 hover:border-rose-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >

        <RefreshCw className="w-4 h-4" />

        Start Over

      </button>

    </div>
  );
}
