"use client";

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

const FALLBACK_IMAGE = '/images/recommendations/lasting-love.webp';

function handleImgError(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (img.src !== FALLBACK_IMAGE && !img.src.endsWith('lasting-love.webp')) {
    img.src = FALLBACK_IMAGE;
  }
}

export default function ResultsDisplay({ result, onReset }: ResultsDisplayProps) {
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
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  // 📝 मुख्य शेयर टेक्स्ट (सोशल मीडिया के लिए)
  const getShareText = () => {
    return `❤️ Loveons Love Match Score: ${result.score}%!\nDiscover your compatibility score on Loveons.com!`;
  };

  // 📌 पिंटरेस्ट के लिए स्पेशल टेक्स्ट + लीगल डिस्क्लेमर
  const getPinterestShareText = () => {
    return `❤️ My Loveons Love Match Score is ${result.score}%! Test your connection now. [Disclaimer: For entertainment purposes only. Results are not scientific and do not constitute actual relationship advice.]`;
  };

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return 'https://loveons.com';
  };

  const handleNativeShare = async () => {
    const shareText = `${getShareText()}\n\nFor entertainment only. Results not scientific.`;
    const shareUrl = getShareUrl();

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Loveons.com ❤️ Love Match',
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
      }
    }
    await handleCopyLink();
  };

  const handleWhatsAppShare = () => {
    const text = `${getShareText()}\n\nFor entertainment only. Results not scientific.\n${getShareUrl()}`;
    window.open(`https://wa.me{encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const handleFacebookShare = () => {
    window.open(`https://facebook.com{encodeURIComponent(getShareUrl())}`, '_blank', 'noopener,noreferrer');
  };

  const handleXShare = () => {
    const text = `❤️ My Loveons Love Match Score is ${result.score}%! (Entertainment only)`;
    window.open(`https://twitter.com{encodeURIComponent(text)}&url=${encodeURIComponent(getShareUrl())}`, '_blank', 'noopener,noreferrer');
  };

  const handleTelegramShare = () => {
    const text = `${getShareText()}\n\n[Entertainment purposes only]`;
    window.open(`https://t.me{encodeURIComponent(getShareUrl())}&text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = async () => {
    const shareText = `${getShareText()}\n\nFor entertainment only. Results not scientific.\n${getShareUrl()}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareText);
      } else {
        const textarea = document.createElement('textarea');
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
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-6 fade-in max-w-4xl mx-auto">
      
      {/* 🌟 TOP GRID SECTION: Score Card + Independent Pinterest Block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        
        {/* Score Card (यह डिब्बा 100% साफ़ है) */}
        <div className="md:col-span-2 result-card bg-white rounded-3xl shadow-xl shadow-rose-100 border border-rose-100 p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h2 className="font-display text-xl font-bold text-gray-800">
              Your Compatibility Score
            </h2>
          </div>

          <div className="relative inline-flex items-center justify-center mb-4">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#ffe4e6" strokeWidth="10" />
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
              <span className="text-xs text-gray-400 font-medium">
                out of 100
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed px-2">
            {result.summary}
          </p>
        </div>

        {/* 📌 INDEPENDENT PINTEREST BLOCK (दाईं तरफ स्केच डिज़ाइन के अनुसार) */}
        <div className="result-card bg-white rounded-3xl shadow-xl shadow-rose-100 border border-rose-100 p-6 text-center flex flex-col items-center justify-center min-h-[260px] transition-all hover:shadow-2xl hover:shadow-rose-200/50">
          <button
            type="button"
            onClick={() => {
              window.open(
                `https://pinterest.com{encodeURIComponent(getShareUrl())}&description=${encodeURIComponent(getPinterestShareText())}`,
                '_blank',
                'noopener,noreferrer'
              );
            }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#BD081C] text-white shadow-lg shadow-red-200 transition-transform hover:scale-110 active:scale-95 duration-300"
            aria-label="Pin to Pinterest"
          >
            <svg className="h-7 w-7 fill-white" viewBox="0 0 24 24">
              <path d="M12.017 0C5.396 0 0 5.396 0 12.017c0 5.072 3.138 9.402 7.585 11.198-.105-.94-.199-2.378.041-3.402.219-.94 1.41-5.977 1.41-5.977s-.36-.72-.36-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24 18.639 24 24 18.639 24 12.017 24 5.396 18.639 0 12.017 0z" />
            </svg>
          </button>
          
          <h3 className="font-display text-xl font-extrabold text-gray-800 mt-4">
            Pinterest
          </h3>
          <p className="text-xs font-semibold text-rose-500 uppercase tracking-wider mt-1 px-4 leading-relaxed">
            share your love score with pin
          </p>
          <p className="text-[10px] text-gray-400 mt-2 max-w-[190px] leading-relaxed">
            Save this compatibility result to your favorite board with official safe disclosure.
          </p>
        </div>

      </div>

      {/* Moments of Love Card */}
      <div className="result-card bg-white rounded-3xl shadow-xl shadow-rose-100 border border-rose-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
          <h3 className="font-display text-lg font-bold text-gray-800">
            Moments of Love
          </h3>
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



              
                


                  


                  


              
              

              
