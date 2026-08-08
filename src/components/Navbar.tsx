import { useState } from 'react';
import { X, Menu, Search } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { BRAND } from '../lib/brand';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Blog', to: '/#blog' },
  { label: 'Love Calculator', to: '/#calculator' },
  { label: 'Categories', to: '/#blog' },
  { label: 'About', to: '/about' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchOpen(false);
    setOpen(false);
    if (searchQuery.trim()) {
      const target = '/#blog';
      handleNavClick(target);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-rose-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" aria-label={`${BRAND.name} home`}>
            <Logo className="w-8 h-8" alt={`${BRAND.name} logo`} />
            <span className="font-display font-bold text-lg text-rose-600 tracking-tight">
              {BRAND.name}
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-xl hover:bg-rose-50 transition-colors"
              aria-label="Search"
              aria-expanded={searchOpen}
            >
              <Search className="w-5 h-5 text-rose-500" />
            </button>
            <button
              onClick={() => setOpen(true)}
              className="p-2 rounded-xl hover:bg-rose-50 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-rose-500" />
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-rose-100 bg-white px-4 py-3 fade-in">
            <form onSubmit={handleSearch} className="max-w-5xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type="search"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles, tips, and more..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-sm transition-all"
                  aria-label="Search articles"
                />
              </div>
            </form>
          </div>
        )}
      </nav>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm drawer-overlay"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 right-0 h-full w-72 z-50 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Navigation menu"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-rose-100">
          <div className="flex items-center gap-2">
            <Logo className="w-6 h-6" alt={`${BRAND.name} logo`} />
            <span className="font-display font-semibold text-rose-600">{BRAND.name}</span>
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
            © {new Date().getFullYear()} {BRAND.name}. All Rights Reserved.
          </p>
        </div>
      </aside>
    </>
  );
          }
