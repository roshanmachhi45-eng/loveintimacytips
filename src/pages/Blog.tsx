
import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import Seo from '../components/Seo';
import PageLayout from '../components/PageLayout';
import BlogCard from '../components/BlogCard';

import { fetchPublishedPosts, type BlogPost } from '../lib/blogApi';
import { DEFAULT_ARTICLES } from '../lib/defaultArticles';

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchParams] = useSearchParams();

  const selectedCategory =
    searchParams.get('category')?.trim() || '';

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

  const filteredPosts = useMemo(() => {
    if (!selectedCategory) {
      return posts;
    }

    return posts.filter((post) => {
      const postCategory =
        post.category?.trim().toLowerCase();

      const wantedCategory =
        selectedCategory.toLowerCase();

      return postCategory === wantedCategory;
    });
  }, [posts, selectedCategory]);

  const pageTitle = selectedCategory
    ? `${selectedCategory} — Loveons Relationship Blog`
    : 'Relationship Blog — Loveons';

  const pageDescription = selectedCategory
    ? `Explore Loveons articles about ${selectedCategory.toLowerCase()}, with practical relationship advice and helpful insights.`
    : 'Explore helpful relationship advice, love tips, communication ideas, and practical insights for building healthier and happier relationships.';

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

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-7 w-7 animate-spin text-rose-400" />
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
            </div>
          )}
        </section>
      </PageLayout>
    </>
  );
}

