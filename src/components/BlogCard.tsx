import { Clock, ArrowRight, Calendar, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { BlogPost } from '../lib/blogApi';
import BlogImage from './BlogImage';

interface BlogCardProps {
  post: BlogPost;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="bg-white rounded-2xl shadow-md shadow-rose-100 border border-rose-100 overflow-hidden hover:shadow-lg hover:shadow-rose-200 hover:-translate-y-1 transition-all cursor-pointer group">
      <Link to={`/blog/${post.slug}`} className="block">
        <div className="relative h-32 overflow-hidden">
          <BlogImage
            src={post.image_url}
            alt={post.image_alt || post.title}
            className="w-full h-full"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-rose-500/30 to-transparent" />
          <span className="absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-full bg-white/90 text-rose-600 backdrop-blur-sm">
            {post.category}
          </span>
        </div>
        <div className="p-4">
          <h3 className="font-display font-bold text-gray-800 text-sm leading-snug mb-2 line-clamp-2">
            {post.meta_title || post.title}
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{post.excerpt}</p>
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {post.published_at ? formatDate(post.published_at) : ''}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.reading_time || '5 min read'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <User className="w-3 h-3" />
              {post.author}
            </span>
            <span className="text-xs text-rose-500 font-semibold group-hover:gap-2 transition-all flex items-center gap-1">
              Read More <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
