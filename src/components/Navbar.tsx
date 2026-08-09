
import { useEffect, useRef, useState } from 'react';

import {
  CalendarDays,
  Calculator,
  ChevronDown,
  Gift,
  Heart,
  Info,
  Menu,
  Search,
  X,
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
    icon: Calculator,
  },
  {
    label: 'Compatibility Test',
    icon: Heart,
  },
  {
    label: 'Anniversary Calculator',
    icon: CalendarDays,
  },
  {
    label: 'Date Ideas Generator',
    icon: Gift,
  },
];

function navClass(active = false) {
  return `
    flex items-center gap-1.5
    rounded-xl px-3.5 py-2.5
    text-sm font-semibold
    transition-all duration-200
    ${
      active
        ? 'bg-rose-50 text-rose-600'
        : 'text-gray-600 hover:bg-rose-50 hover:text-rose-600'
    }
  `;
}

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const searchRef = useRef<HTMLInputElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  /*
   * Close menus after route changes.
   */
  useEffect(() => {
    setMenuOpen(false);
    setCategoriesOpen(false);
    setToolsOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  /*
   * Prevent page scrolling while the hamburger drawer is open.
   */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  /*
   * Focus search input when search opens.
   */
  useEffect(() => {
    if (!searchOpen) return;

    const timer = window.setTimeout(() => {
      searchRef.current?.focus();
    }, 50);

    return () => window.clearTimeout(timer);
  }, [searchOpen]);

  /*
   * Close desktop dropdowns when clicking outside.
   */
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;

      if (
        categoriesRef.current &&
        !categoriesRef.current.contains(target)
      ) {
        setCategoriesOpen(false);
      }

      if (
        toolsRef.current &&
        !toolsRef.current.contains(target)
      ) {
        setToolsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      );
    };
  }, []);

  /*
   * Close everything.
   */
  function closeEverything() {
    setMenuOpen(false);
    setCategoriesOpen(false);
    setToolsOpen(false);
    setSearchOpen(false);
  }

  /*
   * Open / close hamburger drawer.
   */
  function toggleMenu() {
    setMenuOpen((current) => !current);
    setCategoriesOpen(false);
    setToolsOpen(false);
    setSearchOpen(false);
  }

  /*
   * Go to an existing section on Home.
   */
  function goToSection(id: string) {
    closeEverything();

    if (location.pathname !== '/') {
      navigate('/');

      window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 300);

      return;
    }

    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 50);
  }

  /*
   * Select blog category.
   */
  function selectCategory(category: string) {
    setCategoriesOpen(false);
    setToolsOpen(false);
    setMenuOpen(false);

    if (location.pathname !== '/') {
      navigate('/');

      window.setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent<string>(CATEGORY_EVENT, {
            detail: category,
          })
        );

        document.getElementById('blog')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 300);

      return;
    }

    window.dispatchEvent(
      new CustomEvent<string>(CATEGORY_EVENT, {
        detail: category,
      })
    );

    window.setTimeout(() => {
      document.getElementById('blog')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 50);
  }

  /*
   * Show all blog articles.
   */
  function selectAllCategories() {
    selectCategory('');
  }

  /*
   * Search UI.
   *
   * Actual search-results page can be connected later
   * without changing the navbar design.
   */
  function submitSearch(event: React.FormEvent) {
    event.preventDefault();

    const query = searchValue.trim();

    if (!query) return;

    setSearchOpen(false);

    /*
     * Keep the query available for the future search system.
     */
    window.dispatchEvent(
      new CustomEvent<string>('loveons:search', {
        detail: query,
      })
    );
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
              aria-label={
                menuOpen ? 'Close navigation menu' : 'Open navigation menu'
              }
              aria-expanded={menuOpen}
              className="
                relative z-[120]
                mr-2 flex h-10 w-10 shrink-0
                items-center justify-center
                rounded-xl
                text-gray-600
                transition-all duration-200
                hover:bg-rose-50
                hover:text-rose-600
                focus:outline-none
                focus:ring-2
                focus:ring-rose-200
                sm:mr-3
              "
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            {/* =================================================
                LOGO + NAME
            ================================================== */}
            <Link
              to="/"
              onClick={closeEverything}
              aria-label="Loveons.com Home"
              className="
                flex shrink-0 items-center gap-2
                transition-transform duration-200
                hover:scale-[1.02]
              "
            >
              <Logo className="h-10 w-10 sm:h-11 sm:w-11" />

              <span
                className="
                  whitespace-nowrap
                  text-[20px]
                  font-extrabold
                  tracking-[-0.03em]
                  text-rose-600
                  sm:text-[22px]
                "
              >
                Loveons.com
              </span>
            </Link>

            {/* =================================================
                DESKTOP NAVIGATION
            ================================================== */}
            <nav
              aria-label="Main navigation"
              className="
                ml-auto hidden
                items-center gap-1
                lg:flex
              "
            >
              {/* HOME */}
              <Link
                to="/"
                onClick={closeEverything}
                className={navClass(
                  location.pathname === '/'
                )}
              >
                Home
              </Link>

              {/* BLOG */}
              <button
                type="button"
                onClick={() => goToSection('blog')}
                className={navClass(
                  location.hash === '#blog'
                )}
              >
                Blog
              </button>

              {/* LOVE CALCULATOR */}
              <button
                type="button"
                onClick={() => goToSection('calculator')}
                className={navClass(
                  location.hash === '#calculator'
                )}
              >
                <Calculator className="h-4 w-4" />
                Love Calculator
              </button>

              {/* =================================================
                  CATEGORIES
              ================================================== */}
              <div
                ref={categoriesRef}
                className="relative"
              >
                <button
                  type="button"
                  aria-expanded={categoriesOpen}
                  onClick={() => {
                    setCategoriesOpen(
                      (current) => !current
                    );
                    setToolsOpen(false);
                    setSearchOpen(false);
                  }}
                  className={`
                    flex items-center gap-1.5
                    rounded-xl px-3.5 py-2.5
                    text-sm font-semibold
                    transition-all duration-200
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
                      h-4 w-4 transition-transform duration-200
                      ${
                        categoriesOpen
                          ? 'rotate-180'
                          : ''
                      }
                    `}
                  />
                </button>

                {categoriesOpen && (
                  <div
                    className="
                      absolute right-0 top-full mt-3
                      z-[130]
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
                      <p
                        className="
                          text-xs font-bold uppercase
                          tracking-[0.14em]
                          text-rose-500
                        "
                      >
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
                        flex w-full items-center
                        rounded-xl px-3 py-2.5
                        text-left text-sm font-semibold
                        text-gray-700
                        transition-colors
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
                          onClick={() =>
                            selectCategory(category)
                          }
                          className="
                            flex w-full items-center
                            rounded-xl px-3 py-2.5
                            text-left text-sm
                            text-gray-600
                            transition-colors
                            hover:bg-rose-50
                            hover:text-rose-600
                          "
                        >
                          <span
                            className="
                              mr-2 h-1.5 w-1.5
                              rounded-full
                              bg-rose-300
                            "
                          />

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
              <div
                ref={toolsRef}
                className="relative"
              >
                <button
                  type="button"
                  aria-expanded={toolsOpen}
                  onClick={() => {
                    setToolsOpen(
                      (current) => !current
                    );
                    setCategoriesOpen(false);
                    setSearchOpen(false);
                  }}
                  className={`
                    flex items-center gap-1.5
                    rounded-xl px-3.5 py-2.5
                    text-sm font-semibold
                    transition-all duration-200
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
                      h-4 w-4 transition-transform duration-200
                      ${
                        toolsOpen
                          ? 'rotate-180'
                          : ''
                      }
                    `}
                  />
                </button>

                {toolsOpen && (
                  <div
                    className="
                      absolute right-0 top-full mt-3
                      z-[130]
                      w-[280px]
                      rounded-2xl
                      border border-rose-100
                      bg-white
                      p-2
                      shadow-[0_20px_60px_rgba(244,63,94,0.16)]
                    "
                  >
                    <div className="px-3 pb-2 pt-2">
                      <p
                        className="
                          text-xs font-bold uppercase
                          tracking-[0.14em]
                          text-rose-500
                        "
                      >
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
                          onClick={() =>
                            goToSection('calculator')
                          }
                          className="
                            flex w-full items-center gap-3
                            rounded-xl px-3 py-3
                            text-left text-sm
                            text-gray-600
                            transition-colors
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
                onClick={closeEverything}
                className={navClass(
                  location.pathname === '/about'
                )}
              >
                <Info className="h-4 w-4" />
                About Us
              </Link>
            </nav>

            {/* =================================================
                SEARCH
            ================================================== */}
            <div className="relative z-[130] ml-1 sm:ml-2">
              <button
                type="button"
                aria-label={
                  searchOpen
                    ? 'Close search'
                    : 'Open search'
                }
                aria-expanded={searchOpen}
                onClick={() => {
                  setSearchOpen(
                    (current) => !current
                  );
                  setMenuOpen(false);
                  setCategoriesOpen(false);
                  setToolsOpen(false);
                }}
                className="
                  flex h-10 w-10
                  items-center justify-center
                  rounded-xl
                  text-gray-600
                  transition-all duration-200
                  hover:bg-rose-50
                  hover:text-rose-600
                  focus:outline-none
                  focus:ring-2
                  focus:ring-rose-200
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
                    z-[140]
                    flex w-[280px]
                    items-center
                    overflow-hidden
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
                    onChange={(event) =>
                      setSearchValue(
                        event.target.value
                      )
                    }
                    placeholder="Search Loveons..."
                    aria-label="Search Loveons"
                    className="
                      min-w-0 flex-1
                      border-0
                      bg-transparent
                      px-2.5 py-3
                      text-sm
                      text-gray-700
                      outline-none
                      placeholder:text-gray-400
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
                      transition-colors
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
          DRAWER BACKDROP
          IMPORTANT:
          NO lg:hidden HERE
          So hamburger works on desktop AND mobile.
      ====================================================== */}
      {menuOpen && (
        <div
          className="
            fixed inset-0
            z-[105]
            bg-black/20
            backdrop-blur-[2px]
          "
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* =====================================================
          FUTURISTIC LEFT DRAWER
          IMPORTANT:
          NO lg:hidden HERE
      ====================================================== */}
      <aside
        aria-label="Navigation menu"
        aria-hidden={!menuOpen}
        className={`
          fixed left-0 top-0
          z-[115]
          h-screen
          w-[310px]
          max-w-[88vw]
          border-r border-rose-100
          bg-white
          shadow-[15px_0_50px_rgba(244,63,94,0.14)]
          transition-transform
          duration-300
          ease-out
          ${
            menuOpen
              ? 'translate-x-0'
              : '-translate-x-full'
          }
        `}
      >
        <div className="flex h-full flex-col">
          {/* DRAWER HEADER */}
          <div
            className="
              flex h-[76px]
              shrink-0
              items-center
              justify-between
              border-b border-rose-100
              px-4
            "
          >
            <Link
              to="/"
              onClick={closeEverything}
              className="flex items-center gap-2"
            >
              <Logo className="h-10 w-10" />

              <span
                className="
                  text-lg
                  font-extrabold
                  tracking-[-0.03em]
                  text-rose-600
                "
              >
                Loveons.com
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-xl
                text-gray-500
                transition-colors
                hover:bg-rose-50
                hover:text-rose-600
              "
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
                onClick={closeEverything}
                className={`
                  block rounded-xl
                  px-4 py-3
                  text-sm font-semibold
                  ${
                    location.pathname === '/'
                      ? 'bg-rose-50 text-rose-600'
                      : 'text-gray-600 hover:bg-rose-50 hover:text-rose-600'
                  }
                `}
              >
                Home
              </Link>

              {/* BLOG */}
              <button
                type="button"
                onClick={() =>
                  goToSection('blog')
                }
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

              {/* LOVE CALCULATOR */}
              <button
                type="button"
                onClick={() =>
                  goToSection('calculator')
                }
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

              {/* =================================================
                  MOBILE CATEGORIES
              ================================================== */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setCategoriesOpen(
                      (current) => !current
                    );
                    setToolsOpen(false);
                  }}
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
                  <span>Categories</span>

                  <ChevronDown
                    className={`
                      h-4 w-4
                      transition-transform
                      ${
                        categoriesOpen
                          ? 'rotate-180'
                          : ''
                      }
                    `}
                  />
                </button>

                {categoriesOpen && (
                  <div
                    className="
                      ml-3 mt-1
                      max-h-[320px]
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
                        onClick={() =>
                          selectCategory(category)
                        }
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

              {/* =================================================
                  MOBILE TOOLS
              ================================================== */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setToolsOpen(
                      (current) => !current
                    );
                    setCategoriesOpen(false);
                  }}
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
                  <span>Tools</span>

                  <ChevronDown
                    className={`
                      h-4 w-4
                      transition-transform
                      ${
                        toolsOpen
                          ? 'rotate-180'
                          : ''
                      }
                    `}
                  />
                </button>

                {toolsOpen && (
                  <div
                    className="
                      ml-3 mt-1
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
                          onClick={() =>
                            goToSection(
                              'calculator'
                            )
                          }
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
                onClick={closeEverything}
                className={`
                  flex items-center gap-3
                  rounded-xl
                  px-4 py-3
                  text-sm font-semibold
                  ${
                    location.pathname === '/about'
                      ? 'bg-rose-50 text-rose-600'
                      : 'text-gray-600 hover:bg-rose-50 hover:text-rose-600'
                  }
                `}
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




  




