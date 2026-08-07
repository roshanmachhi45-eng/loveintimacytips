import { Heart, Target, Sparkles, BookOpen, Shield } from 'lucide-react';
import Seo from '../components/Seo';
import PageLayout from '../components/PageLayout';

const features = [
  {
    icon: Target,
    title: 'Our Purpose',
    text: 'Loveons helps couples build stronger, healthier relationships through a personalized compatibility calculator. We provide thoughtful, research-informed recommendations that respect every individual.'
  },
  {
    icon: Sparkles,
    title: 'How Recommendations Work',
    text: 'Our calculator considers personality types, age, and relationship stage to generate a compatibility score along with curated tips and activity suggestions. Each result is tailored to the unique combination you and your partner bring.'
  },
  {
    icon: BookOpen,
    title: 'Wellness Resources',
    text: 'Beyond the calculator, our wellness blog offers articles on communication, emotional connection, and keeping the spark alive — all written with care and grounded in relationship psychology.'
  },
  {
    icon: Shield,
    title: 'Privacy First',
    text: 'We do not store your personal inputs. Everything you enter stays in your browser session and is never sent to a server. Your privacy is our priority.',
  },
];

export default function About() {
  return (
    <>
      <Seo
        title="About Us — Loveons"
        description="Learn about Loveons, our mission to help couples build stronger relationships through a personalized compatibility calculator, and how our recommendations work."
        path="/about"
      />
      <PageLayout
        title="About Loveons"
        subtitle="Helping couples discover deeper connection through personalized relationship guidance and wellness tools."
      >
        <div className="space-y-6">
          {features.map((f) => (
            <div key={f.title} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
                <f.icon className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-gray-800 mb-1">{f.title}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{f.text}</p>
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-rose-100">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <h2 className="font-display text-lg font-bold text-gray-800">Our Values</h2>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-rose-400 mt-0.5">•</span>
                <span>Respect for every individual, relationship dynamic, and background.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 mt-0.5">•</span>
                <span>Educational content grounded in relationship psychology.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 mt-0.5">•</span>
                <span>Privacy by design — no personal data is ever stored.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 mt-0.5">•</span>
                <span>Inclusivity and mutual respect as the foundation of every recommendation.</span>
              </li>
            </ul>
          </div>
        </div>
      </PageLayout>
    </>
  );
}
