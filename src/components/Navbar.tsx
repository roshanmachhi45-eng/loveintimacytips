
import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  Heart,
  Menu,
  Search,
  X,
  Calculator,
  Sparkles,
  Video,
  Wrench,
  Info,
} from 'lucide-react';
import { NavLink, Link, useLocation } from 'react-router-dom';

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

const NAV_ITEMS = [
  {
    label: 'Home',
    to: '/',
  },
  {
    label: 'Blog',
    to: '/blog',
  },
  {
    label: 'Love Calculator',
    to: '/love-calculator',
    icon: Calculator,
  },
  {
    label: 'Love Quiz',
    to: '/love-quiz',
    icon: Sparkles,
  },
  {
    label: 'Videos',
    to: '/videos',
    icon: Video,
  },
];

const TOOL_ITEMS = [
  {
    label: 'Love Calculator',
    to: '/love-calculator',
    icon: Calculator,
  },
  {
    label: 'Love Quiz',
    to: '/love-quiz',
    icon: Sparkles,
  },
  {
    label: 'Compatibility Test',
    to: '/compatibility-test',
    icon: Heart,
  },
  {
    label: 'Anniversary Calculator',
    to: '/anniversary-calculator',
    icon: Calculator,
  },
  {
    label: 'Date Ideas Generator',
    to: '/date-ideas',
    icon: Sparkles,
  },
];

function getNavLinkClass(isActive: boolean) {
  return [
    'relative flex items-center gap-1.5 rounded-xl px-3.5 py-2.5',
    'text-sm font-semibold transition-all duration-200',
    isActive
      ? 'bg-rose-50 text-rose-600 shadow-sm'
      : 'text-gray-600 hover:bg-rose-50/70 hover:text-rose-600',
  ].join(' ');
}

