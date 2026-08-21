
import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Loader2 } from 'lucide-react';
import BlogCard from './BlogCard';
import {
  fetchPublishedPosts,
  type BlogPost,
} from '../lib/blogApi';

export default function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      setLoading(true);

      try {
        const data = await fetchPublishedPosts();

        if (cancelled) return;

        // Contentful is the only source of blog posts.
        // No fallback to old hard-coded articles.
        setPosts(data || []);
      } catch (error) {
        console.error(
          'Failed to load Contentful blog posts:',
          error
        );

        if (!cancelled) {
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

  return (
    <section
      id="blog"
      className="mt-14 scroll-mt-20 px-4 sm:mt-16"
    >
      <div className="mx-auto max-w-2xl">

        {/* Section Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2.5">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50">
              <BookOpen className="h-5 w-5 text-rose-500" />
            </div>

            <div className="min-w-0">
              <h2 className="font-display text-xl font-bold tracking-tight text-gray-800 sm:text-2xl">
                Latest Relationship Articles
              </h2>

              <p className="mt-0.5 text-xs text-gray-400 sm:text-sm">
                Helpful insights for healthier relationships
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              window.location.href = '/blog';
            }}
            className="
              group
              flex
              shrink-0
              items-center
              gap-1
              rounded-full
              px-2
              py-1.5
              text-xs
              font-semibold
              text-rose-500
              transition-all
              hover:bg-rose-50
              hover:text-rose-600
              sm:px-3
              sm:text-sm
            "
          >
            <span>View all articles</span>

            <ArrowRight
              className="
                h-3.5
                w-3.5
                transition-transform
                group-hover:translate-x-0.5
                sm:h-4
                sm:w-4
              "
            />
          </button>
        </div>

        {/* Articles */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-rose-400" />
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {posts.map((post) => (
              <BlogCard
                key={post.id}
                post={post}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-rose-100 bg-white p-8 text-center shadow-sm">
            <p className="font-display text-base font-semibold text-gray-700">
              No articles available yet
            </p>

            <p className="mt-1 text-sm text-gray-400">
              New relationship articles will appear here soon.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

