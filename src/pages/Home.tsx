
import { useState } from 'react';
import {
  ArrowRight,
  Calculator,
  Heart,
  Sparkles,
  X,
} from 'lucide-react';

import InputCard from '../components/InputCard';
import ResultsDisplay from '../components/ResultsDisplay';
import BlogSection from '../components/BlogSection';
import Seo from '../components/Seo';

import {
  generateRecommendations,
  type RecommendationResult,
} from '../lib/recommendations';

interface Person {
  name: string;
  gender: string;
  avatar: string;
  age: string;
  height: string;
}

const initialPerson: Person = {
  name: '',
  gender: '',
  avatar: '',
  age: '',
  height: '',
};

/*
 * Hero image
 *
 * Future image changes:
 * Replace only this path/file.
 */
const HERO_IMAGE = '/images/loveons-hero.webp';

export default function Home() {
  const [person1, setPerson1] = useState<Person>({
    ...initialPerson,
  });

  const [person2, setPerson2] = useState<Person>({
    ...initialPerson,
  });

  const [experience, setExperience] = useState('');
  const [loading, setLoading] = useState(false);

  const [result, setResult] =
    useState<RecommendationResult | null>(null);

  const [validationError, setValidationError] = useState('');

  /*
   * Controls whether the calculator form is open.
   *
   * The tool card is shown first.
   * The actual calculator opens only after the user selects it.
   */
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const updatePerson1 = (
    field: string,
    value: string
  ) => {
    setValidationError('');

    setPerson1((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'gender'
        ? { avatar: '' }
        : {}),
    }));
  };

  const updatePerson2 = (
    field: string,
    value: string
  ) => {
    setValidationError('');

    setPerson2((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'gender'
        ? { avatar: '' }
        : {}),
    }));
  };

  const handleGenerate = () => {
    setValidationError('');

    const person1Name = person1.name.trim();
    const person2Name = person2.name.trim();

    const person1Age = Number(person1.age);
    const person2Age = Number(person2.age);

    if (!person1Name) {
      setValidationError(
        'Please enter your name.'
      );
      return;
    }

    if (!person1.gender) {
      setValidationError(
        'Please select your gender.'
      );
      return;
    }

    if (!person1.age) {
      setValidationError(
        'Please enter your age.'
      );
      return;
    }

    if (
      !Number.isInteger(person1Age) ||
      person1Age < 18 ||
      person1Age > 99
    ) {
      setValidationError(
        'Your age must be between 18 and 99.'
      );
      return;
    }

    if (!person2Name) {
      setValidationError(
        "Please enter your partner's name."
      );
      return;
    }

    if (!person2.gender) {
      setValidationError(
        "Please select your partner's gender."
      );
      return;
    }

    if (!person2.age) {
      setValidationError(
        "Please enter your partner's age."
      );
      return;
    }

    if (
      !Number.isInteger(person2Age) ||
      person2Age < 18 ||
      person2Age > 99
    ) {
      setValidationError(
        "Your partner's age must be between 18 and 99."
      );
      return;
    }

    if (!experience) {
      setValidationError(
        'Please select your experience level.'
      );
      return;
    }

    setLoading(true);
    setResult(null);

    setTimeout(() => {
      const data = {
        p1Gender: person1.gender,
        p1Avatar: person1.avatar,
        p1Age: person1.age
          ? parseInt(person1.age, 10)
          : null,

        p2Gender: person2.gender,
        p2Avatar: person2.avatar,
        p2Age: person2.age
          ? parseInt(person2.age, 10)
          : null,

        experience,
      };

      const rec = generateRecommendations(data);

      setResult(rec);
      setLoading(false);

      setTimeout(() => {
        document
          .getElementById('results')
          ?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
      }, 100);
    }, 1400);
  };

  const handleReset = () => {
    setResult(null);
    setValidationError('');

    setPerson1({
      ...initialPerson,
    });

    setPerson2({
      ...initialPerson,
    });

    setExperience('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const openLoveCalculator = () => {
    setActiveTool('love-calculator');

    setTimeout(() => {
      document
        .getElementById('calculator')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
    }, 50);
  };

  const closeCalculator = () => {
    if (loading) return;

    setActiveTool(null);
    setResult(null);
    setValidationError('');
  };

  return (
    <>
      <Seo
        title="Loveons — Your Personal Relationship Guide"
        description="Discover your compatibility score and get personalized relationship tips, couple activities, and wellness guidance tailored to you and your partner."
        path="/"
      />

      {/* =====================================================
          FUTURISTIC LIGHT HERO
      ===================================================== */}
      <section className="relative overflow-hidden px-4 pb-10 pt-6 sm:px-6 sm:pb-14 sm:pt-8 lg:px-8 lg:pb-16">
        {/* Soft futuristic background glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute left-[-180px] top-20 h-80 w-80 rounded-full bg-pink-200/40 blur-3xl" />

          <div className="absolute right-[-160px] top-0 h-96 w-96 rounded-full bg-purple-200/30 blur-3xl" />

          <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-rose-100/40 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/70 shadow-[0_20px_70px_rgba(236,72,153,0.12)] backdrop-blur-xl sm:rounded-[2.5rem]">
            <div className="grid items-stretch lg:grid-cols-2">

              {/* LEFT — HERO CONTENT */}
              <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16 xl:px-16">

                <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-rose-100 bg-white/80 px-3.5 py-2 text-xs font-semibold text-rose-500 shadow-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  Better relationships start here
                </div>

                <h1 className="max-w-xl text-4xl font-bold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.6rem] xl:text-[4rem]">
                  Build stronger
                  <br />
                  relationships with

                  <span className="mt-1 block bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                    love & understanding
                  </span>
                </h1>

                <p className="mt-5 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
                  Discover personalized relationship guidance,
                  meaningful insights, and simple tools designed
                  to help you and your partner grow closer.
                </p>

                {/* CTA buttons */}
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                  <button
                    type="button"
                    onClick={openLoveCalculator}
                    className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-rose-200"
                  >
                    <Heart className="h-4 w-4 fill-white" />

                    Explore Your Connection

                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      document
                        .getElementById('blog')
                        ?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        });
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                  >
                    Discover Relationship Tips
                  </button>
                </div>

                {/* Trust points */}
                <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-400 sm:text-sm">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                    Personalized guidance
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                    Private & simple
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
                    Made for couples
                  </span>
                </div>
              </div>

              {/* RIGHT — HERO IMAGE */}
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

                <div
                  aria-hidden="true"
                  className="absolute bottom-6 right-6 h-24 w-24 rounded-full bg-pink-300/20 blur-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          LOVEONS TOOLS
          Future-proof structure
      ===================================================== */}
      <section
        id="tools"
        className="relative px-4 pb-12 pt-4 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl">

          {/* Section heading */}
          <div className="mb-6 text-center">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-rose-100 bg-white/80 px-3 py-1.5 text-xs font-semibold text-rose-500 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Loveons Tools
            </div>

            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Simple tools for your relationship
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Explore tools designed to help you understand
              and strengthen your connection.
            </p>
          </div>

          {/* Tool cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* CURRENT TOOL — LOVE CALCULATOR */}
            <button
              type="button"
              onClick={openLoveCalculator}
              className="group relative overflow-hidden rounded-[1.75rem] border border-rose-100 bg-white/85 p-5 text-left shadow-[0_12px_40px_rgba(236,72,153,0.08)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-rose-200 hover:shadow-[0_20px_50px_rgba(236,72,153,0.14)] sm:p-6"
            >
              {/* Card glow */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-pink-200/40 blur-3xl transition-transform duration-500 group-hover:scale-125"
              />

              <div className="relative">

                <div className="mb-5 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-200">
                    <Heart className="h-6 w-6 fill-white" />
                  </div>

                  <span className="rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-500">
                    Available
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-lg font-bold text-slate-900 sm:text-xl">
                    Love Calculator
                  </h3>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    Explore your connection and discover
                    personalized relationship insights.
                  </p>
                </div>

                <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-rose-500 transition-colors group-hover:text-rose-600">
                  Try Love Calculator

                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </button>

          </div>
        </div>
      </section>

      {/* =====================================================
          ACTIVE LOVE CALCULATOR
          Opens only after selecting the tool
      ===================================================== */}
      {activeTool === 'love-calculator' && !result && (
        <section
          id="calculator"
          className="scroll-mt-24 px-4 pb-10 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-md">

            {/* Calculator header */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50">
                    <Calculator className="h-4.5 w-4.5 text-rose-500" />
                  </div>

                  <h2 className="font-display text-xl font-bold text-slate-900">
                    Love Calculator
                  </h2>
                </div>

                <p className="mt-1 pl-11 text-xs text-slate-400">
                  Enter your details to explore your connection.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCalculator}
                disabled={loading}
                aria-label="Close Love Calculator"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <InputCard
              person1={person1}
              person2={person2}
              experience={experience}
              onChangePerson1={updatePerson1}
              onChangePerson2={updatePerson2}
              onChangeExperience={(value) => {
                setExperience(value);
                setValidationError('');
              }}
              onGenerate={handleGenerate}
              loading={loading}
              validationError={validationError}
            />
          </div>
        </section>
      )}

      {/* =====================================================
          RESULTS
          ONLY APPEARS AFTER CALCULATION
      ===================================================== */}
      {activeTool === 'love-calculator' &&
        (loading || result) && (
          <section
            id="results"
            className="scroll-mt-24 px-4 pb-10 sm:px-6 lg:px-8"
          >
            <div className="mx-auto mt-2 max-w-md">

              {loading && (
                <div className="fade-in rounded-3xl border border-rose-100 bg-white p-10 text-center shadow-xl shadow-rose-100">

                  <div className="relative mb-4 inline-flex">
                    <span
                      className="absolute inline-flex h-16 w-16 rounded-full bg-rose-400 opacity-40"
                      style={{
                        animation:
                          'pulse-ring 1.5s ease-out infinite',
                      }}
                    />

                    <span className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-purple-500">
                      <Heart className="h-7 w-7 fill-white text-white" />
                    </span>
                  </div>

                  <p className="mb-1 text-lg font-bold text-gray-700">
                    Analyzing your connection...
                  </p>

                  <p className="text-sm text-gray-400">
                    Crafting personalized recommendations
                  </p>
                </div>
              )}

              {result && (
                <ResultsDisplay
                  result={result}
                  onReset={() => {
                    handleReset();
                    setActiveTool(null);
                  }}
                />
              )}
            </div>
          </section>
        )}

      {/* =====================================================
          BLOG
      ===================================================== */}
      {!result && !loading && <BlogSection />}
    </>
  );
}
