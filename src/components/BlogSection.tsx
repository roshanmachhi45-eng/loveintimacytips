import { useState } from 'react';
import { BookOpen, ArrowLeft, Clock, X } from 'lucide-react';
import { articles, type Article } from '../lib/articles';

const FALLBACK_IMAGE = '/images/blog/fallback.jpg';

function handleImgError(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (img.src !== FALLBACK_IMAGE) {
    img.src = FALLBACK_IMAGE;
  }
}

export default function BlogSection() {
  const [selected, setSelected] = useState<Article | null>(null);

  return (
    <section id="blog" className="mt-12 px-4 scroll-mt-20">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="w-5 h-5 text-rose-500" />
          <h2 className="font-display text-xl font-bold text-gray-800">Wellness Blog</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {articles.map((post) => (
            <article
              key={post.id}
              onClick={() => setSelected(post)}
              className="bg-white rounded-2xl shadow-md shadow-rose-100 border border-rose-100 overflow-hidden hover:shadow-lg hover:shadow-rose-200 hover:-translate-y-1 transition-all cursor-pointer group"
            >
              <div className="relative h-32 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  onError={handleImgError}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-rose-500/30 to-transparent" />
                <span className="absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-full bg-white/90 text-rose-600 backdrop-blur-sm">
                  {post.category}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-display font-bold text-gray-800 text-sm leading-snug mb-2 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </span>
                  <span className="text-xs text-rose-500 font-semibold group-hover:gap-2 transition-all">
                    Read More →
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Article Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 fade-in"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-40 overflow-hidden rounded-t-3xl sm:rounded-t-3xl">
              <img src={selected.image} alt={selected.title} onError={handleImgError} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
              <span className="absolute bottom-3 left-3 text-xs font-semibold px-2 py-1 rounded-full bg-white/90 text-rose-600 backdrop-blur-sm">
                {selected.category}
              </span>
            </div>

            <div className="p-6">
              <h2 className="font-display text-xl font-bold text-gray-800 mb-2">{selected.title}</h2>
              <span className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                <Clock className="w-3 h-3" />
                {selected.readTime}
              </span>

              <div className="space-y-3">
                {selected.content.map((para, i) => (
                  <p key={i} className="text-sm text-gray-600 leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>

              <button
                onClick={() => setSelected(null)}
                className="mt-6 w-full py-3 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-600 font-semibold text-sm hover:bg-rose-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
