
import {
  ArrowRight,
  Calendar,
  Clock,
  User,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import type { BlogPost } from '../lib/blogApi';
import BlogImage from './BlogImage';

interface BlogCardProps {
  post: BlogPost;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';

  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function BlogCard({
  post,
}: BlogCardProps) {
  const date = formatDate(post.published_at);

  return (
    <article
      className="
        group
        overflow-hidden
        rounded-[1.35rem]
        border border-rose-100
        bg-white
        shadow-[0_8px_30px_rgba(244,63,94,0.07)]
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-rose-200
        hover:shadow-[0_16px_40px_rgba(244,63,94,0.13)]
      "
    >
      <Link
        to={`/blog/${post.slug}`}
        className="block"
        aria-label={`Read ${post.title}`}
      >
        {/* ============================================
            IMAGE
        ============================================= */}
        <div className="relative h-44 overflow-hidden sm:h-48">
          <BlogImage
            src={post.image_url}
            alt={post.image_alt || post.title}
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-500
              ease-out
              group-hover:scale-[1.04]
            "
            loading="lazy"
          />

          {/* Soft image overlay */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-t
              from-black/30
              via-transparent
              to-transparent
              opacity-70
            "
          />

          {/* Category */}
          {post.category && (
            <span
              className="
                absolute
                left-3
                top-3
                rounded-full
                border
                border-white/70
                bg-white/90
                px-2.5
                py-1
                text-[11px]
                font-bold
                text-rose-600
                shadow-sm
                backdrop-blur-md
              "
            >
              {post.category}
            </span>
          )}
        </div>

        {/* ============================================
            CONTENT
        ============================================= */}
        <div className="p-4 sm:p-5">

          {/* Title */}
          <h3
            className="
              line-clamp-2
              font-display
              text-base
              font-bold
              leading-[1.35]
              tracking-[-0.01em]
              text-slate-800
              transition-colors
              duration-200
              group-hover:text-rose-600
              sm:text-lg
            "
          >
            {post.meta_title || post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p
              className="
                mt-2
                line-clamp-2
                text-sm
                leading-6
                text-slate-500
              "
            >
              {post.excerpt}
            </p>
          )}

          {/* ============================================
              META
          ============================================= */}
          <div
            className="
              mt-4
              flex
              flex-wrap
              items-center
              gap-x-3
              gap-y-1.5
              text-[11px]
              font-medium
              text-slate-400
            "
          >
            {date && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {date}
              </span>
            )}

            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {post.reading_time || '5 min read'}
            </span>
          </div>

          {/* ============================================
              BOTTOM ROW
          ============================================= */}
          <div
            className="
              mt-4
              flex
              items-center
              justify-between
              gap-3
              border-t
              border-rose-50
              pt-3.5
            "
          >
            {/* Author */}
            <span
              className="
                inline-flex
                min-w-0
                items-center
                gap-1.5
                truncate
                text-xs
                font-medium
                text-slate-400
              "
            >
              <User className="h-3.5 w-3.5 shrink-0" />

              <span className="truncate">
                {post.author || 'Loveons'}
              </span>
            </span>

            {/* Read More */}
            <span
              className="
                inline-flex
                shrink-0
                items-center
                gap-1
                text-xs
                font-bold
                text-rose-500
                transition-all
                duration-200
                group-hover:gap-2
                group-hover:text-rose-600
                sm:text-sm
              "
            >
              Read More

              <ArrowRight
                className="
                  h-3.5
                  w-3.5
                  transition-transform
                  duration-200
                  group-hover:translate-x-0.5
                "
              />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

