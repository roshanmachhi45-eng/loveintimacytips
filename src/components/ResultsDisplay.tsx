import { useEffect, useState } from 'react';
import { Heart, Sparkles, RefreshCw, Share2 } from 'lucide-react';
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

const FALLBACK_IMAGE = '/images/blog/fallback.jpg';

function handleImgError(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (img.src !== FALLBACK_IMAGE) {
    img.src = FALLBACK_IMAGE;
  }
}

export default function ResultsDisplay({ result, onReset }: ResultsDisplayProps) {
  const [displayScore, setDisplayScore] = useState(0);

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
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  const handleWhatsAppShare = () => {
    const shareText = `Check out LoveIntimacyTips - Get personalized intimacy & wellness tips! Score: ${result.score}/100`;
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-4 fade-in">
      {/* Score Card */}
      <div className="result-card bg-white rounded-3xl shadow-xl shadow-rose-100 border border-rose-100 p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h2 className="font-display text-xl font-bold text-gray-800">Your Compatibility Score</h2>
        </div>

        <div className="relative inline-flex items-center justify-center mb-4">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#ffe4e6" strokeWidth="10" />
            <circle
              cx="60" cy="60" r="52"
              fill="none" stroke="url(#scoreGradient)" strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.05s linear' }}
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="score-number font-display text-4xl font-bold bg-gradient-to-r from-rose-500 to-purple-500 bg-clip-text text-transparent">
              {displayScore}
            </span>
            <span className="text-xs text-gray-400 font-medium">out of 100</span>
          </div>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed px-2">{result.summary}</p>
      </div>

      {/* Random Images - Pink Tinted */}
      <div className="result-card bg-white rounded-3xl shadow-xl shadow-rose-100 border border-rose-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
          <h3 className="font-display text-lg font-bold text-gray-800">Moments of Love</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {result.images.map((img, i) => (
            <div key={i} className="relative rounded-2xl overflow-hidden group aspect-[3/4]">
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
                <p className="text-xs font-semibold text-white drop-shadow-md text-center">{img.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips Card */}
      <div className="result-card bg-white rounded-3xl shadow-xl shadow-rose-100 border border-rose-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
          <h3 className="font-display text-lg font-bold text-gray-800">Relationship Tips</h3>
        </div>
        <div className="space-y-4">
          {result.tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-rose-50/50 border border-rose-100">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-rose-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                {i + 1}
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 text-sm mb-1">{tip.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{tip.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Positions Card */}
      <div className="result-card bg-white rounded-3xl shadow-xl shadow-rose-100 border border-rose-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h3 className="font-display text-lg font-bold text-gray-800">Recommended Positions</h3>
        </div>
        <p className="text-xs text-gray-400 mb-4">Based on your body types and connection</p>

        <div className="space-y-3">
          {result.positions.map((pos, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-purple-50 border border-rose-100 hover:shadow-md hover:shadow-rose-100 transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{pos.emoji}</span>
                  <h4 className="font-display font-bold text-gray-800 text-base">{pos.name}</h4>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${difficultyColors[pos.difficulty]}`}>
                  {pos.difficulty}
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-2">{pos.description}</p>
              <p className="text-xs text-rose-500 font-medium">
                <span className="font-semibold">Benefits:</span> {pos.benefits}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* WhatsApp Share Button */}
      <button
        onClick={handleWhatsAppShare}
        className="w-full py-3.5 rounded-2xl bg-[#25D366] text-white font-semibold text-sm shadow-lg shadow-green-200 hover:bg-[#1da851] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        <Share2 className="w-4 h-4" />
        Share on WhatsApp
      </button>

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="w-full py-3.5 rounded-2xl bg-white border-2 border-rose-200 text-rose-600 font-semibold text-sm shadow-sm hover:bg-rose-50 hover:border-rose-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Start Over
      </button>
    </div>
  );
}
