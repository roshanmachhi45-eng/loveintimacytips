
import { useEffect, useState } from 'react';
import { Heart, Menu, Search, X, ChevronDown, ArrowRight } from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { fetchPublishedPosts, type BlogPost } from '../lib/blogApi';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Blog', to: '/#blog' },
  { label: 'About Us', to: '/about' },
];

const CATEGORY_EVENT = 'loveons:category-change';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const closeMenu = () => {
    setMenuOpen(false);
    setCategoriesOpen(false);
  };

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      setCategoriesLoading(true);

      try {
        const posts: BlogPost[] = await fetchPublishedPosts();

        if (cancelled) return;

        const uniqueCategories = Array.from(
          new Set(
            posts
              .map((post) => post.category?.trim())
              .filter((category): category is string => Boolean(category))
          )
        ).sort((a, b) => a.localeCompare(b));

        setCategories(uniqueCategories);
      } catch {
        if (!cancelled) {
          setCategories([]);
        }
      } finally {
        if (!cancelled) {
          setCategoriesLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

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
      window.history.replaceState(null, '', `/#${sectionId}`);
      window.setTimeout(scrollToSection, 50);
      return;
    }

    navigate(`/#${sectionId}`);
    window.setTimeout(scrollToSection, 400);
  };

  const selectCategory = (category: string) => {
    setCategoriesOpen(false);
    setMenuOpen(false);
    setSearchOpen(false);

    window.dispatchEvent(
      new CustomEvent(CATEGORY_EVENT, {
        detail: category,
      })
    );

    const scrollToBlog = () => {
      document.getElementById('blog')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    };

    if (location.pathname === '/') {
      window.history.replaceState(null, '', `/#blog`);
      window.setTimeout(scrollToBlog, 50);
    } else {
      navigate('/#blog');
      window.setTimeout(scrollToBlog, 400);
    }
  };

  const showAllArticles = () => {
    setCategoriesOpen(false);
    setMenuOpen(false);
    setSearchOpen(false);

    window.dispatchEvent(
      new CustomEvent(CATEGORY_EVENT, {
        detail: '',
      })
    );

    const scrollToBlog = () => {
      document.getElementById('blog')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    };

    if (location.pathname === '/') {
      window.history.replaceState(null, '', '/#blog');
      window.setTimeout(scrollToBlog, 50);
    } else {
      navigate('/#blog');
      window.setTimeout(scrollToBlog, 400);
    }
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!searchQuery.trim()) {
      return;
    }

    setSearchOpen(false);
    setMenuOpen(false);
    setCategoriesOpen(false);

    goToSection('blog');
  };

  const CategoryPanel = ({ mobile = false }: { mobile?: boolean }) => (
    <div
      className={
        mobile
          ? 'mt-2 rounded-2xl border border-rose-100 bg-rose-50/40 p-2'
          : 'absolute left-1/2 top-[calc(100%+10px)] z-[80] w-[min(92vw,380px)] -translate-x-1/2 rounded-2xl border border-white/80 bg-white/95 p-3 shadow-[0_18px_50px_rgba(190,24,93,0.16)] backdrop-blur-xl'
      }
      onClick={(event) => event.stopPropagation()}
    >
      <div className="px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">
          Explore by category
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Find relationship articles made for you.
        </p>
      </div>

      <button
        type="button"
        onClick={showAllArticles}
        className="group flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-all hover:bg-rose-50"
      >
        <span>
          <span className="block text-sm font-semibold text-gray-700 group-hover:text-rose-600">
            All Articles
          </span>
          <span className="mt-0.5 block text-xs text-gray-400">
            Explore everything
          </span>
        </span>

        <ArrowRight className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-rose-500" />
      </button>

      <div className="my-2 h-px bg-rose-100" />

      {categoriesLoading ? (
        <div className="px-3 py-4 text-center text-xs text-gray-400">
          Loading categories...
        </div>
      ) : categories.length > 0 ? (
        <div className="max-h-64 overflow-y-auto pr-1">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => selectCategory(category)}
              className="group flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-all hover:bg-rose-50"
            >
              <span className="text-sm font-medium text-gray-700 group-hover:text-rose-600">
                {category}
              </span>

              <ArrowRight className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-rose-500" />
            </button>
          ))}
        </div>
      ) : (
        <div className="px-3 py-4 text-center text-xs text-gray-400">
          Categories will appear when published articles are available.
        </div>
      )}
    </div>
  );

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-3 pt-3 sm:px-5">
        <div className="mx-auto max-w-6xl">
          <nav
            className="
              relative flex h-16 items-center justify-between
              rounded-2xl border border-white/70
              bg-white/85 px-4
              shadow-[0_8px_35px_rgba(190,24,93,0.10)]
              backdrop-blur-xl sm:px-5
            "
            aria-label="Main navigation"
          >
            {/* LOVEONS BRAND */}
            <Link
              to="/"
              onClick={closeMenu}
              className="flex shrink-0 items-center gap-2.5"
              aria-label="Loveons.com home"
            >
              <Logo
                className="h-9 w-9 shrink-0"
                alt="Loveons.com logo"
              />

              <div className="leading-none">
                <span
                  className="
                    block font-display text-lg font-bold
                    tracking-tight text-rose-600
                  "
                >
                  Loveons.com
                </span>

                {/* Signature-style tagline */}
                <span
                  className="mt-1 block whitespace-nowrap text-[10px] text-[#5f4655]"
                  style={{
                    fontFamily:
                      '"Segoe Script", "Brush Script MT", "Lucida Handwriting", cursive',
                    fontStyle: 'italic',
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                  }}
                >
                  Love made meaningful
                </span>
              </div>
            </Link>

            {/* DESKTOP NAVIGATION */}
            <div className="hidden items-center gap-1 lg:flex">
              {navLinks.map((link) => {
                return (
                  <NavLink
                    key={link.label}
                    to={link.to}
                    end={link.to === '/'}
                    onClick={closeMenu}
                    className={({ isActive }) => `
                      rounded-xl px-3.5 py-2.5 text-sm font-medium
                      transition-all duration-200
                      ${
                        isActive
                          ? 'bg-rose-50 text-rose-600'
                          : 'text-gray-600 hover:bg-rose-50 hover:text-rose-600'
                      }
                    `}
                  >
                    {link.label}
                  </NavLink>
                );
              })}

              {/* DESKTOP CATEGORIES */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCategoriesOpen((value) => !value)}
                  className={`
                    flex items-center gap-1.5 rounded-xl px-3.5 py-2.5
                    text-sm font-medium transition-all duration-200
                    ${
                      categoriesOpen
                        ? 'bg-rose-50 text-rose-600'
                        : 'text-gray-600 hover:bg-rose-50 hover:text-rose-600'
                    }
                  `}
                  aria-expanded={categoriesOpen}
                  aria-haspopup="true"
                >
                  Categories
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      categoriesOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {categoriesOpen && <CategoryPanel />}
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-1.5">
              {/* SEARCH */}
              <button
                type="button"
                onClick={() => setSearchOpen((value) => !value)}
                className="
                  flex h-10 w-10 items-center justify-center rounded-xl
                  text-gray-500 transition-all hover:bg-rose-50 hover:text-rose-600
                "
                aria-label="Search"
                aria-expanded={searchOpen}
              >
                <Search className="h-5 w-5" strokeWidth={1.8} />
              </button>

              {/* HAMBURGER — ALWAYS VISIBLE */}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(true);
                  setCategoriesOpen(false);
                }}
                className="
                  flex h-10 w-10 items-center justify-center rounded-xl
                  text-gray-600 transition-all hover:bg-rose-50 hover:text-rose-600
                "
                aria-label="Open menu"
                aria-expanded={menuOpen}
              >
                <Menu className="h-6 w-6" strokeWidth={1.8} />
              </button>
            </div>
          </nav>

          {/* SEARCH PANEL */}
          {searchOpen && (
            <div
              className="
                mt-2 rounded-2xl border border-white/70 bg-white/90
                p-3 shadow-[0_10px_35px_rgba(190,24,93,0.10)]
                backdrop-blur-xl
              "
            >
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-400"
                    aria-hidden="true"
                  />

                  <input
                    type="search"
                    autoFocus
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search articles, tips, and more..."
                    className="
                      w-full rounded-xl border border-rose-100
                      bg-white py-3 pl-10 pr-4 text-sm text-gray-800
                      outline-none placeholder:text-gray-400
                      transition-all focus:border-rose-300 focus:ring-2 focus:ring-rose-100
                    "
                    aria-label="Search articles"
                  />
                </div>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* MENU OVERLAY */}
      {menuOpen && (
        <button
          type="button"
          className="
            fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm
          "
          onClick={closeMenu}
          aria-label="Close menu"
        />
      )}

      {/* NAVIGATION DRAWER */}
      <aside
        className={`
          fixed right-0 top-0 z-[70] flex h-full w-[min(88vw,360px)]
          flex-col bg-white shadow-2xl transition-transform duration-300 ease-out
          ${menuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        aria-label="Navigation menu"
      >
        {/* DRAWER HEADER */}
        <div className="flex items-center justify-between border-b border-rose-100 px-5 py-5">
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-2"
          >
            <Logo
              className="h-8 w-8"
              alt="Loveons.com logo"
            />

            <div className="leading-none">
              <span className="block font-display text-lg font-bold text-rose-600">
                Loveons.com
              </span>

              <span
                className="mt-1 block text-[9px] text-[#5f4655]"
                style={{
                  fontFamily:
                    '"Segoe Script", "Brush Script MT", "Lucida Handwriting", cursive',
                  fontStyle: 'italic',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                }}
              >
                Love made meaningful
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={closeMenu}
            className="
              flex h-10 w-10 items-center justify-center rounded-xl
              text-gray-500 transition-colors hover:bg-rose-50 hover:text-rose-600
            "
            aria-label="Close menu"
          >
            <X className="h-5 w-5" strokeWidth={1.8} />
          </button>
        </div>

        {/* MENU LINKS */}
        <nav className="flex flex-1 flex-col gap-2 overflow-y-auto px-5 py-6">
          <Link
            to="/"
            onClick={closeMenu}
            className="
              rounded-xl px-4 py-3 text-sm font-medium text-gray-700
              transition-all hover:bg-rose-50 hover:text-rose-600
            "
          >
            Home
          </Link>

          <button
            type="button"
            onClick={() => goToSection('blog')}
            className="
              rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-700
              transition-all hover:bg-rose-50 hover:text-rose-600
            "
          >
            Blog
          </button>

          {/* MOBILE / HAMBURGER CATEGORIES */}
          <button
            type="button"
            onClick={() => setCategoriesOpen((value) => !value)}
            className={`
              flex w-full items-center justify-between rounded-xl
              px-4 py-3 text-left text-sm font-medium transition-all
              ${
                categoriesOpen
                  ? 'bg-rose-50 text-rose-600'
                  : 'text-gray-700 hover:bg-rose-50 hover:text-rose-600'
              }
            `}
            aria-expanded={categoriesOpen}
          >
            <span>Categories</span>

            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                categoriesOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {categoriesOpen && (
            <CategoryPanel mobile />
          )}

          <Link
            to="/about"
            onClick={closeMenu}
            className="
              rounded-xl px-4 py-3 text-sm font-medium text-gray-700
              transition-all hover:bg-rose-50 hover:text-rose-600
            "
          >
            About Us
          </Link>

          {/* LOVE CALCULATOR */}
          <button
            type="button"
            onClick={() => goToSection('calculator')}
            className="
              mt-4 flex w-full items-center justify-center gap-2 rounded-xl
              bg-gradient-to-r from-rose-500 to-fuchsia-500
              px-4 py-3.5 text-sm font-semibold text-white
              shadow-[0_8px_22px_rgba(244,63,94,0.24)]
              transition-all duration-200
              hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(244,63,94,0.30)]
              active:translate-y-0
            "
          >
            <Heart className="h-4 w-4 fill-current" aria-hidden="true" />
            <span>Love Calculator</span>
          </button>
        </nav>

        {/* DRAWER FOOTER */}
        <div className="border-t border-rose-100 px-5 py-5">
          <p className="text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Loveons.com. All Rights Reserved.
          </p>
        </div>
      </aside>
    </>
  );
}





