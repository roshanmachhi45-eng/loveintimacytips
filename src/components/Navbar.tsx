import { useEffect, useRef, useState } from 'react';
import {
  Calculator,
  ChevronDown,
  Info,
  Menu,
  Search,
  LogOut,
  User as UserIcon,
  Sparkles,
  X,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';

import { auth, signInWithGoogle, logoutUser } from '../firebase';
import { onAuthStateChanged, User, getRedirectResult } from 'firebase/auth';
import type { SignInResult } from '../lib/firebase';
const CATEGORIES = [
    'Off-App Dating',
  ];

const TOOLS = [
  {
    id: 'love-calculator',
    label: 'Love Calculator',
    icon: Calculator,
  },
  {
    id: 'cosmic-love-tarot',
    label: 'Cosmic Love Tarot',
    icon: Sparkles,
  },
];
export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
          setAuthError(null);
        }
      })
      .catch((error) => {
        console.error('Redirect Login Error:', error);
        setAuthError(error?.message || 'Google sign-in failed');
      })
      .finally(() => {
        setAuthLoading(false);
      });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setAuthLoading(false);
        setAuthError(null);
      }
    });
    return () => unsubscribe();
  }, []);
           
  // Desktop and mobile categories use separate states.
  const [
    desktopCategoriesOpen,
    setDesktopCategoriesOpen,
  ] = useState(false);

  const [
    mobileCategoriesOpen,
    setMobileCategoriesOpen,
  ] = useState(false);

  // IMPORTANT:
  // Desktop and mobile tools use separate states.
  const [
    desktopToolsOpen,
    setDesktopToolsOpen,
  ] = useState(false);

  const [
    mobileToolsOpen,
    setMobileToolsOpen,
  ] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const searchRef = useRef<HTMLInputElement>(null);

  const categoriesRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  /* ---------------------------------------------
     CLOSE MENUS WHEN ROUTE CHANGES
  --------------------------------------------- */
  useEffect(() => {
    setMenuOpen(false);
    setDesktopCategoriesOpen(false);
    setMobileCategoriesOpen(false);
    setDesktopToolsOpen(false);
    setMobileToolsOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  /* ---------------------------------------------
     BODY SCROLL LOCK FOR MOBILE MENU
  --------------------------------------------- */
  useEffect(() => {
    document.body.style.overflow = menuOpen
      ? 'hidden'
      : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  /* ---------------------------------------------
     SEARCH AUTO FOCUS
  --------------------------------------------- */
  useEffect(() => {
    if (!searchOpen) return;

    const timer = window.setTimeout(() => {
      searchRef.current?.focus();
    }, 50);

    return () => window.clearTimeout(timer);
  }, [searchOpen]);

  /* ---------------------------------------------
     CLOSE DESKTOP DROPDOWNS ON OUTSIDE CLICK
  --------------------------------------------- */
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        categoriesRef.current &&
        !categoriesRef.current.contains(target)
      ) {
        setDesktopCategoriesOpen(false);
      }

      if (
        toolsRef.current &&
        !toolsRef.current.contains(target)
      ) {
        setDesktopToolsOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      );
    };
  }, []);

  /* ---------------------------------------------
     HANDLE LOGIN
  --------------------------------------------- */
  const handleLogin = async () => {
    if (authLoading) return;
    setAuthLoading(true);
    setAuthError(null);

    const result: SignInResult = await signInWithGoogle();

    if (!result.success) {
      setAuthLoading(false);
      setAuthError(result.error || 'Google sign-in failed');
    }
    // If success, the page will redirect to Google.
    // onAuthStateChanged will update user state when we return.
  };

  /* ---------------------------------------------
     CLOSE EVERYTHING
  --------------------------------------------- */
  const closeEverything = () => {
    setMenuOpen(false);
    setDesktopCategoriesOpen(false);
    setMobileCategoriesOpen(false);
    setDesktopToolsOpen(false);
    setMobileToolsOpen(false);
    setSearchOpen(false);
  };

  /* ---------------------------------------------
     HAMBURGER
  --------------------------------------------- */
  const toggleMenu = () => {
    setMenuOpen((current) => !current);

    // Opening hamburger must never open desktop dropdowns.
    setDesktopCategoriesOpen(false);
    setMobileCategoriesOpen(false);
    setDesktopToolsOpen(false);
    setMobileToolsOpen(false);
    setSearchOpen(false);
  };

  /* ---------------------------------------------
     NORMAL HOME SECTION
  --------------------------------------------- */
  const goToSection = (id: string) => {
    closeEverything();

    if (location.pathname !== '/') {
      navigate('/');

      window.setTimeout(() => {
        document
          .getElementById(id)
          ?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
      }, 350);

      return;
    }

    window.setTimeout(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
    }, 50);
  };

  /* ---------------------------------------------
     LOVE CALCULATOR

     Home.tsx listens for:
     loveons:open-calculator
  --------------------------------------------- */
  const openCalculator = () => {
    closeEverything();

    if (location.pathname !== '/') {
      navigate('/');

      window.setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent(
            'loveons:open-calculator'
          )
        );
      }, 400);

      return;
    }

    window.dispatchEvent(
      new CustomEvent(
        'loveons:open-calculator'
      )
    );
  };

  /* ---------------------------------------------
     COSMIC LOVE TAROT

     Home.tsx listens for:
     loveons:open-cosmic-tarot
  --------------------------------------------- */
  const openCosmicLoveTarot = () => {
    closeEverything();

    if (location.pathname !== '/') {
      navigate('/');

      window.setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent(
            'loveons:open-cosmic-tarot'
          )
        );
      }, 400);

      return;
    }

    window.dispatchEvent(
      new CustomEvent(
        'loveons:open-cosmic-tarot'
      )
    );
  };

  /* ---------------------------------------------
     OPEN TOOL
  --------------------------------------------- */
  const openTool = (toolId: string) => {
    if (toolId === 'love-calculator') {
      openCalculator();
      return;
    }

    if (toolId === 'cosmic-love-tarot') {
      openCosmicLoveTarot();
      return;
    }
  };

  /* ---------------------------------------------
     BLOG
  --------------------------------------------- */
  const openBlog = () => {
    closeEverything();
    navigate('/blog');
  };

  /* ---------------------------------------------
     CATEGORY
  --------------------------------------------- */
  const openCategory = (
    category: string
  ) => {
    closeEverything();

    navigate(
      `/blog?category=${encodeURIComponent(
        category
      )}`
    );
  };

  /* ---------------------------------------------
     ALL ARTICLES
  --------------------------------------------- */
  const openAllArticles = () => {
    closeEverything();
    navigate('/blog');
  };

      /* ---------------------------------------------
     SEARCH
  --------------------------------------------- */
  const submitSearch = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const query = searchValue.trim();
    if (!query) return;

    const lowerQuery = query.toLowerCase();

    // 1. प्राथमिक चेक: यदि यूजर टैरो कार्ड से जुड़ा कुछ भी सर्च करे (टैरो पहले चेक होगा)
    if (lowerQuery.includes('tarot') || lowerQuery.includes('cosmic') || lowerQuery.includes('card')) {
      openCosmicLoveTarot();
      setSearchValue('');
      
      return;
    }

    // 2. द्वितीयक चेक: यदि सिर्फ कैलकुलेटर या लव लिखा हो (लेकिन टैरो न हो)
    if (lowerQuery.includes('calc') || lowerQuery.includes('calculator') || lowerQuery === 'love' || lowerQuery.includes('love calculator')) {
      openCalculator();
      setSearchValue('');
      return;
    }

    // 3. ब्लॉग सर्च फिक्स: होमपेज पर जाने के बजाय इसे सीधे '/blog' पर भेजेंगे जहाँ फ़िल्टर काम करेगा
    closeEverything();
    navigate(
      `/blog?search=${encodeURIComponent(query)}`
    );
    setSearchValue('');
  };
