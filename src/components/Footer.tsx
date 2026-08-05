import { Heart, Shield, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const footerLinks = [
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Disclaimer', to: '/disclaimer' },
];

export default function Footer() {
  return (
    <footer className="mt-16 px-4 pb-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg shadow-rose-100 border border-rose-100 p-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <span className="font-display font-bold text-rose-600">LoveIntimacyTips</span>
          </div>

          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 mb-5 text-xs text-gray-500" aria-label="Footer navigation">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="hover:text-rose-500 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100 mb-4">
            <Shield className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              <span className="font-semibold">Disclaimer:</span> This app is for educational purposes only and is not a substitute for professional medical or relationship advice. Always consult qualified professionals for personal concerns.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <Mail className="w-3 h-3" />
            <span>rocksymac0@gmail.com</span>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            © {new Date().getFullYear()} LoveIntimacyTips. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
