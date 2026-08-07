import { Shield, Cookie, BarChart, Lock, UserCheck } from 'lucide-react';
import Seo from '../components/Seo';
import PageLayout from '../components/PageLayout';

const sections = [
  {
    icon: Lock,
    title: 'Data We Collect',
    paragraphs: [
      'Loveons does not store any personal information you enter into the compatibility calculator. All inputs — names, age, height, body type, and experience level — remain in your browser session and are discarded when you close the page.',
      'If you contact us via the contact form, we receive only the name, email, and message you voluntarily provide. This information is used solely to respond to your inquiry and is never shared with third parties.',
    ],
  },
  {
    icon: Cookie,
    title: 'Cookies',
    paragraphs: [
      'We use minimal cookies necessary for the website to function properly. We do not use cookies to track your personal behavior across other websites.',
      'Analytics cookies may be used to understand aggregate traffic patterns — such as how many visitors access the site and which pages are most viewed. These cookies do not identify you personally.',
    ],
  },
  {
    icon: BarChart,
    title: 'Analytics Usage',
    paragraphs: [
      'We use Google Analytics to collect anonymized, aggregate data about website usage. This helps us understand which features are popular and how to improve the experience for all visitors.',
      'Google Analytics collects information such as page views, session duration, and general geographic region. This data is anonymized and cannot be used to identify individual users.',
    ],
  },
  {
    icon: UserCheck,
    title: 'Your Privacy Rights (GDPR)',
    paragraphs: [
      'Under the General Data Protection Regulation (GDPR), you have the right to access, correct, or delete any personal data we hold about you. Since we do not store calculator inputs, there is no personal data to retrieve or delete from those sessions.',
      'For contact form submissions, you may request deletion of your message at any time by emailing us. We will remove your data from our records within 30 days of receiving your request.',
      'You may also disable cookies in your browser settings at any time. Note that some website features may not function properly with cookies disabled.',
    ],
  },
  {
    icon: Shield,
    title: 'Third-Party Services',
    paragraphs: [
      'We use Google Analytics for traffic analysis and Pexels for stock imagery. These third parties have their own privacy policies governing how they handle data. We encourage you to review their policies.',
      'We do not sell, rent, or trade your data with any third party under any circumstances.',
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <>
      <Seo
        title="Privacy Policy — Loveons"
        description="Read our privacy policy to understand how Loveons handles data collection, cookies, analytics, and your GDPR rights."
        path="/privacy-policy"
      />
      <PageLayout
        title="Privacy Policy"
        subtitle="Your privacy matters. Here's exactly how we handle your data."
      >
        <div className="space-y-6">
          {sections.map((s) => (
            <div key={s.title}>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center">
                  <s.icon className="w-4 h-4 text-rose-500" />
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

          <div className="pt-4 border-t border-rose-100">
            <p className="text-xs text-gray-400">
              This privacy policy was last updated on August 1, 2026. We may update this policy from time to time. Any changes will be posted on this page.
            </p>
          </div>
        </div>
      </PageLayout>
    </>
  );
}
