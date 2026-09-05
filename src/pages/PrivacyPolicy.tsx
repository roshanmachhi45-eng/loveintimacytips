import { Shield, Cookie, BarChart, Lock, UserCheck } from 'lucide-react';
import Seo from '../components/Seo';
import PageLayout from '../components/PageLayout';

const sections = [
  {
    icon: Lock,
    title: 'Information We Collect',
    paragraphs: [
      'You can use Loveons without creating an account or giving us personal information.',
      'When you use our Love Calculator or other interactive tools we do not ask you to create an account. Please avoid entering information that you do not want to share online.',
      'If you contact us by email or through a contact form we may receive the name email address and message that you choose to send us. We use this information to respond to your request.',
    ],
  },
  {
    icon: Cookie,
    title: 'Cookies',
    paragraphs: [
      'Loveons may use cookies and similar technologies to help the website work properly and to understand how visitors use the site.',
      'Google Analytics may use cookies to collect information about how visitors use our website. This helps us understand which pages and features people find useful.',
      'If we use Google AdSense or other Google advertising services cookies and similar technologies may also be used to provide and measure advertising.',
      'You can control or remove cookies through your browser settings. Some parts of the website may not work as expected if cookies are disabled.',
    ],
  },
  {
    icon: BarChart,
    title: 'Google Analytics',
    paragraphs: [
      'We use Google Analytics to understand how visitors use Loveons.',
      'Google Analytics may collect information such as pages visited the type of device being used the approximate location of visitors and general usage information.',
      'We use this information to understand how people use our website and to improve our content tools and overall experience.',
      'Google may process this information according to its own privacy practices. You can learn more about how Google handles information through Google privacy resources.',
    ],
  },
  {
    icon: BarChart,
    title: 'Google Search Console',
    paragraphs: [
      'We use Google Search Console to understand how Loveons appears in Google Search.',
      'Search Console provides website owners with information such as search queries impressions clicks and other search performance data.',
      'This information helps us find technical issues understand how people discover our website and improve our pages for visitors.',
      'Search Console is used for website management and search performance. It is not used by us to identify individual visitors personally.',
    ],
  },
  {
    icon: UserCheck,
    title: 'Your Privacy Choices',
    paragraphs: [
      'You can choose not to provide personal information when it is not needed.',
      'You can also manage cookies through your browser settings. Some browser settings may affect how certain parts of Loveons work.',
      'If you contact us and want us to delete the information you sent us you can contact us using the email address provided on our website.',
      'Depending on where you live you may have additional rights under applicable privacy and data protection laws.',
    ],
  },
  {
    icon: Shield,
    title: 'Third-Party Services',
    paragraphs: [
      'Loveons uses third-party services to help us operate and improve the website. These may include Google Analytics Google Search Console and Google advertising services such as AdSense when advertising is enabled.',
      'We may also use third-party services such as Pexels for images and other website services when needed.',
      'These providers may handle information according to their own privacy policies. We recommend reviewing their policies if you would like to learn more about how they handle information.',
      'We do not sell your personal information to other companies.',
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <>
      <Seo
        title="Privacy Policy — Loveons"
        description="Learn how Loveons handles information cookies analytics search performance advertising and your privacy choices."
        path="/privacy-policy"
      />

      <PageLayout
        title="Privacy Policy"
        subtitle="Your privacy matters to us. Here is how Loveons handles information cookies analytics and other website services."
      >
        <div className="space-y-6">
          {sections.map((s) => (
            <div key={s.title}>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center">
                  <s.icon className="w-4 h-4 text-rose-500" />
                </div>

                <h2 className="font-display text-lg font-bold text-gray-800">
                  {s.title}
                </h2>
              </div>

              <div className="space-y-2 pl-11">
                {s.paragraphs.map((p, i) => (
                  <p
                    key={i}
                    className="text-sm text-gray-600 leading-relaxed"
                  >
                    {p}
                  </p>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-rose-100">
            <p className="text-xs text-gray-400">
              This privacy policy was last updated on September 5 2026.
              We may update this page when our website or services change.
            </p>
          </div>
        </div>
      </PageLayout>
    </>
  );
                }
