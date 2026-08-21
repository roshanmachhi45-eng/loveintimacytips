
import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import Seo from '../components/Seo';
import PageLayout from '../components/PageLayout';
import BlogCard from '../components/BlogCard';

import {
  fetchPublishedPosts,
  type BlogPost,
} from '../lib/blogApi';

export default function Blog() {
  const [posts, setPosts] =
    useState<BlogPost[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [searchParams] =
    useSearchParams();

  /*
   * Category comes from the URL.
   *
   * Example:
   * /blog?category=Communication
   */
  const selectedCategory =
    searchParams
      .get('category')
      ?.trim() || '';

  /* =======================================================
     LOAD CONTENTFUL BLOG POSTS
     ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      setLoading(true);

      try {
        /*
         * Contentful is now the ONLY source
         * for blog posts.
         */
        const data =
          await fetchPublishedPosts();

        if (cancelled) {
          return;
        }

        /*
         * Never fall back to the old
         * Bolt AI articles.
         */
        setPosts(data || []);
      } catch (error) {
        console.error(
          'Failed to load Contentful blog posts:',
          error
        );

        if (!cancelled) {
          /*
           * If Contentful fails, keep the
           * blog list empty instead of showing
           * the old hard-coded articles.
           */
          setPosts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPosts();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     CATEGORY FILTER
     ======================================================= */

  const filteredPosts =
    useMemo(() => {
      /*
       * No category selected:
       * show every published Contentful post.
       */
      if (!selectedCategory) {
        return posts;
      }

      const wantedCategory =
        selectedCategory
          .trim()
          .toLowerCase();

      /*
       * Category comparison is case-insensitive.
       *
       * Example:
       * Contentful: "Communication"
       * URL: "communication"
       *
       * Both will match.
       */
      return posts.filter((post) => {
        const postCategory =
          post.category
            ?.trim()
            .toLowerCase() || '';

        return (
          postCategory ===
          wantedCategory
        );
      });
    }, [
      posts,
      selectedCategory,
    ]);

  /* =======================================================
     SEO
     ======================================================= */

  const pageTitle =
    selectedCategory
      ? `${selectedCategory} — Loveons Relationship Blog`
      : 'Relationship Blog — Loveons';

  const pageDescription =
    selectedCategory
      ? `Explore Loveons articles about ${selectedCategory.toLowerCase()}, with practical relationship advice and helpful insights.`
      : 'Explore helpful relationship advice, love tips, communication ideas, and practical insights for building healthier and happier relationships.';

  /* =======================================================
     PAGE
     ======================================================= */

  return (
    <>
      <Seo
        title={pageTitle}
        description={pageDescription}
        path="/blog"
      />

      <PageLayout
        title={
          selectedCategory
            ? selectedCategory
            : 'Relationship Blog'
        }
        subtitle={
          selectedCategory
            ? `Articles about ${selectedCategory.toLowerCase()}`
            : 'Helpful insights and practical ideas for healthier relationships.'
        }
      >
        <section className="px-1 pb-4">

          {/* =================================================
              SECTION HEADER
          ================================================= */}

          <div className="mb-6 flex items-center gap-2.5">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50">
              <BookOpen className="h-5 w-5 text-rose-500" />
            </div>

            <div>
              <h2 className="font-display text-xl font-bold tracking-tight text-gray-800 sm:text-2xl">
                {selectedCategory
                  ? `${selectedCategory} Articles`
                  : 'Latest Relationship Articles'}
              </h2>

              <p className="mt-0.5 text-xs text-gray-400 sm:text-sm">
                {selectedCategory
                  ? 'Explore articles from this relationship topic'
                  : 'Helpful insights for healthier relationships'}
              </p>
            </div>
          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-7 w-7 animate-spin text-rose-400" />
            </div>

          ) : filteredPosts.length > 0 ? (

            /* ===============================================
               BLOG GRID
            =============================================== */

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filteredPosts.map(
                (post) => (
                  <BlogCard
                    key={post.id}
                    post={post}
                  />
                )
              )}
            </div>

          ) : (

            /* ===============================================
               EMPTY STATE
            =============================================== */

            <div className="rounded-2xl border border-rose-100 bg-white p-8 text-center shadow-sm">

              <p className="font-display text-base font-semibold text-gray-700">
                {selectedCategory
                  ? `No ${selectedCategory} articles found`
                  : 'No articles found'}
              </p>

              <p className="mt-1 text-sm text-gray-400">
                {selectedCategory
                  ? `There are no published articles in the ${selectedCategory} category yet.`
                  : 'There are no published articles yet.'}
              </p>

            </div>
          )}

        </section>
      </PageLayout>
    </>
  );
}

