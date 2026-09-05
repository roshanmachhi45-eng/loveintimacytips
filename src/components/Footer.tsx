
import { Shield, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo';


const footerLinks = [
  { label: 'About Us', to: '/about' },
  { label: 'Contact Us', to: '/contact' },
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Disclaimer', to: '/disclaimer' },
  { label: 'Terms & Conditions', to: '/terms' },
];

export default function Footer() {
  return (
    <footer className="mt-16 px-4 pb-8">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-rose-100 bg-white p-6 shadow-lg shadow-rose-100 sm:p-8">

          {/* Logo + Brand */}
          <Link
            to="/"
            className="mb-5 flex items-center justify-center gap-2"
            aria-label="Loveons Home"
          >
            <Logo
              className="h-7 w-7"
              alt="Loveons.com logo"
            />

            <span className="font-display text-xl font-bold text-rose-600">
              Loveons.com
            </span>
          </Link>

          {/* Small Description */}
          <p className="mb-6 text-center text-sm text-gray-500 max-w-md mx-auto">
            Discover relationship insights, love tools, and expert advice
            to build stronger and happier connections.
          </p>

          {/* Footer Links */}
          <nav
            className="mb-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-gray-500"
            aria-label="Footer navigation"
          >
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="font-medium transition-colors hover:text-rose-600"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Contact Email */}
          <div className="flex justify-center">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-rose-600"
            >
              <Mail className="h-4 w-4" />
              <span>{CONTACT_EMAIL}</span>
            </a>
          </div>

          {/* Copyright */}
          <p className="mt-4 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Loveons.com. All Rights Reserved.
          </p>

        </div>
      </div>
    </footer>
  );
}

