import { useEffect, useRef, useState } from 'react';
import {
  Share2,
  MessageCircle,
  Facebook,
  Twitter,
  Send,
  Instagram,
  Clock,
} from 'lucide-react';
import type { MagicEyeConfig } from './types';

interface ViralShareCardProps {
  config: MagicEyeConfig;
  canvasDataUrl: string;
  paletteName: string;
}

const COUNTDOWN_SECONDS = 60;

const VIRAL_COPY =
  "Did your partner's true face manifest in the digital holographic dimensions? If it appeared clearly, your romantic aura and spiritual connection are remarkably powerful! Still seeing only patterns? Your partner's modern vibes might be shielding their true form — share this instantly with your soulmate or closest friends to ask what hidden reality they can decipher in your custom aura chart!";

export default function ViralShareCard({
  config,
  canvasDataUrl,
  paletteName,
}: ViralShareCardProps) {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [showViral, setShowViral] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setSecondsLeft(COUNTDOWN_SECONDS);
    setShowViral(false);

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setShowViral(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const isFinished = secondsLeft === 0;

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/love-magic-eye`
    : 'https://www.loveons.com/love-magic-eye';

  const shareTitle = `${config.name.trim() || 'Your Partner'}'s Custom Relationship Aura Chart`;
  const shareDescription = `Check out our custom Relationship Aura Chart! Can you decode the hidden 3D energy of ${config.name.trim() || 'your partner'}?`;

  const shareText = `${shareDescription} Try Love Magic Eye on Loveons.com!`;

  const openShare = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleWhatsApp = () => {
    openShare(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`);
  };

  const handleFacebook = () => {
    openShare(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
  };

  const handleX = () => {
    openShare(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`);
  };

  const handleTelegram = () => {
    openShare(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`);
  };

  const handleInstagram = () => {
    // Instagram doesn't support web share URLs; open Instagram and copy link
    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl,
      }).catch(() => {
        copyToClipboard();
      });
    } else {
      copyToClipboard();
    }
  };

  const handlePinterest = () => {
    // Use the canvas data URL directly as the pinnable image media
    const pinUrl =
      `https://www.pinterest.com/pin/create/button/` +
      `?url=${encodeURIComponent(shareUrl)}` +
      `&media=${encodeURIComponent(canvasDataUrl || shareUrl)}` +
      `&description=${encodeURIComponent(shareDescription)}`;
    openShare(pinUrl);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    const text = `${shareText}\n\n${shareUrl}`;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text);
    }
  };

  const shareButtons = [
    { label: 'WhatsApp', icon: <MessageCircle className="h-5 w-5" />, handler: handleWhatsApp, color: 'bg-[#25D366] hover:bg-[#1da851]' },
    { label: 'Instagram', icon: <Instagram className="h-5 w-5" />, handler: handleInstagram, color: 'bg-gradient-to-br from-[#fd7e14] via-[#dc1a6a] to-[#833ab4] hover:opacity-90' },
    { label: 'Facebook', icon: <Facebook className="h-5 w-5" />, handler: handleFacebook, color: 'bg-[#1877F2] hover:bg-[#0d65d9]' },
    { label: 'X / Twitter', icon: <Twitter className="h-5 w-5" />, handler: handleX, color: 'bg-black hover:bg-gray-800' },
    { label: 'Telegram', icon: <Send className="h-5 w-5" />, handler: handleTelegram, color: 'bg-[#0088cc] hover:bg-[#006da6]' },
    { label: 'Pinterest', icon: <Share2 className="h-5 w-5" />, handler: handlePinterest, color: 'bg-[#BD081C] hover:bg-[#9c0717]' },
  ];

  return (
    <div className="w-full">
      {/* Countdown Timer */}
      <div className="mt-4 flex flex-col items-center">
        <div
          className={`
            relative flex items-center gap-2 rounded-2xl px-6 py-3
            font-mono text-2xl font-bold tabular-nums
            transition-all duration-300
            ${isFinished
              ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg shadow-violet-200'
              : 'bg-slate-900 text-violet-300 shadow-lg'
            }
          `}
          style={!isFinished ? { textShadow: '0 0 12px rgba(139,92,246,0.6)' } : undefined}
        >
          <Clock className={`h-5 w-5 ${isFinished ? 'text-white' : 'text-violet-400'}`} />
          {isFinished ? 'Ready!' : timeStr}
        </div>

        {!isFinished && (
          <p className="mt-3 max-w-xs text-center text-xs leading-relaxed text-slate-500">
            Relax your vision, minimize blinking, and look directly through the
            pattern matrix to unlock your partner's true visual frequency...
          </p>
        )}
      </div>

      {/* Viral Copy Card — fades in when timer hits 00:00 */}
      <div
        className={`
          transition-all duration-700 ease-in-out overflow-hidden
          ${showViral ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="mt-5 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/80 to-pink-50/80 p-5 shadow-lg shadow-violet-100">
          <p className="text-sm leading-relaxed text-slate-700">
            {VIRAL_COPY}
          </p>

          <p className="mt-3 text-xs italic text-slate-400">
            Disclaimer: This tool is created strictly for entertainment and
            recreational purposes only.
          </p>

          {/* Share Buttons Grid */}
          <div className="mt-5">
            <p className="mb-2.5 text-xs font-bold uppercase tracking-wide text-slate-500">
              Share the Magic
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              {shareButtons.map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  onClick={btn.handler}
                  className={`
                    flex flex-col items-center gap-1.5 rounded-xl
                    px-2 py-3 text-white
                    transition-all duration-200
                    hover:-translate-y-0.5 active:scale-95
                    ${btn.color}
                  `}
                >
                  {btn.icon}
                  <span className="text-[10px] font-semibold">{btn.label}</span>
                </button>
              ))}
            </div>

            {/* Native share button */}
            <button
              type="button"
              onClick={handleNativeShare}
              className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-sm font-semibold text-violet-600 transition-all hover:bg-violet-50 active:scale-95"
            >
              <Share2 className="h-4 w-4" />
              Share via device
            </button>
          </div>

          {/* Palette credit */}
          <p className="mt-3 text-center text-[11px] text-slate-400">
            Aura pattern: {paletteName}
          </p>
        </div>
      </div>
    </div>
  );
}
