
import { useState } from 'react';
import { Heart, Menu, Search, X } from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { BRAND } from '../lib/brand';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Blog', to: '/#blog' },
  { label: 'Categories', to: '/#blog' },
  { label: 'About', to: '/about' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const goToSection = (sectionId: string) => {
    closeMenu();
    setSearchOpen(false);

    if (location.pathname === '/') {
      const element = document.getElementById(sectionId);

      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }

      return;
    }

    navigate(`/#${sectionId}`);

    window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 300);
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSearchOpen(false);
    setMenuOpen(false);

    if (searchQuery.trim()) {
      goToSection('blog');
    }
  };

  return (
    <>
      {/* =========================
          MAIN NAVBAR
      ========================== */}
      <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-5 pt-3">
        <div className="max-w-6xl mx-auto">
          <nav
            className="
              relative
              h-16
              flex items-center justify-between
              px-4 sm:px-5
              rounded-2xl
              border border-white/70
              bg-white/85
              backdrop-blur-xl
              shadow-[0_8px_35px_rgba(190,24,93,0.10)]
            "
            aria-label="Main navigation"
          >
            {/* =========================
                ORIGINAL SVG LOGO
                NO BOX / NO BACKGROUND
            ========================== */}
            <Link
              to="/"
              onClick={closeMenu}
              className="flex items-center gap-2.5 shrink-0"
              aria-label={`${BRAND.name} home`}
            >
              <Logo
                className="w-9 h-9 shrink-0"
                alt={`${BRAND.name} logo`}
              />

              <div className="hidden sm:block leading-none">
                <span className="font-display font-bold text-lg tracking-tight text-rose-600">
                  {BRAND.name}
                </span>

                <span className="block mt-1 text-[8px] uppercase tracking-[0.25em] text-gray-400">
                  Love • Connect • Grow
                </span>
              </div>
            </Link>

            {/* =========================
                DESKTOP NAVIGATION
            ========================== */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isHashLink = link.to.includes('#');

                if (isHashLink) {
                  const sectionId = link.to.split('#')[1];

                  return (
                    <button
                      key={link.label}
                      type="button"
                      onClick={() => goToSection(sectionId)}
                      className="
                        px-3.5 py-2.5
                        rounded-xl
                        text-sm font-medium
                        text-gray-600
                        hover:text-rose-600
                        hover:bg-rose-50
                        transition-all duration-200
                      "
                    >
                      {link.label}
                    </button>
                  );
                }

                return (
                  <NavLink
                    key={link.label}
                    to={link.to}
                    end={link.to === '/'}
                    onClick={closeMenu}
                    className={({ isActive }) => `
                      px-3.5 py-2.5
                      rounded-xl
                      text-sm font-medium
                      transition-all duration-200
                      ${
                        isActive
                          ? 'bg-rose-50 text-rose-600'
                          : 'text-gray-600 hover:text-rose-600 hover:bg-rose-50'
                      }
                    `}
                  >
                    {link.label}
                  </NavLink>
                );
              })}
            </div>

            {/* =========================
                RIGHT SIDE
            ========================== */}
            <div className="flex items-center gap-1.5">

              {/* Search */}
              <button
                type="button"
                onClick={() => setSearchOpen((value) => !value)}
                className="
                  w-10 h-10
                  flex items-center justify-center
                  rounded-xl
                  text-gray-500
                  hover:text-rose-600
                  hover:bg-rose-50
                  transition-all
                "
                aria-label="Search"
                aria-expanded={searchOpen}
              >
                <Search className="w-5 h-5" strokeWidth={1.8} />
              </button>

              {/* =========================
                  LOVE CALCULATOR
                  CONNECTED TO #calculator
              ========================== */}
              <button
                type="button"
                onClick={() => goToSection('calculator')}
                className="
                  hidden sm:flex
                  items-center gap-2
                  h-10
                  px-4
                  rounded-xl
                  bg-gradient-to-r
                  from-rose-500
                  to-fuchsia-500
                  text-white
                  text-sm font-semibold
                  shadow-[0_6px_20px_rgba(244,63,94,0.24)]
                  hover:shadow-[0_8px_25px_rgba(244,63,94,0.32)]
                  hover:-translate-y-0.5
                  active:translate-y-0
                  transition-all duration-200
                "
              >
                <Heart className="w-4 h-4 fill-current" />
                <span>Love Calculator</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="
                  lg:hidden
                  w-10 h-10
                  flex items-center justify-center
                  rounded-xl
                  text-gray-600
                  hover:text-rose-600
                  hover:bg-rose-50
                  transition-all
                "
                aria-label="Open menu"
                aria-expanded={menuOpen}
              >
                <Menu className="w-6 h-6" strokeWidth={1.8} />
              </button>
            </div>
          </nav>

          {/* =========================
              SEARCH PANEL
          ========================== */}
          {searchOpen && (
            <div
              className="
                mt-2
                p-3
                rounded-2xl
                border border-white/70
                bg-white/90
                backdrop-blur-xl
                shadow-[0_10px_35px_rgba(190,24,93,0.10)]
              "
            >
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search
                    className="
                      absolute left-3 top-1/2
                      -translate-y-1/2
                      w-4 h-4
                      text-rose-400
                    "
                  />

                  <input
                    type="search"
                    autoFocus
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(event.target.value)
                    }
                    placeholder="Search articles, tips, and more..."
                    className="
                      w-full
                      pl-10 pr-4 py-3
                      rounded-xl
                      border border-rose-100
                      bg-white
                      text-sm text-gray-800
                      placeholder:text-gray-400
                      outline-none
                      focus:border-rose-300
                      focus:ring-2
                      focus:ring-rose-100
                      transition-all
                    "
                    aria-label="Search articles"
                  />
                </div>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* =========================
          MOBILE OVERLAY
      ========================== */}
      {menuOpen && (
        <button
          type="button"
          className="
            fixed inset-0
            z-[60]
            bg-black/30
            backdrop-blur-sm
            lg:hidden
          "
          onClick={closeMenu}
          aria-label="Close menu"
        />
      )}

      {/* =========================
          MOBILE DRAWER
      ========================== */}
      <aside
        className={`
          fixed top-0 right-0
          z-[70]
          h-full
          w-[min(88vw,360px)]
          bg-white
          shadow-2xl
          flex flex-col
          transition-transform duration-300 ease-out
          lg:hidden
          ${menuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        aria-label="Mobile navigation"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-rose-100">
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-2"
          >
            <Logo
              className="w-8 h-8"
              alt={`${BRAND.name} logo`}
            />

            <span className="font-display font-bold text-lg text-rose-600">
              {BRAND.name}
            </span>
          </Link>

          <button
            type="button"
            onClick={closeMenu}
            className="
              w-10 h-10
              flex items-center justify-center
              rounded-xl
              text-gray-500
              hover:text-rose-600
              hover:bg-rose-50
              transition-colors
            "
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Links */}
        <nav className="flex-1 px-5 py-6 flex flex-col gap-2">
          <Link
            to="/"
            onClick={closeMenu}
            className="
              px-4 py-3
              rounded-xl
              text-sm font-medium
              text-gray-700
              hover:text-rose-600
              hover:bg-rose-50
              transition-all
            "
          >
            Home
          </Link>

          <button
            type="button"
            onClick={() => goToSection('blog')}
            className="
              text-left
              px-4 py-3
              rounded-xl
              text-sm font-medium
              text-gray-700
              hover:text-rose-600
              hover:bg-rose-50
              transition-all
            "
          >
            Blog
          </button>

          <button
            type="button"
            onClick={() => goToSection('blog')}
            className="
              text-left
              px-4 py-3
              rounded-xl
              text-sm font-medium
              text-gray-700
              hover:text-rose-600
              hover:bg-rose-50
              transition-all
            "
          >
            Categories
          </button>

          <Link
            to="/about"
            onClick={closeMenu}
            className="
              px-4 py-3
              rounded-xl
              text-sm font-medium
              text-gray-700
              hover:text-rose-600
              hover:bg-rose-50
              transition-all
            "
          >
            About
          </Link>

          {/* Mobile Calculator */}
          <button
            type="button"
            onClick={() => goToSection('calculator')}
            className="
              mt-4
              w-full
              flex items-center justify-center gap-2
              px-4 py-3.5
              rounded-xl
              bg-gradient-to-r
              from-rose-500
              to-fuchsia-500
              text-white
              text-sm font-semibold
              shadow-[0_8px_22px_rgba(244,63,94,0.24)]
              hover:-translate-y-0.5
              transition-all duration-200
            "
          >
            <Heart className="w-4 h-4 fill-current" />
            <span>Love Calculator</span>
          </button>
        </nav>

        {/* Drawer Footer */}
        <div className="px-5 py-5 border-t border-rose-100">
          <p className="text-xs text-gray-400 text-center">
            © {new Date().getFullYear()} {BRAND.name}. All Rights Reserved.
          </p>
        </div>
      </aside>
    </>
  );
}