return (
    <>
      {/* =================================================
          NAVBAR
      ================================================= */}

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
            {/* ===========================================
                HAMBURGER
            ============================================ */}

            <button
              type="button"
              onClick={toggleMenu}
              aria-label={
                menuOpen
                  ? 'Close navigation menu'
                  : 'Open navigation menu'
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

            {/* ===========================================
                LOGO
            ============================================ */}

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

            {/* ===========================================
                DESKTOP NAV
            ============================================ */}

            <nav
              aria-label="Main navigation"
              className="
                ml-auto hidden
                items-center gap-1
                lg:flex
              "
            >
              <div className="mr-2 hidden lg:block">
  {user ? (
    <div className="flex items-center gap-2 bg-rose-50/50 border border-rose-100 rounded-full pl-1.5 pr-3 py-1">
      {user.photoURL ? (
        <img src={user.photoURL} alt="Profile" className="h-6 w-6 rounded-full object-cover" />
      ) : (
        <div className="h-6 w-6 bg-rose-200 text-rose-700 flex items-center justify-center rounded-full text-xs font-bold">
          <UserIcon className="h-3.5 w-3.5" />
        </div>
      )}
      <span className="text-xs font-medium text-gray-700 max-w-[80px] truncate">
        {user.displayName || 'User'}
      </span>
      <button onClick={logoutUser} title="Logout" className="text-gray-400 hover:text-rose-600 ml-1 transition">
        <LogOut className="h-3.5 w-3.5" />
      </button>
    </div>
  ) : (
    <div className="flex flex-col items-end">
      <button
        onClick={handleLogin}
        disabled={authLoading}
        className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm hover:opacity-90 active:scale-95 transition disabled:opacity-60"
      >
        {authLoading ? 'Signing in...' : 'Login'}
      </button>
      {authError && (
        <p className="text-[10px] text-rose-500 mt-1 max-w-[120px] truncate" title={authError}>
          {authError}
        </p>
      )}
    </div>
  )}
</div>

              {/* HOME */}

              <Link
                to="/"
                onClick={closeEverything}
                className={`
                  flex items-center
                  rounded-xl px-3.5 py-2.5
                  text-sm font-semibold
                  transition-all duration-200
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
                onClick={openBlog}
                className={`
                  flex items-center
                  rounded-xl px-3.5 py-2.5
                  text-sm font-semibold
                  transition-all duration-200
                  ${
                    location.pathname.startsWith(
                      '/blog'
                    )
                      ? 'bg-rose-50 text-rose-600'
                      : 'text-gray-600 hover:bg-rose-50 hover:text-rose-600'
                  }
                `}
              >
                Blog
              </button>

              {/* LOVE CALCULATOR */}

              <button
                type="button"
                onClick={openCalculator}
                className="
                  flex items-center gap-1.5
                  rounded-xl px-3.5 py-2.5
                  text-sm font-semibold
                  text-gray-600
                  transition-all duration-200
                  hover:bg-rose-50
                  hover:text-rose-600
                "
              >
                <Calculator className="h-4 w-4" />
                Love Calculator
              </button>

              {/* =========================================
                  DESKTOP CATEGORIES
              ========================================== */}

              <div
                ref={categoriesRef}
                className="relative"
              >
                <button
                  type="button"
                  aria-expanded={
                    desktopCategoriesOpen
                  }
                  onClick={() => {
                    setDesktopCategoriesOpen(
                      (current) => !current
                    );

                    setMobileCategoriesOpen(false);
                    setDesktopToolsOpen(false);
                    setMobileToolsOpen(false);
                    setSearchOpen(false);
                  }}
                  className={`
                    flex items-center gap-1.5
                    rounded-xl px-3.5 py-2.5
                    text-sm font-semibold
                    transition-all duration-200
                    ${
                      desktopCategoriesOpen
                        ? 'bg-rose-50 text-rose-600'
                        : 'text-gray-600 hover:bg-rose-50 hover:text-rose-600'
                    }
                  `}
                >
                  Categories

                  <ChevronDown
                    className={`
                      h-4 w-4
                      transition-transform duration-200
                      ${
                        desktopCategoriesOpen
                          ? 'rotate-180'
                          : ''
                      }
                    `}
                  />
                </button>

                {desktopCategoriesOpen && (
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
                      onClick={openAllArticles}
                      className="
                        flex w-full
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
                      {CATEGORIES.map(
                        (category) => (
                          <button
                            key={category}
                            type="button"
                            onClick={() =>
                              openCategory(
                                category
                              )
                            }
                            className="
                              flex w-full
                              items-center
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
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* =========================================
                  DESKTOP TOOLS
              ========================================== */}

              <div
                ref={toolsRef}
                className="relative"
              >
                <button
                  type="button"
                  aria-expanded={
                    desktopToolsOpen
                  }
                  onClick={() => {
                    setDesktopToolsOpen(
                      (current) => !current
                    );

                    setDesktopCategoriesOpen(false);
                    setMobileCategoriesOpen(false);
                    setMobileToolsOpen(false);
                    setSearchOpen(false);
                  }}
                  className={`
                    flex items-center gap-1.5
                    rounded-xl px-3.5 py-2.5
                    text-sm font-semibold
                    transition-all duration-200
                    ${
                      desktopToolsOpen
                        ? 'bg-rose-50 text-rose-600'
                        : 'text-gray-600 hover:bg-rose-50 hover:text-rose-600'
                    }
                  `}
                >
                  Tools

                  <ChevronDown
                    className={`
                      h-4 w-4
                      transition-transform duration-200
                      ${
                        desktopToolsOpen
                          ? 'rotate-180'
                          : ''
                      }
                    `}
                  />
                </button>

                {desktopToolsOpen && (
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
                          key={tool.id}
                          type="button"
                          onClick={() =>
                            openTool(tool.id)
                          }
                          className="
                            flex w-full
                            items-center gap-3
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
                className={`
                  flex items-center gap-1.5
                  rounded-xl px-3.5 py-2.5
                  text-sm font-semibold
                  transition-all duration-200
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
            </nav>

            {/* ===========================================
                SEARCH
            ============================================ */}

            <div className="relative z-[130] ml-auto lg:ml-2 flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(
                    (current) => !current
                  );

                  setMenuOpen(false);
                  setDesktopCategoriesOpen(false);
                  setMobileCategoriesOpen(false);
                  setDesktopToolsOpen(false);
                  setMobileToolsOpen(false);
                }}
                aria-label={
                  searchOpen
                    ? 'Close search'
                    : 'Open search'
                }
                aria-expanded={searchOpen}
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
                      mr-1
                      rounded-xl
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
              <div className="lg:hidden flex items-center">
  {user ? (
    <div className="h-8 w-8 rounded-full overflow-hidden border border-rose-100 shrink-0">
      {user.photoURL ? (
        <img src={user.photoURL} alt="Profile" className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full bg-rose-200 text-rose-700 flex items-center justify-center text-xs font-bold">
          <UserIcon className="h-4 w-4" />
        </div>
      )}
    </div>
  ) : (   
<div className="flex flex-col items-end">
<button
  onClick={handleLogin}
  disabled={authLoading}
  className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm active:scale-95 transition whitespace-nowrap disabled:opacity-60"
>
  {authLoading ? '...' : 'Login'}
</button>
{authError && (
  <p className="text-[9px] text-rose-500 mt-0.5 max-w-[100px] truncate" title={authError}>
    {authError}
  </p>
)}
</div>
 )}
