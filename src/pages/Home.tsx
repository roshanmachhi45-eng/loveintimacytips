import {
  ArrowRight,
  Heart,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import BlogSection from '../components/BlogSection';
import Seo from '../components/Seo';

const HERO_IMAGE = '/images/loveons-hero.webp';

export default function Home() {
  const navigate = useNavigate();

  // =====================================================
  // OPEN LOVE CALCULATOR
  // =====================================================

  const openLoveCalculator = () => {
    navigate('/love-calculator');
  };

  // =====================================================
  // OPEN COSMIC LOVE TAROT
  // =====================================================

  const openCosmicLoveTarot = () => {
    navigate('/cosmic-tarot');
  };

  // =====================================================
  // BLOG
  // =====================================================

  const scrollToBlog = () => {
    document
      .getElementById('blog')
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
  };

  return (
    <>
      <Seo
        title="Loveons — Your Personal Relationship Guide"
        description="Discover your compatibility, relationship insights, and cosmic love readings with Loveons."
        path="/"
      />

      {/* =================================================
          HERO SECTION
      ================================================= */}

      <section className="relative overflow-hidden px-4 pb-10 pt-6 sm:px-6 sm:pb-14 sm:pt-8 lg:px-8 lg:pb-16">

        {/* Background Glow */}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute left-[-180px] top-20 h-80 w-80 rounded-full bg-pink-200/40 blur-3xl" />

          <div className="absolute right-[-160px] top-0 h-96 w-96 rounded-full bg-purple-200/30 blur-3xl" />

          <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-100/30 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl">

          <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/70 shadow-[0_20px_70px_rgba(236,72,153,0.12)] backdrop-blur-xl sm:rounded-[2.5rem]">

            <div className="grid items-stretch lg:grid-cols-2">

              {/* =================================================
                  HERO CONTENT
              ================================================= */}

              <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16 xl:px-16">

                {/* Small Label */}

                <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-pink-100 bg-white/80 px-3.5 py-2 text-xs font-semibold text-pink-500 shadow-sm">

                  <Sparkles className="h-3.5 w-3.5" />

                  Better relationships start here

                </div>

                {/* Main Heading */}

                <h1 className="max-w-xl text-4xl font-bold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.6rem] xl:text-[4rem]">

                  Build stronger

                  <br />

                  relationships with

                  <span className="mt-1 block bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                    love & understanding
                  </span>

                </h1>

                {/* Description */}

                <p className="mt-5 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
                  Discover personalized relationship guidance,
                  meaningful love insights, and cosmic readings
                  designed to help you understand your connection.
                </p>

                {/* Hero Buttons */}

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                  {/* Love Calculator */}

                  <button
                    type="button"
                    onClick={openLoveCalculator}
                    className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-pink-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                  >

                    <Heart className="h-4 w-4 fill-white" />

                    Love Calculator

                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />

                  </button>

                  {/* Cosmic Love Tarot */}

                  <button
                    type="button"
                    onClick={openCosmicLoveTarot}
                    className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-purple-200 bg-purple-50 px-6 py-3.5 text-sm font-bold text-purple-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-purple-100"
                  >

                    <Sparkles className="h-4 w-4" />

                    Cosmic Love Tarot

                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />

                  </button>

                </div>

                {/* Features */}

                <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-400 sm:text-sm">

                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
                    Love insights
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                    Cosmic readings
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    Simple & private
                  </span>

                </div>

              </div>

              {/* =================================================
                  HERO IMAGE
              ================================================= */}

              <div className="relative min-h-[330px] overflow-hidden sm:min-h-[440px] lg:min-h-[600px]">

                <img
                  src={HERO_IMAGE}
                  alt="Couple sharing a loving moment"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />

                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-r from-white/15 via-transparent to-transparent lg:from-white/25"
                />

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          TOOLS CARDS
          ONLY CARDS ARE DISPLAYED HERE
      ================================================= */}

      <section
        id="tools"
        className="relative scroll-mt-24 px-4 pb-14 pt-4 sm:px-6 lg:px-8"
      >

        <div className="mx-auto max-w-5xl">

          {/* Section Heading */}

          <div className="mb-8 text-center">

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white px-3.5 py-2 text-xs font-semibold text-pink-500 shadow-sm">

              <Sparkles className="h-3.5 w-3.5" />

              Loveons Tools

            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Explore our relationship tools
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Choose a tool below to discover personalized
              love and cosmic insights.
            </p>

          </div>

          {/* =================================================
              TOOL CARDS
          ================================================= */}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* =================================================
                LOVE CALCULATOR CARD
            ================================================= */}

            <button
              type="button"
              onClick={openLoveCalculator}
              aria-label="Open Love Calculator"
              className="group relative overflow-hidden rounded-[2rem] border border-pink-100 bg-white p-6 text-left shadow-[0_15px_50px_rgba(236,72,153,0.10)] transition-all duration-300 hover:-translate-y-1 hover:border-pink-200 hover:shadow-[0_22px_60px_rgba(236,72,153,0.16)] focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 sm:p-7"
            >

              {/* Pink Glow */}

              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-pink-200/40 blur-3xl transition-transform duration-500 group-hover:scale-125"
              />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-rose-100/40 blur-3xl"
              />

              <div className="relative">

                {/* Icon + Badge */}

                <div className="flex items-start justify-between">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-200">

                    <Heart className="h-7 w-7 fill-white" />

                  </div>

                  <span className="rounded-full border border-pink-100 bg-pink-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-pink-500">
                    Love
                  </span>

                </div>

                {/* Title */}

                <h3 className="mt-6 text-xl font-bold text-slate-900">
                  Love Calculator
                </h3>

                {/* Description */}

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Discover your connection and explore
                  personalized relationship insights for
                  you and your partner.
                </p>

                {/* CTA */}

                <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-pink-500">

                  Open Love Calculator

                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />

                </div>

              </div>

            </button>

            {/* =================================================
                COSMIC LOVE TAROT CARD
            ================================================= */}

            <button
              type="button"
              onClick={openCosmicLoveTarot}
              aria-label="Open Cosmic Love Tarot"
              className="group relative overflow-hidden rounded-[2rem] border border-purple-100 bg-white p-6 text-left shadow-[0_15px_50px_rgba(139,92,246,0.10)] transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-[0_22px_60px_rgba(139,92,246,0.16)] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 sm:p-7"
            >

              {/* Purple Glow */}

              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-purple-200/40 blur-3xl transition-transform duration-500 group-hover:scale-125"
              />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-pink-100/40 blur-3xl"
              />

              <div className="relative">

                {/* Icon + Badge */}

                <div className="flex items-start justify-between">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 via-violet-500 to-pink-500 text-white shadow-lg shadow-purple-200">

                    <Sparkles className="h-7 w-7" />

                  </div>

                  <span className="rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-purple-500">
                    Tarot
                  </span>

                </div>

                {/* Title */}

                <h3 className="mt-6 text-xl font-bold text-slate-900">
                  Cosmic Love Tarot
                </h3>

                {/* Description */}

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Discover your daily cosmic love reading,
                  tarot message, and romantic energy.
                </p>

                {/* CTA */}

                <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-purple-500">

                  Open Cosmic Love Tarot

                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />

                </div>

              </div>

            </button>

          </div>
        </div>
      </section>

      {/* =================================================
          BLOG SECTION
      ================================================= */}

      <section id="blog">
        <BlogSection />
      </section>
    </>
  );
                }
