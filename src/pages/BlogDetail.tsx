
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
} from '../lib/BlogApi';

import { DEFAULT_ARTICLES } from '../lib/defaultArticles';
import { BRAND } from '../lib/brand';

/* =========================================================
   TYPES
   ========================================================= */

interface ArticleParagraphProps {
  text: string;
}

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
   SAFE LINK HELPERS
   ========================================================= */

function isExternalUrl(url: string): boolean {
  return (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('//')
  );
}

function isInternalBlogUrl(url: string): boolean {
  return (
    url.startsWith('/blog/') ||
    url.startsWith('/blog?')
  );
}

/**
 * Converts simple markdown-style links:
 *
 * [Relationship Tips](/blog/relationship-tips)
 *
 * into React Router links.
 *
 * This avoids dangerouslySetInnerHTML and keeps
 * article content safer.
 */
function renderArticleText(
  text: string
): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];

  const linkPattern =
    /\[([^\]]+)\]\(([^)\s]+)\)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(text)) !== null) {
    const [fullMatch, label, url] = match;

    if (match.index > lastIndex) {
      nodes.push(
        text.slice(lastIndex, match.index)
      );
    }

    const safeLabel = label.trim();
    const safeUrl = url.trim();

    if (
      safeUrl &&
      (safeUrl.startsWith('/') ||
        isExternalUrl(safeUrl))
    ) {
      if (
        safeUrl.startsWith('/') &&
        isInternalBlogUrl(safeUrl)
      ) {
        nodes.push(
          <Link
            key={`${safeUrl}-${match.index}`}
            to={safeUrl}
            className="font-medium text-rose-500 underline decoration-rose-200 underline-offset-2 transition hover:text-rose-600"
          >
            {safeLabel}
          </Link>
        );
      } else if (
        safeUrl.startsWith('/')
      ) {
        nodes.push(
          <Link
            key={`${safeUrl}-${match.index}`}
            to={safeUrl}
            className="font-medium text-rose-500 underline decoration-rose-200 underline-offset-2 transition hover:text-rose-600"
          >
            {safeLabel}
          </Link>
        );
      } else {
        nodes.push(
          <a
            key={`${safeUrl}-${match.index}`}
            href={safeUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="font-medium text-rose-500 underline decoration-rose-200 underline-offset-2 transition hover:text-rose-600"
          >
            {safeLabel}
          </a>
        );
      }
    } else {
      nodes.push(fullMatch);
    }

    lastIndex =
      match.index + fullMatch.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

/* =========================================================
   ARTICLE PARAGRAPH
   ========================================================= */

function ArticleParagraph({
  text,
}: ArticleParagraphProps) {
  const trimmed = text.trim();

  if (!trimmed) {
    return null;
  }

  /*
   * Simple heading detection.
   *
   * CMS content can use:
   *
   * # Heading
   * ## Heading
   */
  if (trimmed.startsWith('## ')) {
    return (
      <h3 className="mt-8 mb-3 font-display text-lg font-bold leading-tight text-gray-800">
        {renderArticleText(
          trimmed.replace(/^##\s+/, '')
        )}
      </h3>
    );
  }

  if (trimmed.startsWith('# ')) {
    return (
      <h2 className="mt-8 mb-3 font-display text-xl font-bold leading-tight text-gray-800">
        {renderArticleText(
          trimmed.replace(/^#\s+/, '')
        )}
      </h2>
    );
  }

  return (
    <p className="mb-5 text-sm leading-7 text-gray-600 sm:text-[15px] sm:leading-8">
      {renderArticleText(trimmed)}
    </p>
  );
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
         * First source:
         * Published Supabase article.
         */
        const data =
          await fetchPostBySlug(slug);

        if (cancelled) {
          return;
        }

        /*
         * Database article found.
         */
        if (data) {
          setPost(data);

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

            if (relatedData.length > 0) {
              setRelated(relatedData);
            } else {
              /*
               * Keep the existing fallback behaviour
               * from v17.
               */
              setRelated(
                DEFAULT_ARTICLES
                  .filter(
                    (article) =>
                      article.slug !== data.slug
                  )
                  .slice(0, 3)
              );
            }
          } catch {
            if (!cancelled) {
              setRelated(
                DEFAULT_ARTICLES
                  .filter(
                    (article) =>
                      article.slug !== data.slug
                  )
                  .slice(0, 3)
              );
            }
          }

          return;
        }

        /*
         * Database did not return the article.
         *
         * Preserve v17's DEFAULT_ARTICLES fallback.
         */
        const fallback =
          DEFAULT_ARTICLES.find(
            (article) =>
              article.slug === slug
          );

        if (fallback) {
          setPost(
            fallback as BlogPost
          );

          setRelated(
            DEFAULT_ARTICLES
              .filter(
                (article) =>
                  article.slug !== slug
              )
              .slice(0, 3) as BlogPost[]
          );

          return;
        }

        setError('Article not found.');
      } catch {
        if (cancelled) {
          return;
        }

        /*
         * Preserve v17 fallback behaviour
         * even if Supabase request fails.
         */
        const fallback =
          DEFAULT_ARTICLES.find(
            (article) =>
              article.slug === slug
          );

        if (fallback) {
          setPost(
            fallback as BlogPost
          );

          setRelated(
            DEFAULT_ARTICLES
              .filter(
                (article) =>
                  article.slug !== slug
              )
              .slice(0, 3) as BlogPost[]
          );
        } else {
          setError('Article not found.');
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
     * Convert Supabase/external image to
     * local /images/blogs filename.
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
        localFallback !==
          DEFAULT_BLOG_IMAGE
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
     ARTICLE CONTENT
     ======================================================= */

  const paragraphs = useMemo(() => {
    if (!post) {
      return [];
    }

    /*
     * CMS article content.
     */
    if (
      post.content &&
      post.content.trim().length > 0
    ) {
      return post.content
        .split(/\n\s*\n/)
        .map((paragraph) =>
          paragraph.trim()
        )
        .filter(Boolean);
    }

    /*
     * Existing fallback article content.
     *
     * DEFAULT_ARTICLES is intentionally preserved
     * so old/static articles do not break.
     */
    const fallbackArticle =
      DEFAULT_ARTICLES.find(
        (article) =>
          article.slug === post.slug
      );

    if (
      fallbackArticle &&
      fallbackArticle.content
    ) {
      return fallbackArticle.content
        .split(/\n\s*\n/)
        .map((paragraph) =>
          paragraph.trim()
        )
        .filter(Boolean);
    }

    return [
      post.excerpt,
      'This article is part of the Loveons collection of relationship guidance.',
    ].filter(Boolean);
  }, [post]);

  /* =======================================================
     SEO
     ======================================================= */

  const seoImage = useMemo(() => {
    return resolveBlogImage(
      post?.image_url
    );
  }, [post]);

  const canonicalUrl = useMemo(() => {
    if (!post) {
      return `${BRAND.domain}/blog/${slug || ''}`;
    }

    return `${BRAND.domain}/blog/${post.slug}`;
  }, [post, slug]);

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

                IMPORTANT:
                This is intentionally isolated.

                Future TTS will read only this element.
                Navbar, footer, related articles,
                buttons and tags stay outside it.
            =============================================== */}

            <div
              id="blog-article-content"
              data-tts-content="true"
              className="
                article-content
                text-gray-600
              "
            >
              {paragraphs.map(
                (paragraph, index) => (
                  <ArticleParagraph
                    key={`${post.id}-${index}`}
                    text={paragraph}
                  />
                )
              )}
            </div>

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

