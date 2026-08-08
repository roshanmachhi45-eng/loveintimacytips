
import { useState } from 'react';
import { X, Menu, Search, Sparkles, Heart, ArrowRight } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { BRAND } from '../lib/brand';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Blog', to: '/#blog' },
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

    if (!to.startsWith('/#')) {
      return;
    }

    const target = to.substring(2);

    if (location.pathname !== '/') {
      window.location.href = `/#${target}`;
      return;
    }

    setTimeout(() => {
      document.getElementById(target)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 50);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const query = searchQuery.trim();

    setSearchOpen(false);
    setOpen(false);

    if (!query) {
      return;
    }

    if (location.pathname !== '/') {
      window.location.href = `/#blog`;
      return;
    }

    setTimeout(() => {
      document.getElementById('blog')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 50);
  };

  const isHomeActive = location.pathname === '/';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-5 pt-3">
        <div className="max-w-6xl mx-auto">
          <nav
            className="
              relative overflow-hidden
              rounded-2xl
              border border-white/70
              bg-white/80
              backdrop-blur-xl
              shadow-[0_8px_40px_rgba(190,24,93,0.10)]
            "
            aria-label="Main navigation"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-rose-100/30 via-white/20 to-purple-100/30" />

            <div className="pointer-events-none absolute -top-12 left-1/3 h-24 w-24 rounded-full bg-rose-300/20 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-12 right-1/4 h-24 w-24 rounded-full bg-purple-300/20 blur-3xl" />

            <div className="relative h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="group flex items-center gap-2.5 shrink-0"
                aria-label={`${BRAND.name} home`}
              >
                <div
                  className="
                    relative flex items-center justify-center
                    w-10 h-10
                    rounded-xl
                    bg-gradient-to-br from-rose-500 to-fuchsia-500
                    shadow-[0_6px_20px_rgba(244,63,94,0.28)]
                    transition-transform duration-300
                    group-hover:scale-105
                  "
                >
                  <Logo
                    className="w-7 h-7"
                    alt={`${BRAND.name} logo`}
                  />

                  <span className="absolute inset-0 rounded-xl ring-1 ring-white/60" />
                </div>

                <div className="hidden sm:block">
                  <span className="block font-display font-bold text-lg leading-none tracking-tight bg-gradient-to-r from-rose-600 to-fuchsia-600 bg-clip-text text-transparent">
                    {BRAND.name}
                  </span>

                  <span className="mt-1 block text-[9px] uppercase tracking-[0.22em] text-gray-400">
                    Love • Connect • Grow
                  </span>
                </div>
              </Link>

              <div className="hidden lg:flex items-center gap-1">
                {navLinks.map((link) => {
                  const isHashLink = link.to.includes('#');

                  const isActive = isHashLink
                    ? link.label === 'Home' && isHomeActive
                    : location.pathname === link.to;

                  return (
                    <NavLink
                      key={link.label}
                      to={link.to.split('#')[0]}
                      end={link.to === '/'}
                      onClick={(e) => {
                        if (isHashLink) {
                          e.preventDefault();
                          handleNavClick(link.to);
                        } else {
                          setOpen(false);
                        }
                      }}
                      className={`
                        relative px-3.5 py-2 rounded-xl
                        text-sm font-medium
                        transition-all duration-200
                        ${
                          isActive
                            ? 'text-rose-600 bg-rose-50/80'
                            : 'text-gray-600 hover:text-rose-600 hover:bg-rose-50/60'
                        }
                      `}
                    >
                      {link.label}

                      {isActive && (
                        <span className="absolute left-1/2 -bottom-0.5 -translate-x-1/2 w-5 h-0.5 rounded-full bg-gradient-to-r from-rose-500 to-fuchsia-500" />
                      )}
                    </NavLink>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSearchOpen((value) => !value)}
                  className="
                    relative
                    w-10 h-10
                    flex items-center justify-center
                    rounded-xl
                    border border-rose-100
                    bg-white/70
                    text-gray-500
                    hover:text-rose-600
                    hover:bg-rose-50
                    transition-all duration-200
                  "
                  aria-label="Search articles"
                  aria-expanded={searchOpen}
                >
                  <Search className="w-[18px] h-[18px]" />
                </button>

                <Link
                  to="/#calculator"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick('/#calculator');
                  }}
                  className="
                    hidden sm:inline-flex
                    items-center gap-2
                    rounded-xl
                    px-4 py-2.5
                    text-sm font-semibold text-white
                    bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500
                    shadow-[0_7px_22px_rgba(244,63,94,0.25)]
                    hover:shadow-[0_9px_28px_rgba(244,63,94,0.35)]
                    hover:-translate-y-0.5
                    active:translate-y-0
                    transition-all duration-200
                  "
                >
                  <Sparkles className="w-4 h-4" />
                  Love Calculator
                </Link>

                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="
                    lg:hidden
                    w-10 h-10
                    flex items-center justify-center
                    rounded-xl
                    border border-rose-100
                    bg-white/70
                    text-gray-600
                    hover:text-rose-600
                    hover:bg-rose-50
                    transition-all duration-200
                  "
                  aria-label="Open navigation menu"
                  aria-expanded={open}
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
            </div>

            {searchOpen && (
              <div className="relative border-t border-rose-100/70 bg-white/70 px-4 py-3 sm:px-6">
                <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400" />

                    <input
                      type="search"
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search articles, relationship tips, and more..."
                      className="
                        w-full
                        pl-11 pr-4 py-3
                        rounded-xl
                        border border-rose-100
                        bg-white/90
                        text-sm text-gray-800
                        placeholder:text-gray-400
                        outline-none
                        focus:border-rose-300
                        focus:ring-4
                        focus:ring-rose-100
                        transition-all
                      "
                      aria-label="Search articles"
                    />
                  </div>
                </form>
              </div>
            )}
          </nav>
        </div>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-[60] bg-gray-950/35 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed top-0 right-0 z-[70]
          h-full w-[min(88vw,360px)]
          bg-white
          shadow-[-20px_0_60px_rgba(15,23,42,0.18)]
          transition-transform duration-300 ease-out
          ${open ? 'translate-x-0' : 'translate-x-full'}
        `}
        aria-label="Mobile navigation"
        aria-hidden={!open}
      >
        <div className="relative h-full flex flex-col overflow-hidden">
          <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-rose-200/30 blur-3xl" />

          <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-purple-200/30 blur-3xl" />

          <div className="relative flex items-center justify-between px-5 py-5 border-b border-rose-100">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-fuchsia-500 flex items-center justify-center shadow-md">
                <Logo
                  className="w-6 h-6"
                  alt={`${BRAND.name} logo`}
                />
              </div>

              <div>
                <span className="block font-display font-bold text-base text-rose-600">
                  {BRAND.name}
                </span>

                <span className="block text-[8px] uppercase tracking-[0.18em] text-gray-400">
                  Love • Connect • Grow
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="
                w-10 h-10
                flex items-center justify-center
                rounded-xl
                bg-gray-50
                text-gray-500
                hover:bg-rose-50
                hover:text-rose-600
                transition-colors
              "
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative flex-1 overflow-y-auto px-5 py-6">
            <div className="mb-5 px-1">
              <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-rose-400">
                Explore Loveons
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Tools and ideas for better connections.
              </p>
            </div>

            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const isHashLink = link.to.includes('#');

                const isActive = isHashLink
                  ? link.label === 'Home' && isHomeActive
                  : location.pathname === link.to;

                return (
                  <NavLink
                    key={link.label}
                    to={link.to.split('#')[0]}
                    end={link.to === '/'}
                    onClick={(e) => {
                      if (isHashLink) {
                        e.preventDefault();
                        handleNavClick(link.to);
                      } else {
                        setOpen(false);
                      }
                    }}
                    className={`
                      flex items-center justify-between
                      px-4 py-3.5
                      rounded-2xl
                      border
                      transition-all duration-200
                      ${
                        isActive
                          ? 'border-rose-200 bg-gradient-to-r from-rose-50 to-fuchsia-50 text-rose-600'
                          : 'border-transparent text-gray-700 hover:border-rose-100 hover:bg-rose-50/60 hover:text-rose-600'
                      }
                    `}
                  >
                    <span className="font-medium">
                      {link.label}
                    </span>

                    <ArrowRight
                      className={`
                        w-4 h-4 transition-transform
                        ${isActive ? 'text-rose-500' : 'text-gray-300'}
                      `}
                    />
                  </NavLink>
                );
              })}
            </nav>

            <Link
              to="/#calculator"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('/#calculator');
              }}
              className="
                mt-6
                flex items-center justify-center gap-2
                w-full
                rounded-2xl
                px-5 py-4
                font-semibold text-white
                bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500
                shadow-[0_10px_30px_rgba(244,63,94,0.25)]
                hover:-translate-y-0.5
                transition-all
              "
            >
              <Sparkles className="w-4 h-4" />
              Try Love Calculator
            </Link>

            <div className="mt-8 rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/80 to-purple-50/80 p-4">
              <div className="flex items-center gap-2 text-rose-500">
                <Heart className="w-4 h-4 fill-current" />

                <span className="text-xs font-semibold uppercase tracking-wider">
                  Loveons
                </span>
              </div>

              <p className="mt-2 text-xs leading-5 text-gray-500">
                Discover thoughtful relationship ideas, practical tools,
                and simple ways to build stronger connections.
              </p>
            </div>
          </div>

          <div className="relative px-5 py-4 border-t border-rose-100">
            <p className="text-[10px] text-center text-gray-400">
              © {new Date().getFullYear()} {BRAND.name}. All Rights Reserved.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

