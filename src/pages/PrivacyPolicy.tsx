import { Shield, Cookie, BarChart2, Search, UserCheck, HelpCircle } from 'lucide-react';
import Seo from '../components/Seo';
import PageLayout from '../components/PageLayout';
import { BRAND } from '../lib/brand';

const sections = [
  {
    icon: Shield,
    title: 'Information We Collect',
    paragraphs: [
      'You are completely free to explore Loveons and read all our offline dating guides without making an account or giving us any personal details. When you play around with our Cosmic Love Calculator or Cosmic Love Tarot tools, we do not ask you to sign up or share private profiles. For your own comfort, just avoid entering highly sensitive personal information into the tool input boxes.',
      'If you reach out to our team directly via email, we will only receive the email address and name you use so we can send a warm and helpful response back to your request.'
    ],
  },
  {
    icon: Cookie,
    title: 'Cookies & Easy Browsing',
    paragraphs: [
      'We use simple cookies to ensure our website loads fast and runs smoothly on your phone or computer browser. These cookies simply remember minor framework settings so you get a smooth reading flow every time you return. You can easily turn off cookies through your own web browser anytime you like, though it might make a few visual interactive features load a little slower.'
    ],
  },
  {
    icon: BarChart2,
    title: 'Google Analytics',
    paragraphs: [
      'To understand which off app dating guides or cosmic tools our community enjoys the most, we use Google Analytics. This tool monitors anonymous details like the pages visited, general device types, and how long readers hang out on our articles. It never tracks your real identity or shares who you are. It only helps our creative team build better content for your journey.'
    ],
  },
  {
    icon: Search,
    title: 'Google Search Console',
    paragraphs: [
      'We use Google Search Console to keep an eye on how our website shows up in Google search results. This assists us in finding technical site glitches and understanding the organic keywords people type to discover our offline dating strategies. It operates fully on broad traffic numbers and is never used to identify individual people.'
    ],
  },
  {
    icon: UserCheck,
    title: 'Your Simple Privacy Choices',
    paragraphs: [
      'Your data is entirely in your hands. You can choose not to share anything personal with us at any time. If you have previously dropped us an email and want us to clear out that conversation history from our inbox, you can easily drop a quick message to our team, and we will handle it for you right away.'
    ],
  },
  {
    icon: HelpCircle,
    title: 'Third-Party Services',
    paragraphs: [
      'We partner only with safe, industry-standard modern web systems for secure cloud hosting, image optimization, and analytics tracking. We absolute do not sell, trade, or distribute any of your personal details to outside marketing companies or ad networks. Your time spent here remains private and secure.'
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <>
      <Seo
        title="Privacy Policy — Loveons"
        description="Learn how Loveons keeps your journey safe, secure, and private while exploring our offline dating tips and cosmic tools."
        path="/privacy"
      />
      <PageLayout
        title="Privacy Policy"
        subtitle="A transparent, easy-to-read look at how we respect and protect your space on Loveons."
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

          <section className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              This privacy policy was last updated on September 2026. We may freshen up these details as our real-world features grow.
            </p>
          </section>
        </div>
      </PageLayout>
    </>
  );
}

