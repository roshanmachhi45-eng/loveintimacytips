
import { useState } from 'react';
import { Heart } from 'lucide-react';

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

  const [validationError, setValidationError] =
    useState('');

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

  return (
    <>
      <Seo
        title="Loveons — Your Personal Relationship Guide"
        description="Discover your compatibility score and get personalized relationship tips, couple activities, and wellness guidance tailored to you and your partner."
        path="/"
      />

      <div
        id="calculator"
        className="max-w-md mx-auto scroll-mt-20"
      >
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

      {(loading || result) && (
        <div
          id="results"
          className="max-w-md mx-auto mt-8 scroll-mt-20"
        >
          {loading && (
            <div className="bg-white rounded-3xl shadow-xl shadow-rose-100 border border-rose-100 p-10 text-center fade-in">
              <div className="relative inline-flex mb-4">
                <span
                  className="absolute inline-flex h-16 w-16 rounded-full bg-rose-400 opacity-40"
                  style={{
                    animation:
                      'pulse-ring 1.5s ease-out infinite',
                  }}
                />

                <span className="relative inline-flex h-16 w-16 rounded-full bg-gradient-to-br from-rose-400 to-purple-500 items-center justify-center">
                  <Heart className="w-7 h-7 text-white fill-white" />
                </span>
              </div>

              <p className="font-display text-lg font-bold text-gray-700 mb-1">
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
              onReset={handleReset}
            />
          )}
        </div>
      )}

      {!result && !loading && <BlogSection />}
    </>
  );
}
