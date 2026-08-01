import { useState } from 'react';
import { Heart } from 'lucide-react';
import Navbar from './components/Navbar';
import InputCard from './components/InputCard';
import ResultsDisplay from './components/ResultsDisplay';
import BlogSection from './components/BlogSection';
import Footer from './components/Footer';
import { generateRecommendations, type RecommendationResult } from './lib/recommendations';

interface Person {
  name: string;
  gender: string;
  avatar: string;
  age: string;
}

const initialPerson: Person = { name: '', gender: '', avatar: '', age: '', height: '' };

function App() {
  const [person1, setPerson1] = useState<Person>({ ...initialPerson });
  const [person2, setPerson2] = useState<Person>({ ...initialPerson });
  const [experience, setExperience] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendationResult | null>(null);

  const updatePerson1 = (field: string, value: string) => {
    setPerson1((prev) => ({ ...prev, [field]: value, ...(field === 'gender' ? { avatar: '' } : {}) }));
  };
  const updatePerson2 = (field: string, value: string) => {
    setPerson2((prev) => ({ ...prev, [field]: value, ...(field === 'gender' ? { avatar: '' } : {}) }));
  };

  const handleGenerate = () => {
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      const data = {
        p1Gender: person1.gender,
        p1Avatar: person1.avatar,
        p1Age: person1.age ? parseInt(person1.age, 10) : null,
        p2Gender: person2.gender,
        p2Avatar: person2.avatar,
        p2Age: person2.age ? parseInt(person2.age, 10) : null,
        experience,
      };
      const rec = generateRecommendations(data);
      setResult(rec);
      setLoading(false);
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }, 1400);
  };

  const handleReset = () => {
    setResult(null);
    setPerson1({ ...initialPerson });
    setPerson2({ ...initialPerson });
    setExperience('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pb-10">
      <Navbar />

      <main className="pt-20 px-4">
        <div className="max-w-md mx-auto">
          <InputCard
            person1={person1}
            person2={person2}
            experience={experience}
            onChangePerson1={updatePerson1}
            onChangePerson2={updatePerson2}
            onChangeExperience={setExperience}
            onGenerate={handleGenerate}
            loading={loading}
          />
        </div>

        {(loading || result) && (
          <div id="results" className="max-w-md mx-auto mt-8 scroll-mt-20">
            {loading && (
              <div className="bg-white rounded-3xl shadow-xl shadow-rose-100 border border-rose-100 p-10 text-center fade-in">
                <div className="relative inline-flex mb-4">
                  <span className="absolute inline-flex h-16 w-16 rounded-full bg-rose-400 opacity-40" style={{ animation: 'pulse-ring 1.5s ease-out infinite' }} />
                  <span className="relative inline-flex h-16 w-16 rounded-full bg-gradient-to-br from-rose-400 to-purple-500 items-center justify-center">
                    <Heart className="w-7 h-7 text-white fill-white" />
                  </span>
                </div>
                <p className="font-display text-lg font-bold text-gray-700 mb-1">Analyzing your connection...</p>
                <p className="text-sm text-gray-400">Crafting personalized recommendations</p>
              </div>
            )}
            {result && <ResultsDisplay result={result} onReset={handleReset} />}
          </div>
        )}

        {!result && !loading && <BlogSection />}
      </main>

      <Footer />
    </div>
  );
}

export default App;