</div>

            </div>
          </div>
                                                    
        </div>        
      </header>

      {/* =================================================
          MOBILE BACKDROP
      ================================================= */}

      {menuOpen && (
        <div
          className="
            fixed inset-0
            z-[105]
            bg-black/20
            backdrop-blur-[2px]
          "
          onClick={() => {
            setMenuOpen(false);
            setMobileCategoriesOpen(false);
            setMobileToolsOpen(false);
          }}
          aria-hidden="true"
        />
      )}

      {/* =================================================
          MOBILE DRAWER
      ================================================= */}

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
              onClick={() => {
                setMenuOpen(false);
                setMobileCategoriesOpen(false);
                setMobileToolsOpen(false);
              }}
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
                onClick={openBlog}
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
                onClick={openCalculator}
                className="
                  flex w-full
                  items-center gap-3
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

              {/* =========================================
                  MOBILE CATEGORIES
              ========================================== */}

              <div>
                <button
                  type="button"
                  aria-expanded={
                    mobileCategoriesOpen
                  }
                  onClick={() => {
                    setMobileCategoriesOpen(
                      (current) => !current
                    );

                    // Never open desktop Categories from here.
                    setDesktopCategoriesOpen(false);
                    setDesktopToolsOpen(false);
                    setMobileToolsOpen(false);
                  }}
                  className="
                    flex w-full
                    items-center
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
                        mobileCategoriesOpen
                          ? 'rotate-180'
                          : ''
                      }
                    `}
                  />
                </button>

                {mobileCategoriesOpen && (
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
                      onClick={openAllArticles}
                      className="
                        block w-full
                        rounded-lg
                        px-3 py-2
                        text-left
                        text-sm font-semibold
                        text-gray-600
                        hover:bg-rose-50
                        hover:text-rose-600
                      "
                    >
                      All Articles
                    </button>

                    {CATEGORIES.map(
                      (category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() =>
                            openCategory(
                              category
                            )
                          }
                          className="
                            block w-full
                            rounded-lg
                            px-3 py-2
                            text-left
                            text-sm
                            text-gray-500
                            hover:bg-rose-50
                            hover:text-rose-600
                          "
                        >
                          {category}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* =========================================
                  MOBILE TOOLS
              ========================================== */}

              <div>
                <button
                  type="button"
                  aria-expanded={mobileToolsOpen}
                  onClick={() => {
                    setMobileToolsOpen(
                      (current) => !current
                    );

                    // Never open desktop tools from mobile menu.
                    setMobileCategoriesOpen(false);
                    setDesktopCategoriesOpen(false);
                    setDesktopToolsOpen(false);
                  }}
                  className="
                    flex w-full
                    items-center
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
                        mobileToolsOpen
                          ? 'rotate-180'
                          : ''
                      }
                    `}
                  />
                </button>

                {mobileToolsOpen && (
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
                          key={tool.id}
                          type="button"
                          onClick={() =>
                            openTool(tool.id)
                          }
                          className="
                            flex w-full
                            items-center gap-3
                            rounded-lg
                            px-3 py-2.5
                            text-left
                            text-sm
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
                          {/* मोबाइल लॉगिन बटन */}
              <div className="pt-2 border-t border-rose-50">
                {user ? (
                  <div className="flex items-center justify-between bg-rose-50/40 border border-rose-100 p-3 rounded-xl">
                    <div className="flex items-center gap-3">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="Profile" className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="h-8 w-8 bg-rose-200 text-rose-700 flex items-center justify-center rounded-full text-sm font-bold"><UserIcon className="h-4 w-4" /></div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{user.displayName || 'User'}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[150px]">{user.email}</p>
                      </div>
                    </div>
                    <button onClick={logoutUser} className="p-2 text-gray-400 hover:text-rose-600 transition">
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={handleLogin}
                      disabled={authLoading}
                      className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white p-2.5 rounded-xl text-sm font-semibold shadow-sm text-center block transition disabled:opacity-60"
                    >
                      {authLoading ? 'Redirecting to Google...' : 'Login with Google'}
                    </button>
                    {authError && (
                      <p className="text-[11px] text-rose-500 mt-1.5 px-1">{authError}</p>
                    )}
                  </div>
                )}
              </div>

          </div>
        </div>
      </aside>
    </>
  );
}




  




