
import { useEffect, useRef, useState } from 'react';
import {
  Calculator,
  ChevronDown,
  Info,
  Menu,
  Search,
  X,
  Heart,
  Gift,
  CalendarDays,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import Logo from './Logo';

const CATEGORY_EVENT = 'loveons:category-change';

const CATEGORIES = [
  'Communication',
  'Conflict Resolution',
  'Date Ideas',
  'Relationship Tips',
  'Trust & Commitment',
  'Dating',
  'Marriage',
  'Self Love',
  'Mental Health',
  'Breakup & Healing',
  'Romance',
];

const TOOLS = [
  {
    label: 'Love Calculator',
    to: '/#calculator',
    icon: Calculator,
  },
  {
    label: 'Compatibility Test',
    to: '/#calculator',
    icon: Heart,
  },
  {
    label: 'Anniversary Calculator',
    to: '/#calculator',
    icon: CalendarDays,
  },
  {
    label: 'Date Ideas Generator',
    to: '/#calculator',
    icon: Gift,
  },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const searchRef = useRef<HTMLInputElement>(null);

  /*
   * Close menus when route changes.
   */
  useEffect(() => {
    setMenuOpen(false);
    setCategoriesOpen(false);
    setToolsOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  /*
   * Prevent background scrolling while mobile drawer is open.
   */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  /*
   * Focus search field when opened.
   */
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => {
        searchRef.current?.focus();
      }, 50);
    }
  }, [searchOpen]);

  /*
   * Scroll to an existing Home section.
   */
  function goToSection(id: string) {
    closeAll();

    if (location.pathname !== '/') {
      navigate(`/#${id}`);

      setTimeout(() => {
        document
          .getElementById(id)
          ?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
      }, 250);

      return;
    }

    setTimeout(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
    }, 50);
  }

  /*
   * Blog category selection.
   */
  function selectCategory(category: string) {
    closeAll();

    if (location.pathname !== '/') {
      navigate('/');

      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent<string>(CATEGORY_EVENT, {
            detail: category,
          })
        );

        document
          .getElementById('blog')
          ?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
      }, 250);

      return;
    }

    window.dispatchEvent(
      new CustomEvent<string>(CATEGORY_EVENT, {
        detail: category,
      })
    );

    setTimeout(() => {
      document
        .getElementById('blog')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
    }, 50);
  }

  function selectAllCategories() {
    selectCategory('');
  }

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();

    const query = searchValue.trim();

    if (!query) return;

    setSearchOpen(false);
    setSearchValue('');

    navigate(`/search?q=${encodeURIComponent(query)}`);
  }

  function closeAll() {
    setMenuOpen(false);
    setCategoriesOpen(false);
    setToolsOpen(false);
    setSearchOpen(false);
  }

  function toggleMenu() {
    setMenuOpen((value) => !value);
    setCategoriesOpen(false);
    setToolsOpen(false);
    setSearchOpen(false);
  }

  return (
    <>
      {/* =====================================================
          NAVBAR
      ====================================================== */}
      <header className="sticky top-0 z-[100] px-3 pt-3 sm:px-5">
        <div
          className="
            relative mx-auto max-w-7xl
            rounded-2xl
            border border-rose-100/80
            bg-white/95
            shadow-[0_12px_40px_rgba(244,63,94,0.10)]
            backdrop-blur-xl
          "
        >
          <div
            className="
              flex h-[68px]
              items-center
              px-3 sm:px-5 lg:px-6
            "
          >
            {/* =================================================
                HAMBURGER
            ================================================== */}
            <button
              type="button"
              onClick={toggleMenu}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className="
                flex h-10 w-10 shrink-0
                items-center justify-center
                rounded-xl
                text-gray-600
                transition-all
                hover:bg-rose-50
                hover:text-rose-600
                focus:outline-none
                focus:ring-2
                focus:ring-rose-200
              "
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            {/* =================================================
                LOGO
            ================================================== */}
            <Link
              to="/"
              onClick={closeAll}
              className="
                ml-2 flex shrink-0
                items-center gap-2
                transition-transform
                hover:scale-[1.02]
              "
            >
              <Logo className="h-10 w-10 sm:h-11 sm:w-11" />

              <span
                className="
                  whitespace-nowrap
                  text-[20px] sm:text-[22px]
                  font-extrabold
                  tracking-[-0.03em]
                  text-rose-600
                "
              >
                Loveons.com
              </span>
            </Link>

            {/* =================================================
                DESKTOP NAV
            ================================================== */}
            <nav
              className="
                ml-auto hidden
                items-center gap-1
                lg:flex
              "
            >
              {/* HOME */}
              <Link
                to="/"
                onClick={closeAll}
                className="
                  rounded-xl px-3.5 py-2.5
                  text-sm font-semibold
                  text-gray-600
                  transition-all
                  hover:bg-rose-50
                  hover:text-rose-600
                "
              >
                Home
              </Link>

              {/* BLOG */}
              <button
                type="button"
                onClick={() => goToSection('blog')}
                className="
                  rounded-xl px-3.5 py-2.5
                  text-sm font-semibold
                  text-gray-600
                  transition-all
                  hover:bg-rose-50
                  hover:text-rose-600
                "
              >
                Blog
              </button>

              {/* LOVE CALCULATOR */}
              <button
                type="button"
                onClick={() => goToSection('calculator')}
                className="
                  flex items-center gap-1.5
                  rounded-xl px-3.5 py-2.5
                  text-sm font-semibold
                  text-gray-600
                  transition-all
                  hover:bg-rose-50
                  hover:text-rose-600
                "
              >
                <Calculator className="h-4 w-4" />
                Love Calculator
              </button>

              {/* =================================================
                  CATEGORIES
              ================================================== */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setCategoriesOpen((value) => !value);
                    setToolsOpen(false);
                  }}
                  aria-expanded={categoriesOpen}
                  className={`
                    flex items-center gap-1.5
                    rounded-xl px-3.5 py-2.5
                    text-sm font-semibold
                    transition-all
                    ${
                      categoriesOpen
                        ? 'bg-rose-50 text-rose-600'
                        : 'text-gray-600 hover:bg-rose-50 hover:text-rose-600'
                    }
                  `}
                >
                  Categories

                  <ChevronDown
                    className={`
                      h-4 w-4 transition-transform
                      ${categoriesOpen ? 'rotate-180' : ''}
                    `}
                  />
                </button>

                {categoriesOpen && (
                  <div
                    className="
                      absolute right-0 top-full mt-3
                      z-[120]
                      w-[280px]
                      overflow-hidden
                      rounded-2xl
                      border border-rose-100
                      bg-white
                      p-2
                      shadow-[0_20px_60px_rgba(244,63,94,0.16)]
                    "
                  >
                    <div className="px-3 pb-2 pt-2">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-rose-500">
                        Blog Categories
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Explore relationship topics
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={selectAllCategories}
                      className="
                        w-full rounded-xl
                        px-3 py-2.5
                        text-left text-sm font-semibold
                        text-gray-700
                        hover:bg-rose-50
                        hover:text-rose-600
                      "
                    >
                      All Articles
                    </button>

                    <div className="my-1 h-px bg-rose-50" />

                    <div className="max-h-[340px] overflow-y-auto">
                      {CATEGORIES.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => selectCategory(category)}
                          className="
                            flex w-full items-center
                            rounded-xl px-3 py-2.5
                            text-left text-sm
                            text-gray-600
                            hover:bg-rose-50
                            hover:text-rose-600
                          "
                        >
                          <span className="mr-2 h-1.5 w-1.5 rounded-full bg-rose-300" />
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* =================================================
                  TOOLS
              ================================================== */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setToolsOpen((value) => !value);
                    setCategoriesOpen(false);
                  }}
                  aria-expanded={toolsOpen}
                  className={`
                    flex items-center gap-1.5
                    rounded-xl px-3.5 py-2.5
                    text-sm font-semibold
                    transition-all
                    ${
                      toolsOpen
                        ? 'bg-rose-50 text-rose-600'
                        : 'text-gray-600 hover:bg-rose-50 hover:text-rose-600'
                    }
                  `}
                >
                  Tools

                  <ChevronDown
                    className={`
                      h-4 w-4 transition-transform
                      ${toolsOpen ? 'rotate-180' : ''}
                    `}
                  />
                </button>

                {toolsOpen && (
                  <div
                    className="
                      absolute right-0 top-full mt-3
                      z-[120]
                      w-[280px]
                      rounded-2xl
                      border border-rose-100
                      bg-white
                      p-2
                      shadow-[0_20px_60px_rgba(244,63,94,0.16)]
                    "
                  >
                    <div className="px-3 pb-2 pt-2">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-rose-500">
                        Love Tools
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Helpful relationship tools
                      </p>
                    </div>

                    {TOOLS.map((tool) => {
                      const Icon = tool.icon;

                      return (
                        <button
                          key={tool.label}
                          type="button"
                          onClick={() => {
                            if (tool.to.includes('#calculator')) {
                              goToSection('calculator');
                            }
                          }}
                          className="
                            flex w-full items-center gap-3
                            rounded-xl px-3 py-3
                            text-left text-sm
                            text-gray-600
                            hover:bg-rose-50
                            hover:text-rose-600
                          "
                        >
                          <span
                            className="
                              flex h-8 w-8
                              items-center justify-center
                              rounded-lg
                              bg-rose-50
                              text-rose-500
                            "
                          >
                            <Icon className="h-4 w-4" />
                          </span>

                          <span className="font-medium">
                            {tool.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ABOUT */}
              <Link
                to="/about"
                onClick={closeAll}
                className="
                  flex items-center gap-1.5
                  rounded-xl px-3.5 py-2.5
                  text-sm font-semibold
                  text-gray-600
                  hover:bg-rose-50
                  hover:text-rose-600
                "
              >
                <Info className="h-4 w-4" />
                About Us
              </Link>
            </nav>

            {/* =================================================
                SEARCH
            ================================================== */}
            <div className="relative ml-1 sm:ml-2">
              <button
                type="button"
                onClick={() => {
                  setSearchOpen((value) => !value);
                  setMenuOpen(false);
                  setCategoriesOpen(false);
                  setToolsOpen(false);
                }}
                aria-label="Search"
                className="
                  flex h-10 w-10
                  items-center justify-center
                  rounded-xl
                  text-gray-600
                  transition-all
                  hover:bg-rose-50
                  hover:text-rose-600
                "
              >
                {searchOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </button>

              {searchOpen && (
                <form
                  onSubmit={submitSearch}
                  className="
                    absolute right-0 top-[52px]
                    z-[130]
                    flex w-[280px]
                    items-center
                    rounded-2xl
                    border border-rose-100
                    bg-white
                    p-1
                    shadow-[0_20px_60px_rgba(244,63,94,0.18)]
                    sm:w-[340px]
                  "
                >
                  <Search className="ml-3 h-4 w-4 shrink-0 text-gray-400" />

                  <input
                    ref={searchRef}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search Loveons..."
                    className="
                      min-w-0 flex-1
                      border-0
                      bg-transparent
                      px-2.5 py-3
                      text-sm
                      text-gray-700
                      outline-none
                    "
                  />

                  <button
                    type="submit"
                    className="
                      mr-1 rounded-xl
                      bg-rose-500
                      px-3 py-2
                      text-xs font-semibold
                      text-white
                      hover:bg-rose-600
                    "
                  >
                    Search
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          MOBILE OVERLAY
      ====================================================== */}
      {menuOpen && (
        <div
          className="
            fixed inset-0 z-[90]
            bg-black/20
            backdrop-blur-[2px]
            lg:hidden
          "
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* =====================================================
          MOBILE DRAWER
      ====================================================== */}
      <aside
        className={`
          fixed left-0 top-0 z-[110]
          h-full w-[310px] max-w-[88vw]
          border-r border-rose-100
          bg-white
          shadow-[15px_0_50px_rgba(244,63,94,0.14)]
          transition-transform duration-300
          lg:hidden
          ${menuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-hidden={!menuOpen}
      >
        <div className="flex h-full flex-col">
          {/* DRAWER HEADER */}
          <div
            className="
              flex h-[76px]
              items-center
              justify-between
              border-b border-rose-100
              px-4
            "
          >
            <Link
              to="/"
              onClick={closeAll}
              className="flex items-center gap-2"
            >
              <Logo className="h-10 w-10" />

              <span className="text-lg font-extrabold text-rose-600">
                Loveons.com
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-xl
                text-gray-500
                hover:bg-rose-50
                hover:text-rose-600
              "
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* DRAWER CONTENT */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {/* HOME */}
              <Link
                to="/"
                onClick={closeAll}
                className="
                  block rounded-xl
                  px-4 py-3
                  text-sm font-semibold
                  text-gray-600
                  hover:bg-rose-50
                  hover:text-rose-600
                "
              >
                Home
              </Link>

              {/* BLOG */}
              <button
                type="button"
                onClick={() => goToSection('blog')}
                className="
                  block w-full
                  rounded-xl
                  px-4 py-3
                  text-left
                  text-sm font-semibold
                  text-gray-600
                  hover:bg-rose-50
                  hover:text-rose-600
                "
              >
                Blog
              </button>

              {/* CALCULATOR */}
              <button
                type="button"
                onClick={() => goToSection('calculator')}
                className="
                  flex w-full items-center gap-3
                  rounded-xl
                  px-4 py-3
                  text-left
                  text-sm font-semibold
                  text-gray-600
                  hover:bg-rose-50
                  hover:text-rose-600
                "
              >
                <Calculator className="h-4 w-4" />
                Love Calculator
              </button>

              {/* CATEGORIES */}
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setCategoriesOpen((value) => !value)
                  }
                  className="
                    flex w-full items-center
                    justify-between
                    rounded-xl
                    px-4 py-3
                    text-sm font-semibold
                    text-gray-600
                    hover:bg-rose-50
                    hover:text-rose-600
                  "
                >
                  Categories

                  <ChevronDown
                    className={`
                      h-4 w-4 transition-transform
                      ${categoriesOpen ? 'rotate-180' : ''}
                    `}
                  />
                </button>

                {categoriesOpen && (
                  <div
                    className="
                      ml-4
                      max-h-[300px]
                      overflow-y-auto
                      border-l-2
                      border-rose-100
                      pl-3
                    "
                  >
                    <button
                      type="button"
                      onClick={selectAllCategories}
                      className="
                        block w-full rounded-lg
                        px-3 py-2
                        text-left text-sm
                        font-semibold
                        text-gray-600
                        hover:bg-rose-50
                        hover:text-rose-600
                      "
                    >
                      All Articles
                    </button>

                    {CATEGORIES.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => selectCategory(category)}
                        className="
                          block w-full rounded-lg
                          px-3 py-2
                          text-left text-sm
                          text-gray-500
                          hover:bg-rose-50
                          hover:text-rose-600
                        "
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* TOOLS */}
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setToolsOpen((value) => !value)
                  }
                  className="
                    flex w-full items-center
                    justify-between
                    rounded-xl
                    px-4 py-3
                    text-sm font-semibold
                    text-gray-600
                    hover:bg-rose-50
                    hover:text-rose-600
                  "
                >
                  Tools

                  <ChevronDown
                    className={`
                      h-4 w-4 transition-transform
                      ${toolsOpen ? 'rotate-180' : ''}
                    `}
                  />
                </button>

                {toolsOpen && (
                  <div
                    className="
                      ml-4
                      border-l-2
                      border-rose-100
                      pl-3
                    "
                  >
                    {TOOLS.map((tool) => {
                      const Icon = tool.icon;

                      return (
                        <button
                          key={tool.label}
                          type="button"
                          onClick={() => goToSection('calculator')}
                          className="
                            flex w-full items-center gap-3
                            rounded-lg
                            px-3 py-2.5
                            text-left text-sm
                            text-gray-500
                            hover:bg-rose-50
                            hover:text-rose-600
                          "
                        >
                          <Icon className="h-4 w-4" />
                          {tool.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ABOUT */}
              <Link
                to="/about"
                onClick={closeAll}
                className="
                  flex items-center gap-3
                  rounded-xl
                  px-4 py-3
                  text-sm font-semibold
                  text-gray-600
                  hover:bg-rose-50
                  hover:text-rose-600
                "
              >
                <Info className="h-4 w-4" />
                About Us
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}



  




