import { Heart, Target, Sparkles, BookOpen, Shield } from 'lucide-react';
import Seo from '../components/Seo';
import PageLayout from '../components/PageLayout';

const features = [
  {
    icon: Target,
    title: 'Our Purpose',
    text: 'LoveIntimacyTips helps couples explore intimacy and wellness through a personalized compatibility calculator. We provide thoughtful, body-aware recommendations that respect every individual.',
  },
  {
    icon: Sparkles,
    title: 'How Recommendations Work',
    text: 'Our calculator considers body types, age, and experience level to generate a compatibility score along with curated tips and position suggestions. Each result is tailored to the unique combination you and your partner bring.',
  },
  {
    icon: BookOpen,
    title: 'Wellness Resources',
    text: 'Beyond the calculator, our wellness blog offers articles on communication, emotional intimacy, and keeping the spark alive — all written with care and grounded in relationship psychology.',
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
        title="About Us — LoveIntimacyTips"
        description="Learn about LoveIntimacyTips, our mission to help couples explore intimacy and wellness through a personalized compatibility calculator, and how our recommendations work."
        path="/about"
      />
      <PageLayout
        title="About LoveIntimacyTips"
        subtitle="Helping couples discover deeper connection through personalized, body-aware intimacy guidance."
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
                <span>Respect for every body type, gender, and relationship dynamic.</span>
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
                <span>Inclusivity and consent as the foundation of every recommendation.</span>
              </li>
            </ul>
          </div>
        </div>
      </PageLayout>
    </>
  );
}
