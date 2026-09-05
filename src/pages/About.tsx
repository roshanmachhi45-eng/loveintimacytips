import { Heart, Target, Sparkles, BookOpen, Shield } from 'lucide-react';
import Seo from '../components/Seo';
import PageLayout from '../components/PageLayout';

const features = [
  {
    icon: Target,
    title: 'Our Purpose',
    text: 'Loveons is a place for people interested in love, dating, and relationships. Our goal is to provide useful dating insights, practical ideas, and enjoyable experiences that help make modern dating easier to understand and more engaging.',
  },
  {
    icon: BookOpen,
    title: 'Dating & Relationship Insights',
    text: 'Our blog covers modern dating, off-app dating, real-world ways to meet people, communication, relationships, and other topics related to love and connection. We aim to create practical, relatable, and useful content for everyday dating experiences.',
  },
  {
    icon: Sparkles,
    title: 'Fun Love Tools',
    text: 'Loveons also offers interactive experiences such as our Love Calculator and Cosmic Love Tarot. These tools are designed primarily for entertainment and personal reflection, adding a fun element to your journey through love and dating.',
  },
  {
    icon: Shield,
    title: 'Privacy & Transparency',
    text: 'We respect your privacy and aim to provide a simple and transparent experience. We explain how information is handled through our privacy practices and encourage visitors to review our policies before using our website and interactive tools.',
  },
];

export default function About() {
  return (
    <>
      <Seo
        title="About Us — Loveons"
        description="Learn about Loveons, a website featuring dating and relationship insights, off-app dating ideas, and fun love tools including a Love Calculator and Cosmic Love Tarot."
        path="/about"
      />

      <PageLayout
        title="About Loveons"
        subtitle="Exploring love, dating, and relationships through helpful insights, real-world ideas, and fun interactive experiences."
      >
        <div className="space-y-6">
          {features.map((f) => (
            <div key={f.title} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
                <f.icon className="w-5 h-5 text-rose-500" />
              </div>

              <div>
                <h2 className="font-display text-lg font-bold text-gray-800 mb-1">
                  {f.title}
                </h2>

                <p className="text-sm text-gray-600 leading-relaxed">
                  {f.text}
                </p>
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-rose-100">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />

              <h2 className="font-display text-lg font-bold text-gray-800">
                Our Values
              </h2>
            </div>

            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-rose-400 mt-0.5">•</span>
                <span>
                  Respect for different people, relationships, and dating journeys.
                </span>
              </li>

              <li className="flex items-start gap-2">
                <span className="text-rose-400 mt-0.5">•</span>
                <span>
                  Practical and relatable ideas for modern dating and real-world connections.
                </span>
              </li>

              <li className="flex items-start gap-2">
                <span className="text-rose-400 mt-0.5">•</span>
                <span>
                  Original and useful content created to inform, entertain, and inspire.
                </span>
              </li>

              <li className="flex items-start gap-2">
                <span className="text-rose-400 mt-0.5">•</span>
                <span>
                  Fun interactive experiences that complement our dating and relationship content.
                </span>
              </li>

              <li className="flex items-start gap-2">
                <span className="text-rose-400 mt-0.5">•</span>
                <span>
                  Privacy, transparency, inclusivity, and respect for our visitors.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </PageLayout>
    </>
  );
}
