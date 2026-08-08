
import { useState } from 'react';
import { Heart, Menu, Search, X } from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Blog', to: '/#blog' },
  { label: 'Categories', to: '/#blog' },
  { label: 'About Us', to: '/about' },
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

    const scrollToSection = () => {
      const element = document.getElementById(sectionId);

      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    };

    if (location.pathname === '/') {
      window.history.replaceState(
        null,
        '',
        `/#${sectionId}`
      );

      window.setTimeout(scrollToSection, 50);
      return;
    }

    navigate(`/#${sectionId}`);

    window.setTimeout(scrollToSection, 400);
  };

  const handleSearch = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!searchQuery.trim()) {
      return;
    }

    setSearchOpen(false);
    setMenuOpen(false);

    goToSection('blog');
  };

  return (
    <>
      {/* =====================================================
          MAIN NAVBAR
      ====================================================== */}
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
            {/* =================================================
                LOVEONS BRAND
            ================================================== */}
            <Link
              to="/"
              onClick={closeMenu}
              className="flex items-center gap-2.5 shrink-0"
              aria-label="Loveons.com home"
            >
              {/* Original SVG logo — unchanged */}
              <Logo
                className="w-9 h-9 shrink-0"
                alt="Loveons.com logo"
              />

              <div className="leading-none">
                <span
                  className="
                    block
                    font-display
                    font-bold
                    text-lg
                    tracking-tight
                    text-rose-600
                  "
                >
                  Loveons.com
                </span>

                <span
                  className="
                    block
                    mt-1
                    text-[10px]
                    text-[#6f5263]
                  "
                  style={{
                    fontFamily:
                      '"Segoe Script", "Brush Script MT", "Lucida Handwriting", cursive',
                    fontStyle: 'italic',
                    fontWeight: 600,
                  }}
                >
                  Love, made meaningful.
                </span>
              </div>
            </Link>

            {/* =================================================
                DESKTOP NAVIGATION
                Only regular links.
                No calculator button here.
            ================================================== */}
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
                        px-3.5
                        py-2.5
                        rounded-xl
                        text-sm
                        font-medium
                        text-gray-600
                        hover:text-rose-600
                        hover:bg-rose-50
                        transition-all
                        duration-200
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
                      px-3.5
                      py-2.5
                      rounded-xl
                      text-sm
                      font-medium
                      transition-all
                      duration-200
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

            {/* =================================================
                RIGHT SIDE
            ================================================== */}
            <div className="flex items-center gap-1.5">
              {/* Search */}
              <button
                type="button"
                onClick={() =>
                  setSearchOpen((value) => !value)
                }
                className="
                  w-10
                  h-10
                  flex
                  items-center
                  justify-center
                  rounded-xl
                  text-gray-500
                  hover:text-rose-600
                  hover:bg-rose-50
                  transition-all
                "
                aria-label="Search"
                aria-expanded={searchOpen}
              >
                <Search
                  className="w-5 h-5"
                  strokeWidth={1.8}
                />
              </button>

              {/* =================================================
                  HAMBURGER
                  ALWAYS VISIBLE — DESKTOP + MOBILE
              ================================================== */}
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="
                  w-10
                  h-10
                  flex
                  items-center
                  justify-center
                  rounded-xl
                  text-gray-600
                  hover:text-rose-600
                  hover:bg-rose-50
                  transition-all
                "
                aria-label="Open menu"
                aria-expanded={menuOpen}
              >
                <Menu
                  className="w-6 h-6"
                  strokeWidth={1.8}
                />
              </button>
            </div>
          </nav>

          {/* =================================================
              SEARCH PANEL
          ================================================== */}
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
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      w-4
                      h-4
                      text-rose-400
                    "
                    aria-hidden="true"
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
                      pl-10
                      pr-4
                      py-3
                      rounded-xl
                      border
                      border-rose-100
                      bg-white
                      text-sm
                      text-gray-800
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

      {/* =====================================================
          MENU OVERLAY
          Works on desktop + mobile
      ====================================================== */}
      {menuOpen && (
        <button
          type="button"
          className="
            fixed
            inset-0
            z-[60]
            bg-black/30
            backdrop-blur-sm
          "
          onClick={closeMenu}
          aria-label="Close menu"
        />
      )}

      {/* =====================================================
          NAVIGATION DRAWER
          Works on desktop + mobile
      ====================================================== */}
      <aside
        className={`
          fixed
          top-0
          right-0
          z-[70]
          h-full
          w-[min(88vw,360px)]
          bg-white
          shadow-2xl
          flex
          flex-col
          transition-transform
          duration-300
          ease-out
          ${
            menuOpen
              ? 'translate-x-0'
              : 'translate-x-full'
          }
        `}
        aria-label="Navigation menu"
      >
        {/* =================================================
            DRAWER HEADER
        ================================================== */}
        <div
          className="
            flex
            items-center
            justify-between
            px-5
            py-5
            border-b
            border-rose-100
          "
        >
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-2"
          >
            {/* Original SVG logo */}
            <Logo
              className="w-8 h-8"
              alt="Loveons.com logo"
            />

            <div className="leading-none">
              <span
                className="
                  block
                  font-display
                  font-bold
                  text-lg
                  text-rose-600
                "
              >
                Loveons.com
              </span>

              <span
                className="
                  block
                  mt-1
                  text-[9px]
                  text-[#6f5263]
                "
                style={{
                  fontFamily:
                    '"Segoe Script", "Brush Script MT", "Lucida Handwriting", cursive',
                  fontStyle: 'italic',
                  fontWeight: 600,
                }}
              >
                Love, made meaningful.
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={closeMenu}
            className="
              w-10
              h-10
              flex
              items-center
              justify-center
              rounded-xl
              text-gray-500
              hover:text-rose-600
              hover:bg-rose-50
              transition-colors
            "
            aria-label="Close menu"
          >
            <X
              className="w-5 h-5"
              strokeWidth={1.8}
            />
          </button>
        </div>

        {/* =================================================
            MENU LINKS
        ================================================== */}
        <nav
          className="
            flex-1
            px-5
            py-6
            flex
            flex-col
            gap-2
          "
        >
          {/* Home */}
          <Link
            to="/"
            onClick={closeMenu}
            className="
              px-4
              py-3
              rounded-xl
              text-sm
              font-medium
              text-gray-700
              hover:text-rose-600
              hover:bg-rose-50
              transition-all
            "
          >
            Home
          </Link>

          {/* Blog */}
          <button
            type="button"
            onClick={() => goToSection('blog')}
            className="
              text-left
              px-4
              py-3
              rounded-xl
              text-sm
              font-medium
              text-gray-700
              hover:text-rose-600
              hover:bg-rose-50
              transition-all
            "
          >
            Blog
          </button>

          {/* Categories */}
          <button
            type="button"
            onClick={() => goToSection('blog')}
            className="
              text-left
              px-4
              py-3
              rounded-xl
              text-sm
              font-medium
              text-gray-700
              hover:text-rose-600
              hover:bg-rose-50
              transition-all
            "
          >
            Categories
          </button>

          {/* About Us */}
          <Link
            to="/about"
            onClick={closeMenu}
            className="
              px-4
              py-3
              rounded-xl
              text-sm
              font-medium
              text-gray-700
              hover:text-rose-600
              hover:bg-rose-50
              transition-all
            "
          >
            About Us
          </Link>

          {/* =================================================
              LOVE CALCULATOR
              ONLY INSIDE MENU
          ================================================== */}
          <button
            type="button"
            onClick={() => goToSection('calculator')}
            className="
              mt-4
              w-full
              flex
              items-center
              justify-center
              gap-2
              px-4
              py-3.5
              rounded-xl
              bg-gradient-to-r
              from-rose-500
              to-fuchsia-500
              text-white
              text-sm
              font-semibold
              shadow-[0_8px_22px_rgba(244,63,94,0.24)]
              hover:shadow-[0_10px_28px_rgba(244,63,94,0.30)]
              hover:-translate-y-0.5
              active:translate-y-0
              transition-all
              duration-200
            "
          >
            <Heart
              className="w-4 h-4 fill-current"
              aria-hidden="true"
            />

            <span>Love Calculator</span>
          </button>
        </nav>

        {/* =================================================
            DRAWER FOOTER
        ================================================== */}
        <div
          className="
            px-5
            py-5
            border-t
            border-rose-100
          "
        >
          <p className="text-xs text-gray-400 text-center">
            © {new Date().getFullYear()} Loveons.com.
            All Rights Reserved.
          </p>
        </div>
      </aside>
    </>
  );
}




