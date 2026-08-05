import { useState } from 'react';
import { X, Menu, Heart } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Wellness Blog', to: '/#blog' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Disclaimer', to: '/disclaimer' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const handleNavClick = (to: string) => {
    setOpen(false);
    if (to.startsWith('/#')) {
      const target = to.substring(2);
      if (location.pathname !== '/') {
        setTimeout(() => {
          document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-rose-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" aria-label="LoveIntimacyTips home">
            <Heart className="w-5 h-5 text-rose-500 heart-pulse fill-rose-500" />
            <span className="font-display font-bold text-lg text-rose-600 tracking-tight">
              LoveIntimacyTips
            </span>
          </Link>
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-xl hover:bg-rose-50 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 text-rose-500" />
          </button>
        </div>
      </nav>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm drawer-overlay"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Side Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 z-50 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Navigation menu"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-rose-100">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <span className="font-display font-semibold text-rose-600">Menu</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-xl hover:bg-rose-50 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 py-6 px-4 flex flex-col gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to.split('#')[0] && !link.to.includes('#');
            return (
              <NavLink
                key={link.label}
                to={link.to.split('#')[0]}
                onClick={() => handleNavClick(link.to)}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'bg-rose-50 text-rose-600'
                    : 'text-gray-700 hover:bg-rose-50 hover:text-rose-600'
                }`}
              >
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-rose-100">
          <p className="text-xs text-gray-400 text-center">
            © {new Date().getFullYear()} LoveIntimacyTips. All Rights Reserved.
          </p>
        </div>
      </aside>
    </>
  );
}
