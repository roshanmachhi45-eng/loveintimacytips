import { AlertTriangle, Heart, Sparkles, ShieldCheck } from 'lucide-react';
import Seo from '../components/Seo';
import PageLayout from '../components/PageLayout';

const sections = [
  {
    icon: Sparkles,
    title: 'Fun & Entertainment Tools',
    paragraphs: [
      'Our Cosmic Love Calculator and Cosmic Love Tarot tools are created purely to bring a little fun, spark, and joy to your day. Think of them as playful conversation starters rather than scientific matchmakers. They are here for lighthearted entertainment and should not be used to make major life or relationship decisions.'
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Real World Romance over Advice',
    paragraphs: [
      'Loveons is a space dedicated to helping you explore the world of real life romance, offline connections, and off app dating. The tips, stories, and suggestions shared across our blog are meant to inspire your journey. We do not provide professional relationship counseling, psychological therapy, or medical advice.'
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Every Relationship is Unique',
    paragraphs: [
      'Human connections are beautifully unpredictable. What works perfectly for a couple at a local run club or a board game mixer might feel completely different for you. There are no automated formulas or guarantees for real life chemistry. Trust your natural instincts, move at your own comfortable pace, and focus on honest communication.'
    ],
  },
  {
    icon: Heart,
    title: 'Comfort & Safe Boundaries',
    paragraphs: [
      'Stepping away from dating apps and meeting people in the real world should always feel exciting and safe. Never pressure yourself or anyone else into a situation that feels uncomfortable. If you ever feel stuck, overwhelmed, or need deeper guidance, we highly encourage reaching out to a compassionate relationship expert or counselor.'
    ],
  },
];

export default function Disclaimer() {
  return (
    <>
      <Seo
        title="Disclaimer — Loveons"
        description="Loveons is for fun, entertainment, and offline dating inspiration. Read our simple approach to relationship tools and real world connection."
        path="/disclaimer"
      />
      <PageLayout
        title="Disclaimer"
        subtitle="A quick and friendly note before you explore our real world dating guides and cosmic tools."
      >
        <div className="space-y-6">
          {sections.map((s) => (
            <div key={s.title}>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-loveons-50 border border-loveons-100 flex items-center justify-center">
                  <s.icon className="w-4 h-4 text-loveons-500" />
                </div>
                <h2 className="font-display text-lg font-bold text-gray-800">{s.title}</h2>
              </div>
              <div className="space-y-2 pl-11">
                {s.paragraphs.map((p, i) => (
                  <p key={i} className="text-sm text-gray-600 leading-relaxed">{p}</p>
                ))}
              </div>
            </div>
          ))}

          <div className="flex items-start gap-3 p-4 rounded-xl bg-loveons-50 border border-loveons-100 mt-4">
            <AlertTriangle className="w-5 h-5 text-loveons-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-loveons-700 leading-relaxed">
              By hanging out on Loveons, you agree that you understand the playful nature of our tools and the educational purpose of our offline dating content. Enjoy the journey back to real life connections.
            </p>
          </div>
        </div>
      </PageLayout>
    </>
  );
}
