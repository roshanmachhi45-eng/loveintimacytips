import { useState, useEffect } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import BlogCard from './BlogCard';
import { fetchPublishedPosts, type BlogPost } from '../lib/blogApi';
import { DEFAULT_ARTICLES } from '../lib/defaultArticles';

export default function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublishedPosts()
      .then((data) => {
        setPosts(data && data.length > 0 ? data : DEFAULT_ARTICLES);
      })
      .catch(() => {
        setPosts(DEFAULT_ARTICLES);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <section id="blog" className="mt-12 px-4 scroll-mt-20">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="w-5 h-5 text-rose-500" />
          <h2 className="font-display text-xl font-bold text-gray-800">Blog</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-rose-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
