
import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Loader2, X } from 'lucide-react';

import BlogCard from './BlogCard';
import { fetchPublishedPosts, type BlogPost } from '../lib/blogApi';
import { DEFAULT_ARTICLES } from '../lib/defaultArticles';

const CATEGORY_EVENT = 'loveons:category-change';

export default function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const handleCategoryChange = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      setSelectedCategory(customEvent.detail || '');
    };

    window.addEventListener(CATEGORY_EVENT, handleCategoryChange);

    return () => {
      window.removeEventListener(CATEGORY_EVENT, handleCategoryChange);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchPublishedPosts()
      .then((data) => {
        if (cancelled) return;

        setPosts(
          data && data.length > 0
            ? data
            : DEFAULT_ARTICLES
        );
      })
      .catch(() => {
        if (!cancelled) {
          setPosts(DEFAULT_ARTICLES);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        posts
          .map((post) => post.category?.trim())
          .filter((category): category is string => Boolean(category))
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (!selectedCategory) {
      return posts;
    }

    return posts.filter(
      (post) => post.category?.trim() === selectedCategory
    );
  }, [posts, selectedCategory]);

  return (
    <section
      id="blog"
      className="mt-12 scroll-mt-20 px-4"
    >
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-rose-500" />

            <div>
              <h2 className="font-display text-xl font-bold text-gray-800">
                {selectedCategory || 'Blog'}
              </h2>

              {selectedCategory && (
                <p className="mt-0.5 text-xs text-gray-400">
                  Articles in this category
                </p>
              )}
            </div>
          </div>

          {selectedCategory && (
            <button
              type="button"
              onClick={() => setSelectedCategory('')}
              className="
                flex items-center gap-1.5 rounded-full
                border border-rose-100 bg-white px-3 py-1.5
                text-xs font-medium text-gray-500
                transition-all hover:border-rose-200
                hover:bg-rose-50 hover:text-rose-600
              "
            >
              <X className="h-3.5 w-3.5" />
              All Articles
            </button>
          )}
        </div>

        {/* Category chips */}
        {!loading && categories.length > 0 && (
          <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedCategory('')}
              className={`
                shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold
                transition-all
                ${
                  !selectedCategory
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'border border-gray-200 bg-white text-gray-500 hover:border-rose-200 hover:text-rose-600'
                }
              `}
            >
              All
            </button>

            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`
                  shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold
                  transition-all
                  ${
                    selectedCategory === category
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'border border-gray-200 bg-white text-gray-500 hover:border-rose-200 hover:text-rose-600'
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-rose-400" />
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filteredPosts.map((post) => (
              <BlogCard
                key={post.id}
                post={post}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-rose-100 bg-white p-8 text-center shadow-sm">
            <p className="font-display text-base font-semibold text-gray-700">
              No articles found
            </p>

            <p className="mt-1 text-sm text-gray-400">
              There are no published articles in this category yet.
            </p>

            <button
              type="button"
              onClick={() => setSelectedCategory('')}
              className="
                mt-4 rounded-xl bg-rose-500 px-4 py-2.5
                text-sm font-semibold text-white
                transition-all hover:bg-rose-600
              "
            >
              View All Articles
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

