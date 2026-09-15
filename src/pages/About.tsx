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

          {/* Highly Optimized Author Section for Google E-E-A-T without Commas */}
          <div className="mt-10 pt-8 border-t border-rose-100 bg-gradient-to-b from-rose-50/30 to-transparent p-6 rounded-2xl">
            <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
              
              {/* Profile Image with Fixed Dimensions to Prevent Cracking */}
              <div className="relative mb-4">
                <img 
                  src="/images/rocksy-avatar.webp" 
                  alt="Roshan Machhi Rocksy Founder and Author at Loveons" 
                  className="rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-rose-100/50"
                  style={{ 
                    width: '96px', 
                    height: '96px', 
                    minWidth: '96px', 
                    minHeight: '96px',
                    maxWidth: '96px',
                    maxHeight: '96px',
                    display: 'block',
                    flexShrink: 0
                  }}
                />
              </div>

              {/* Big Prominent Author Title */}
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-rose-500 mb-0.5">Website Creator</p>
                <h2 className="font-display text-2xl font-black text-gray-900">
                  Author: Rocksy
                </h2>
              </div>

              {/* Natural and Non-Robotic Story */}
              <div className="space-y-4 text-sm text-gray-600 leading-relaxed text-justify sm:text-center">
                <p>
                  Hi I am <strong>Roshan Machhi</strong> though the world and the beautiful community here know me simply as <strong>Rocksy</strong>. At 35 years old my journey through love and relationships and modern dating has not been a smooth fairy tale ride. Like many of you I have lived through the intense highs and the crushing lows and the complex emotional rollercoasters that define modern romance.
                </p>
                <p>
                  Having witnessed the profound shift from real world romance to the exhaustingly detached culture of dating apps I saw an urgent need for change. The emotional fatigue and the endless swiping and the fading art of genuine connection deeply moved me. It was out of these personal challenges and raw life experiences and deep reflections that the vision for <strong>Loveons.com</strong> was born.
                </p>
                <p>
                  I created this platform not just as a website but as a sanctuary for those who want to step back from the digital screen and rediscover the magic of <strong>off-app real-world dating</strong>. Every single blog and relationship guide and practical insight here is backed by real life offering relatable and honest advice for everyday connection.
                </p>
                <p>
                  To balance the serious journey of finding love with a bit of joy and self-reflection I also custom-designed our popular interactive tools the <a href="/love-calculator" className="text-rose-500 font-semibold hover:underline">Love Calculator</a> and the <a href="/cosmic-love-tarot" className="text-rose-500 font-semibold hover:underline">Cosmic Love Tarot</a>. Whether you are navigating a heartbreak or looking for modern dating clarity or just exploring the universe of love I am right here walking this path beside you.
                </p>
              </div>

            </div>
          </div>

          {/* Original Values Section Remains Safe */}
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