export default function Navbar() {
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const searchRef = useRef<HTMLInputElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  /*
   * Close menus whenever route changes.
   */
  useEffect(() => {
    setMenuOpen(false);
    setCategoriesOpen(false);
    setToolsOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  /*
   * Focus search automatically.
   */
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => {
        searchRef.current?.focus();
      }, 50);
    }
  }, [searchOpen]);

  /*
   * Close dropdowns when clicking outside.
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
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  /*
   * Prevent body scrolling while mobile menu is open.
   */
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  /*
   * Select a blog category.
   * BlogSection already listens to this event.
   */
  function selectCategory(category: string) {
    window.dispatchEvent(
      new CustomEvent<string>(CATEGORY_EVENT, {
        detail: category,
      })
    );

    setCategoriesOpen(false);
    setMenuOpen(false);

    /*
     * If the Blog section exists on the current page,
     * scroll to it.
     */
    requestAnimationFrame(() => {
      const blogSection = document.getElementById('blog');

      if (blogSection) {
        blogSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  }

  function selectAllCategories() {
    window.dispatchEvent(
      new CustomEvent<string>(CATEGORY_EVENT, {
        detail: '',
      })
    );

    setCategoriesOpen(false);
    setMenuOpen(false);

    requestAnimationFrame(() => {
      const blogSection = document.getElementById('blog');

      if (blogSection) {
        blogSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  }

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();

    const query = searchValue.trim();

    if (!query) {
      return;
    }

    /*
     * Search is intentionally kept URL based so the future
     * search page can use the same Navbar without changing it.
     */
    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  }

  function closeEverything() {
    setMenuOpen(false);
    setCategoriesOpen(false);
    setToolsOpen(false);
  }

  return (
    <>
      {/* =====================================================
          DESKTOP + MOBILE NAVBAR
      ====================================================== */}
      <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5">
        <div
          className="
            relative mx-auto max-w-7xl
            rounded-2xl
            border border-white/80
            bg-white/90
            shadow-[0_12px_40px_rgba(244,63,94,0.10)]
            backdrop-blur-xl
          "
        >
          <div
            className="
              flex h-[68px] items-center
              px-3 sm:px-5 lg:px-6
            "
          >
            {/* =================================================
                LEFT SIDE — HAMBURGER
            ================================================== */}
            <button
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((value) => !value)}
              className="
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
                LOGO
            ================================================== */}
            <Link
              to="/"
              aria-label="Loveons.com Home"
              onClick={closeEverything}
              className="
                flex shrink-0 items-center
                transition-transform duration-200
                hover:scale-[1.02]
              "
            >
              <Logo className="h-10 w-auto sm:h-11" />
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
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      getNavLinkClass(isActive)
                    }
                  >
                    {Icon && (
                      <Icon className="h-4 w-4" />
                    )}

                    <span>{item.label}</span>
                  </NavLink>
                );
              })}

              {/* ===============================================
                  CATEGORIES
              ================================================ */}
              <div
                ref={categoriesRef}
                className="relative"
              >
                <button
                  type="button"
                  aria-expanded={categoriesOpen}
                  onClick={() => {
                    setCategoriesOpen((value) => !value);
                    setToolsOpen(false);
                  }}
                  className={`
                    flex items-center gap-1.5
                    rounded-xl px-3.5 py-2.5
                    text-sm font-semibold
                    transition-all duration-200
                    ${
                      categoriesOpen
                        ? 'bg-rose-50 text-rose-600 shadow-sm'
                        : 'text-gray-600 hover:bg-rose-50/70 hover:text-rose-600'
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
                      w-[270px]
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
                          <span className="mr-2 h-1.5 w-1.5 rounded-full bg-rose-300" />
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ===============================================
                  TOOLS
              ================================================ */}
              <div
                ref={toolsRef}
                className="relative"
              >
                <button
                  type="button"
                  aria-expanded={toolsOpen}
                  onClick={() => {
                    setToolsOpen((value) => !value);
                    setCategoriesOpen(false);
                  }}
                  className={`
                    flex items-center gap-1.5
                    rounded-xl px-3.5 py-2.5
                    text-sm font-semibold
                    transition-all duration-200
                    ${
                      toolsOpen
                        ? 'bg-rose-50 text-rose-600 shadow-sm'
                        : 'text-gray-600 hover:bg-rose-50/70 hover:text-rose-600'
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
                      w-[270px]
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
                        Helpful tools for better relationships
                      </p>
                    </div>

                    {TOOL_ITEMS.map((tool) => {
                      const Icon = tool.icon;

                      return (
                        <NavLink
                          key={tool.label}
                          to={tool.to}
                          onClick={() => setToolsOpen(false)}
                          className="
                            flex items-center gap-3
                            rounded-xl px-3 py-3
                            text-sm text-gray-600
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
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ABOUT */}
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  getNavLinkClass(isActive)
                }
              >
                <Info className="h-4 w-4" />
                About Us
              </NavLink>
            </nav>

            {/* =================================================
                SEARCH
            ================================================== */}
            <div className="ml-2 flex items-center sm:ml-3">
              {searchOpen ? (
                <form
                  onSubmit={submitSearch}
                  className="
                    flex items-center
                    overflow-hidden
                    rounded-xl
                    border border-rose-100
                    bg-white
                  "
                >
                  <Search className="ml-3 h-4 w-4 text-gray-400" />

                  <input
                    ref={searchRef}
                    value={searchValue}
                    onChange={(event) =>
                      setSearchValue(event.target.value)
                    }
                    placeholder="Search..."
                    aria-label="Search"
                    className="
                      w-[130px]
                      border-0
                      bg-transparent
                      px-2.5 py-2.5
                      text-sm
                      text-gray-700
                      outline-none
                      placeholder:text-gray-400
                      sm:w-[190px]
                    "
                  />

                  <button
                    type="button"
                    aria-label="Close search"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchValue('');
                    }}
                    className="
                      mr-1 flex h-8 w-8
                      items-center justify-center
                      rounded-lg
                      text-gray-400
                      hover:bg-rose-50
                      hover:text-rose-600
                    "
                  >
                    <X className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  aria-label="Open search"
                  onClick={() => setSearchOpen(true)}
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
                  <Search className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* =================================================
              MOBILE MENU
          ================================================== */}
          {menuOpen && (
            <div
              className="
                border-t border-rose-100
                px-3 pb-4 pt-3
                lg:hidden
              "
            >
              <div className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.label}
                      to={item.to}
                      end={item.to === '/'}
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) => `
                        flex items-center gap-3
                        rounded-xl px-4 py-3
                        text-sm font-semibold
                        ${
                          isActive
                            ? 'bg-rose-50 text-rose-600'
                            : 'text-gray-600 hover:bg-rose-50 hover:text-rose-600'
                        }
                      `}
                    >
                      {Icon ? (
                        <Icon className="h-4 w-4" />
                      ) : (
                        <span className="h-4 w-4" />
                      )}

                      {item.label}
                    </NavLink>
                  );
                })}

                {/* MOBILE CATEGORIES */}
                <div className="rounded-xl">
                  <button
                    type="button"
                    onClick={() =>
                      setCategoriesOpen(
                        (value) => !value
                      )
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
                    <span>Categories</span>

                    <ChevronDown
                      className={`
                        h-4 w-4 transition-transform
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
                        border-l-2 border-rose-100
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
                          font-medium
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

                {/* MOBILE TOOLS */}
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setToolsOpen(
                        (value) => !value
                      )
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
                    <span>Tools</span>

                    <ChevronDown
                      className={`
                        h-4 w-4 transition-transform
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
                        border-l-2 border-rose-100
                        pl-3
                      "
                    >
                      {TOOL_ITEMS.map((tool) => {
                        const Icon = tool.icon;

                        return (
                          <NavLink
                            key={tool.label}
                            to={tool.to}
                            onClick={() =>
                              setMenuOpen(false)
                            }
                            className="
                              flex items-center gap-3
                              rounded-lg
                              px-3 py-2.5
                              text-sm
                              text-gray-500
                              hover:bg-rose-50
                              hover:text-rose-600
                            "
                          >
                            <Icon className="h-4 w-4" />
                            {tool.label}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ABOUT */}
                <NavLink
                  to="/about"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3
                    rounded-xl px-4 py-3
                    text-sm font-semibold
                    ${
                      isActive
                        ? 'bg-rose-50 text-rose-600'
                        : 'text-gray-600 hover:bg-rose-50 hover:text-rose-600'
                    }
                  `}
                >
                  <Info className="h-4 w-4" />
                  About Us
                </NavLink>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}

  




