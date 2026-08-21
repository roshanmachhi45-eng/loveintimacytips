
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Loader2,
  User,
} from 'lucide-react';

import Seo from '../components/Seo';
import BlogCard from '../components/BlogCard';

import {
  fetchPostBySlug,
  fetchRelatedPosts,
  type BlogPost,
} from '../lib/blogApi';

import { BRAND } from '../lib/brand';

/* =========================================================
   CONSTANTS
   ========================================================= */

const DEFAULT_BLOG_IMAGE =
  '/images/blogs/default.webp';

/* =========================================================
   DATE
   ========================================================= */

function formatDate(
  dateStr: string | null | undefined
): string {
  if (!dateStr) {
    return '';
  }

  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/* =========================================================
   IMAGE HELPERS
   ========================================================= */

/**
 * Converts supported image references into
 * browser-friendly URLs.
 *
 * Supported:
 *
 * /images/blogs/example.webp
 * images/blogs/example.webp
 * ./images/blogs/example.webp
 * example.webp
 * https://example.com/example.webp
 */
function resolveBlogImage(
  src: string | null | undefined
): string {
  if (!src) {
    return DEFAULT_BLOG_IMAGE;
  }

  const value = src.trim();

  if (!value) {
    return DEFAULT_BLOG_IMAGE;
  }

  /*
   * Root-relative local path.
   */
  if (value.startsWith('/')) {
    return value;
  }

  /*
   * External image URL.
   */
  if (
    value.startsWith('http://') ||
    value.startsWith('https://')
  ) {
    return value;
  }

  /*
   * Relative local path.
   */
  if (
    value.startsWith('images/') ||
    value.startsWith('./images/')
  ) {
    return `/${value.replace(/^\.?\//, '')}`;
  }

  /*
   * Filename only.
   */
  return `/images/blogs/${value}`;
}

/**
 * Creates a local fallback from an external
 * image URL or filename.
 */
function getLocalImageFallback(
  src: string | null | undefined
): string {
  if (!src) {
    return DEFAULT_BLOG_IMAGE;
  }

  try {
    const url = new URL(src);

    const filename = url.pathname
      .split('/')
      .filter(Boolean)
      .pop();

    if (
      filename &&
      /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(
        filename
      )
    ) {
      return `/images/blogs/${filename}`;
    }
  } catch {
    // Not an absolute URL.
  }

  const filename = src
    .split('/')
    .filter(Boolean)
    .pop();

  if (
    filename &&
    /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(
      filename
    )
  ) {
    return `/images/blogs/${filename}`;
  }

  return DEFAULT_BLOG_IMAGE;
}

/* =========================================================
   BLOG DETAIL
   ========================================================= */

export default function BlogDetail() {
  const { slug } =
    useParams<{ slug: string }>();

  const [post, setPost] =
    useState<BlogPost | null>(null);

  const [related, setRelated] =
    useState<BlogPost[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [imageSrc, setImageSrc] =
    useState(DEFAULT_BLOG_IMAGE);

  const [imageLoaded, setImageLoaded] =
    useState(false);

  const [imageFallbackTried, setImageFallbackTried] =
    useState(false);

  /* =======================================================
     LOAD ARTICLE
     ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadArticle() {
      if (!slug) {
        setLoading(false);
        setError('Article not found.');
        return;
      }

      setLoading(true);
      setError('');
      setPost(null);
      setRelated([]);

      try {
        /*
         * Contentful is now the only source of articles.
         */
        const data =
          await fetchPostBySlug(slug);

        if (cancelled) {
          return;
        }

        /*
         * Article found in Contentful.
         */
        if (data) {
          setPost(data);

          /*
           * Related articles also come only
           * from Contentful.
           */
          try {
            const relatedData =
              await fetchRelatedPosts(
                data.category,
                data.slug,
                3
              );

            if (cancelled) {
              return;
            }

            setRelated(
              relatedData || []
            );
          } catch (relatedError) {
            console.error(
              'Failed to load related Contentful posts:',
              relatedError
            );

            if (!cancelled) {
              setRelated([]);
            }
          }

          return;
        }

        /*
         * No Contentful article found.
         *
         * We intentionally DO NOT fall back
         * to the old 6 Bolt AI articles.
         */
        setError('Article not found.');
      } catch (requestError) {
        console.error(
          'Failed to load Contentful article:',
          requestError
        );

        if (!cancelled) {
          setError(
            'Unable to load this article.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadArticle();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  /* =======================================================
     PREPARE IMAGE WHEN ARTICLE CHANGES
     ======================================================= */

  useEffect(() => {
    if (!post) {
      setImageSrc(
        DEFAULT_BLOG_IMAGE
      );

      setImageLoaded(false);
      setImageFallbackTried(false);

      return;
    }

    const resolved =
      resolveBlogImage(
        post.image_url
      );

    setImageSrc(resolved);
    setImageLoaded(false);
    setImageFallbackTried(false);
  }, [post]);

  /* =======================================================
     IMAGE ERROR HANDLING
     ======================================================= */

  const handleImageError = () => {
    /*
     * First attempt:
     * Convert external image URL or filename
     * to a local /images/blogs filename.
     */
    if (
      !imageFallbackTried &&
      imageSrc !== DEFAULT_BLOG_IMAGE
    ) {
      const localFallback =
        getLocalImageFallback(
          post?.image_url
        );

      if (
        localFallback !== imageSrc &&
        localFallback !== DEFAULT_BLOG_IMAGE
      ) {
        setImageFallbackTried(true);
        setImageLoaded(false);
        setImageSrc(localFallback);
        return;
      }
    }

    /*
     * Final fallback.
     */
    if (
      imageSrc !== DEFAULT_BLOG_IMAGE
    ) {
      setImageFallbackTried(true);
      setImageLoaded(false);
      setImageSrc(
        DEFAULT_BLOG_IMAGE
      );
    }
  };

  /* =======================================================
     SEO IMAGE
     ======================================================= */

  const seoImage = useMemo(() => {
    return resolveBlogImage(
      post?.image_url
    );
  }, [post]);

  /* =======================================================
     CANONICAL URL
     ======================================================= */

  const canonicalUrl = useMemo(() => {
    if (!post) {
      return `${BRAND.domain}/blog/${slug || ''}`;
    }

    return `${BRAND.domain}/blog/${post.slug}`;
  }, [post, slug]);

  /* =======================================================
     STRUCTURED DATA
     ======================================================= */

  const structuredData = useMemo(() => {
    if (!post) {
      return null;
    }

    return {
      '@context': 'https://schema.org',
      '@type': 'Article',

      headline:
        post.meta_title ||
        post.title,

      description:
        post.meta_description ||
        post.excerpt,

      image: [
        seoImage,
      ],

      author: {
        '@type': 'Person',

        name:
          post.author ||
          'Loveons Editorial',
      },

      publisher: {
        '@type': 'Organization',

        name: BRAND.name,

        url: BRAND.domain,
      },

      datePublished:
        post.published_at ||
        post.created_at,

      dateModified:
        post.updated_at ||
        post.published_at ||
        post.created_at,

      mainEntityOfPage: {
        '@type': 'WebPage',

        '@id': canonicalUrl,
      },

      url: canonicalUrl,

      articleSection:
        post.category,

      keywords:
        post.tags &&
        post.tags.length > 0
          ? post.tags.join(', ')
          : undefined,
    };
  }, [
    post,
    seoImage,
    canonicalUrl,
  ]);

  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-20">
        <Loader2 className="h-6 w-6 animate-spin text-rose-400" />
      </div>
    );
  }

  /* =======================================================
     ERROR
     ======================================================= */

  if (error || !post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 pt-20">
        <p className="mb-4 text-sm text-gray-500">
          {error ||
            'Article not found.'}
        </p>

        <Link
          to="/"
          className="text-sm font-semibold text-rose-500"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  /* =======================================================
     PAGE
     ======================================================= */

  return (
    <>
      {/* ===================================================
          SEO
      =================================================== */}

      <Seo
        title={
          post.meta_title ||
          post.title
        }
        description={
          post.meta_description ||
          post.excerpt
        }
        path={`/blog/${post.slug}`}
        ogImage={seoImage}
      />

      {/* ===================================================
          ARTICLE STRUCTURED DATA
      =================================================== */}

      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html:
              JSON.stringify(
                structuredData
              ),
          }}
        />
      )}

      {/* ===================================================
          PAGE
      =================================================== */}

      <div className="min-h-screen pb-12 pt-14">
        <div className="mx-auto max-w-2xl px-4">

          {/* =================================================
              BACK TO HOME
          ================================================= */}

          <Link
            to="/"
            className="
              mb-4
              inline-flex
              items-center
              gap-1
              text-sm
              font-semibold
              text-rose-500
              transition-all
              hover:gap-2
            "
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <article>

            {/* ===============================================
                FEATURED IMAGE
            =============================================== */}

            <div
              className="
                relative
                mb-6
                h-56
                overflow-hidden
                rounded-3xl
                bg-rose-50
                sm:h-64
              "
            >
              {!imageLoaded && (
                <div
                  aria-hidden="true"
                  className="
                    absolute
                    inset-0
                    animate-pulse
                    bg-gradient-to-br
                    from-rose-50
                    to-rose-100
                  "
                />
              )}

              <img
                src={imageSrc}
                alt={
                  post.image_alt ||
                  post.title
                }
                loading="eager"
                decoding="async"
                onLoad={() => {
                  setImageLoaded(true);
                }}
                onError={
                  handleImageError
                }
                className={`
                  relative
                  z-10
                  h-full
                  w-full
                  object-cover
                  transition-opacity
                  duration-300
                  ${
                    imageLoaded
                      ? 'opacity-100'
                      : 'opacity-0'
                  }
                `}
              />

              {/* CATEGORY */}

              {post.category && (
                <span
                  className="
                    absolute
                    left-3
                    top-3
                    z-20
                    rounded-full
                    bg-white/90
                    px-2.5
                    py-1
                    text-xs
                    font-semibold
                    text-rose-600
                    backdrop-blur-sm
                  "
                >
                  {post.category}
                </span>
              )}
            </div>

            {/* ===============================================
                TITLE
            =============================================== */}

            <h1
              className="
                mb-3
                font-display
                text-2xl
                font-bold
                leading-tight
                text-gray-800
              "
            >
              {post.title}
            </h1>

            {/* ===============================================
                EXCERPT
            =============================================== */}

            {post.excerpt && (
              <p
                className="
                  mb-5
                  text-sm
                  leading-6
                  text-gray-500
                "
              >
                {post.excerpt}
              </p>
            )}

            {/* ===============================================
                META
            =============================================== */}

            <div
              className="
                mb-6
                flex
                flex-wrap
                items-center
                gap-4
                text-xs
                text-gray-400
              "
            >
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />

                {post.author ||
                  'Loveons Editorial'}
              </span>

              {post.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />

                  {formatDate(
                    post.published_at
                  )}
                </span>
              )}

              {post.reading_time && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />

                  {post.reading_time}
                </span>
              )}
            </div>

            {/* ===============================================
                ARTICLE CONTENT

                Contentful Rich Text is converted into
                safe HTML by blogApi.ts.

                IMPORTANT:
                We render the HTML directly here instead
                of treating <p>, <h2>, <h3>, etc. as text.

                This fixes the visible HTML tag problem.
            =============================================== */}

            <div
              id="blog-article-content"
              data-tts-content="true"
              className="
                article-content
                text-gray-600

                [&_p]:mb-5
                [&_p]:text-sm
                [&_p]:leading-7
                [&_p]:text-gray-600
                sm:[&_p]:text-[15px]
                sm:[&_p]:leading-8

                [&_h1]:mb-4
                [&_h1]:mt-8
                [&_h1]:font-display
                [&_h1]:text-2xl
                [&_h1]:font-bold
                [&_h1]:leading-tight
                [&_h1]:text-gray-800

                [&_h2]:mb-3
                [&_h2]:mt-8
                [&_h2]:font-display
                [&_h2]:text-xl
                [&_h2]:font-bold
                [&_h2]:leading-tight
                [&_h2]:text-gray-800

                [&_h3]:mb-3
                [&_h3]:mt-7
                [&_h3]:font-display
                [&_h3]:text-lg
                [&_h3]:font-bold
                [&_h3]:leading-tight
                [&_h3]:text-gray-800

                [&_h4]:mb-2
                [&_h4]:mt-6
                [&_h4]:font-display
                [&_h4]:text-base
                [&_h4]:font-bold
                [&_h4]:text-gray-800

                [&_ul]:mb-5
                [&_ul]:ml-6
                [&_ul]:list-disc
                [&_ul]:space-y-2

                [&_ol]:mb-5
                [&_ol]:ml-6
                [&_ol]:list-decimal
                [&_ol]:space-y-2

                [&_li]:text-sm
                [&_li]:leading-7
                [&_li]:text-gray-600
                sm:[&_li]:text-[15px]
                sm:[&_li]:leading-8

                [&_blockquote]:my-6
                [&_blockquote]:border-l-4
                [&_blockquote]:border-rose-200
                [&_blockquote]:pl-4
                [&_blockquote]:italic
                [&_blockquote]:text-gray-500

                [&_a]:font-medium
                [&_a]:text-rose-500
                [&_a]:underline
                [&_a]:decoration-rose-200
                [&_a]:underline-offset-2
                [&_a]:transition
                [&_a:hover]:text-rose-600

                [&_strong]:font-semibold
                [&_strong]:text-gray-800

                [&_em]:italic

                [&_hr]:my-8
                [&_hr]:border-rose-100
              "
              dangerouslySetInnerHTML={{
                __html: post.content || '',
              }}
            />

            {/* ===============================================
                TAGS
            =============================================== */}

            {post.tags &&
              post.tags.length > 0 && (
                <div
                  className="
                    mt-6
                    flex
                    flex-wrap
                    gap-2
                  "
                >
                  {post.tags.map(
                    (tag) => (
                      <span
                        key={tag}
                        className="
                          rounded-full
                          bg-rose-50
                          px-3
                          py-1
                          text-xs
                          font-medium
                          text-rose-500
                        "
                      >
                        #{tag}
                      </span>
                    )
                  )}
                </div>
              )}
          </article>

          {/* =================================================
              RELATED ARTICLES

              ONLY CONTENTFUL ARTICLES ARE USED.
              No DEFAULT_ARTICLES fallback.
          ================================================= */}

          {related.length > 0 && (
            <section
              className="
                mt-12
                border-t
                border-rose-100
                pt-8
              "
              aria-labelledby="related-articles-title"
            >
              <div
                className="
                  mb-4
                  flex
                  items-center
                  gap-2
                "
              >
                <BookOpen className="h-5 w-5 text-rose-500" />

                <h2
                  id="related-articles-title"
                  className="
                    font-display
                    text-lg
                    font-bold
                    text-gray-800
                  "
                >
                  Related Articles
                </h2>
              </div>

              <div
                className="
                  grid
                  grid-cols-1
                  gap-4
                  sm:grid-cols-2
                "
              >
                {related.map(
                  (relatedPost) => (
                    <BlogCard
                      key={
                        relatedPost.id
                      }
                      post={
                        relatedPost
                      }
                    />
                  )
                )}
              </div>
            </section>
          )}

        </div>
      </div>
    </>
  );
}


