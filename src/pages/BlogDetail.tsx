
import {
    useEffect,
    useLayoutEffect,
    useMemo,
    useState,
} from 'react';

import {
    Link,
    useParams,
} from 'react-router-dom';

import {
    ArrowLeft,
    BookOpen,
    Calendar,
    ChevronDown,
    ChevronUp,
    Clock,
    Loader2,
    User,
} from 'lucide-react';

import Seo from '../components/Seo';
import BlogCard from '../components/BlogCard';
import BlogTTS from '../components/BlogTTS';
import BlogShare from '../components/BlogShare';
import BlogComments from "../components/BlogComments";

import {
    fetchPostBySlug,
    fetchRelatedPosts,
    type BlogPost,
} from '../lib/blogApi';

import { BRAND } from '../lib/brand';

/* =========================================================
   TYPES
========================================================= */

interface TocItem {
    id: string;
    text: string;
    level: 2 | 3;
}

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_BLOG_IMAGE =
    '/images/blogs/default.webp';

const TOC_SCROLL_OFFSET = 110;

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

    return date.toLocaleDateString(
        'en-US',
        {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        }
    );
}

/* =========================================================
   IMAGE HELPERS
========================================================= */

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

    if (value.startsWith('/')) {
        return value;
    }

    if (
        value.startsWith('http://') ||
        value.startsWith('https://')
    ) {
        return value;
    }

    if (
        value.startsWith('images/') ||
        value.startsWith('./images/')
    ) {
        return `/${value.replace(
            /^\.?\//,
            ''
        )}`;
    }

    return `/images/blogs/${value}`;
}

function getLocalImageFallback(
    src: string | null | undefined
): string {
    if (!src) {
        return DEFAULT_BLOG_IMAGE;
    }

    try {
        const url = new URL(src);

        const filename =
            url.pathname
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

    const filename =
        src
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
   TOC
========================================================= */

/*
 * blogApi.ts already creates IDs for H1/H2/H3.
 *
 * Example:
 *
 * <h2 id="why-communication-matters">
 *
 * Therefore we DO NOT create new IDs here.
 *
 * We simply read the IDs already present
 * inside the rendered article.
 */

function getTocFromArticle(
    container: HTMLElement
): TocItem[] {
    const headings =
        Array.from(
            container.querySelectorAll(
                'h2, h3'
            )
        );

    return headings
        .map((heading) => {
            const id =
                heading.getAttribute('id');

            const text =
                heading.textContent?.trim() ||
                '';

            if (!id || !text) {
                return null;
            }

            return {
                id,
                text,
                level:
                    heading.tagName.toLowerCase() ===
                    'h3'
                        ? 3
                        : 2,
            };
        })
        .filter(
            (
                item
            ): item is TocItem =>
                item !== null
        );
}

/* =========================================================
   EXACT TOC SCROLL
========================================================= */

function scrollToHeading(
    id: string
): void {
    const article =
        document.getElementById(
            'blog-article-content'
        );

    if (!article) {
        console.warn(
            'Blog article container not found.'
        );

        return;
    }

    /*
     * Search ONLY inside the current article.
     *
     * This prevents another element somewhere
     * else on the page from being selected.
     */

    const headings =
        Array.from(
            article.querySelectorAll(
                'h2, h3'
            )
        );

    const target =
        headings.find(
            (heading) =>
                heading.getAttribute(
                    'id'
                ) === id
        ) as HTMLElement | undefined;

    if (!target) {
        console.warn(
            'TOC heading not found:',
            id
        );

        return;
    }

    /*
     * Calculate exact document position.
     *
     * We intentionally do NOT use:
     *
     * - href="#..."
     * - URL hash
     * - scrollIntoView()
     *
     * This avoids unwanted browser navigation.
     */

    const rect =
        target.getBoundingClientRect();

    const absoluteTop =
        window.scrollY +
        rect.top -
        TOC_SCROLL_OFFSET;

    window.scrollTo({
        top: Math.max(
            0,
            absoluteTop
        ),
        left: 0,
        behavior: 'smooth',
    });
}

/* =========================================================
   FORCE PAGE TOP
========================================================= */

function forcePageTop(): void {
    /*
     * Disable browser scroll restoration.
     */

    try {
        if (
            'scrollRestoration' in
            window.history
        ) {
            window.history.scrollRestoration =
                'manual';
        }
    } catch {
        // Ignore unsupported browsers.
    }

    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto',
    });
}

/* =========================================================
   BLOG DETAIL
========================================================= */

function addHeadingIds(html: string): string {
    if (!html.trim()) {
        return '';
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const usedIds = new Set<string>();

    doc.querySelectorAll('h1, h2, h3, h4').forEach((heading, index) => {
        // Keep an ID if Contentful already provides one
        if (heading.id) {
            let existingId = heading.id.trim();

            if (!usedIds.has(existingId)) {
                heading.id = existingId;
                usedIds.add(existingId);
                return;
            }

            let duplicateNumber = 2;
            let newId = `${existingId}-${duplicateNumber}`;

            while (usedIds.has(newId)) {
                duplicateNumber++;
                newId = `${existingId}-${duplicateNumber}`;
            }

            heading.id = newId;
            usedIds.add(newId);
            return;
        }

        const headingText =
            heading.textContent?.trim() ||
            `section-${index + 1}`;

        const baseId =
            headingText
                .toLowerCase()
                .normalize('NFKD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '') ||
            `section-${index + 1}`;

        let id = baseId;
        let duplicateNumber = 2;

        while (usedIds.has(id)) {
            id = `${baseId}-${duplicateNumber}`;
            duplicateNumber++;
        }

        heading.id = id;
        usedIds.add(id);
    });

    return doc.body.innerHTML;
}

export default function BlogDetail() {
    const { slug } =
        useParams<{
            slug: string;
        }>();

    const [post, setPost] =
        useState<BlogPost | null>(
            null
        );

    const [related, setRelated] =
        useState<BlogPost[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState('');

    const [imageSrc, setImageSrc] =
        useState(
            DEFAULT_BLOG_IMAGE
        );

    const [imageLoaded, setImageLoaded] =
        useState(false);

    const [
        imageFallbackTried,
        setImageFallbackTried,
    ] = useState(false);

    const [
        tocItems,
        setTocItems,
    ] = useState<TocItem[]>([]);

    /*
     * TOC is open by default.
     */

    const [
        tocOpen,
        setTocOpen,
    ] = useState(true);

    const [
        activeTocId,
        setActiveTocId,
    ] = useState<string | null>(
        null
    );
/* =======================================================
CHAT GAME STATE
======================================================= */

    const [
chatGameStarted,
setChatGameStarted,
] = useState(false);

const [
currentChatQuestion,
setCurrentChatQuestion,
] = useState(0);

const [
chatAnswers,
setChatAnswers,
] = useState<string[]>([]);

const [
chatGameFinished,
setChatGameFinished,
] = useState(false);
    
    useEffect(() => {
  setChatGameStarted(false);
  setCurrentChatQuestion(0);
  setChatAnswers([]);
  setChatGameFinished(false);
}, [slug]);
    
    /* =======================================================
       RESET SCROLL WHEN SLUG CHANGES
    ======================================================= */

    useLayoutEffect(() => {
        /*
         * Remove any old hash immediately.
         *
         * We intentionally do NOT create hashes
         * when clicking the TOC.
         */

        if (
            window.location.hash
        ) {
            window.history.replaceState(
                null,
                '',
                window.location.pathname +
                    window.location.search
            );
        }

        forcePageTop();

        /*
         * React Router/browser restoration can happen
         * after the first layout pass.
         *
         * Therefore force page top again
         * on the next frames.
         */

        const frame1 =
            window.requestAnimationFrame(
                () => {
                    forcePageTop();

                    window.requestAnimationFrame(
                        () => {
                            forcePageTop();
                        }
                    );
                }
            );

        return () => {
            window.cancelAnimationFrame(
                frame1
            );
        };
    }, [slug]);

    /* =======================================================
       LOAD ARTICLE
    ======================================================= */

    useEffect(() => {
        let cancelled = false;

        async function loadArticle() {
            if (!slug) {
                setLoading(false);

                setError(
                    'Article not found.'
                );

                return;
            }

            setLoading(true);
            setError('');

            setPost(null);
            setRelated([]);
            setTocItems([]);
            setActiveTocId(null);

            /*
             * Every new article starts with
             * TOC open.
             */

            setTocOpen(true);

            try {
                const data =
                    await fetchPostBySlug(
                        slug
                    );

                if (cancelled) {
                    return;
                }

                if (!data) {
                    setError(
                        'Article not found.'
                    );

                    return;
                }

                setPost(data);

                /*
                 * Related articles.
                 */

                try {
                    const relatedData =
                        await fetchRelatedPosts(
                            data.category,
                            data.slug,
                            3
                        );

                    if (!cancelled) {
                        setRelated(
                            relatedData || []
                        );
                    }
                } catch (
                    relatedError
                ) {
                    console.error(
                        'Failed to load related Contentful posts:',
                        relatedError
                    );

                    if (!cancelled) {
                        setRelated([]);
                    }
                }
            } catch (
                requestError
            ) {
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
       PREPARE IMAGE
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
       BUILD TOC
    ======================================================= */

    useEffect(() => {
        if (!post) {
            setTocItems([]);
            return;
        }

        let cancelled = false;
        let attempts = 0;
        let timer:
            number | undefined;

        const setupToc = () => {
            if (cancelled) {
                return;
            }

            const container =
                document.getElementById(
                    'blog-article-content'
                );

            /*
             * The article may not have been mounted yet.
             */

            if (!container) {
                attempts += 1;

                if (attempts < 30) {
                    timer =
                        window.setTimeout(
                            setupToc,
                            50
                        );
                }

                return;
            }

            const items =
                getTocFromArticle(
                    container
                );

            if (cancelled) {
                return;
            }

            setTocItems(items);
            setTocOpen(true);

            if (
                items.length > 0
            ) {
                setActiveTocId(
                    items[0].id
                );
            }

            /*
             * After article HTML is mounted,
             * force page back to top.
             *
             * This prevents browser restoration
             * from opening the article at the end.
             */

            forcePageTop();

            window.requestAnimationFrame(
                () => {
                    if (!cancelled) {
                        forcePageTop();
                    }
                }
            );
        };

        timer =
            window.setTimeout(
                setupToc,
                0
            );

        return () => {
            cancelled = true;

            if (
                timer !== undefined
            ) {
                window.clearTimeout(
                    timer
                );
            }
        };
    }, [post]);

    /* =======================================================
       ACTIVE TOC HEADING
    ======================================================= */

    useEffect(() => {
        if (
            tocItems.length === 0
        ) {
            return;
        }

        const updateActiveHeading =
            () => {
                const article =
                    document.getElementById(
                        'blog-article-content'
                    );

                if (!article) {
                    return;
                }

                const headingElements =
                    tocItems
                        .map((item) => {
                            const element =
                                Array.from(
                                    article.querySelectorAll(
                                        'h2, h3'
                                    )
                                ).find(
                                    (heading) =>
                                        heading.getAttribute(
                                            'id'
                                        ) === item.id
                                ) as
                                    | HTMLElement
                                    | undefined;

                            return {
                                item,
                                element,
                            };
                        })
                        .filter(
                            (
                                entry
                            ): entry is {
                                item: TocItem;
                                element: HTMLElement;
                            } =>
                                Boolean(
                                    entry.element
                                )
                        );

                if (
                    headingElements.length ===
                    0
                ) {
                    return;
                }

                const currentPosition =
                    window.scrollY +
                    TOC_SCROLL_OFFSET +
                    30;

                let currentId =
                    headingElements[0]
                        .item.id;

                headingElements.forEach(
                    ({
                        item,
                        element,
                    }) => {
                        const top =
                            element
                                .getBoundingClientRect()
                                .top +
                            window.scrollY;

                        if (
                            top <=
                            currentPosition
                        ) {
                            currentId =
                                item.id;
                        }
                    }
                );

                setActiveTocId(
                    currentId
                );
            };

        updateActiveHeading();

        window.addEventListener(
            'scroll',
            updateActiveHeading,
            {
                passive: true,
            }
        );

        return () => {
            window.removeEventListener(
                'scroll',
                updateActiveHeading
            );
        };
    }, [tocItems]);

    /* =======================================================
CHAT GAME LOGIC
======================================================= */

    const startChatGame = () => {
  setChatGameStarted(true);
  setCurrentChatQuestion(0);
  setChatAnswers([]);
  setChatGameFinished(false);
};

const handleChatAnswer = (answer: string) => {
  setChatAnswers((previousAnswers) => [
    ...previousAnswers,
    answer,
  ]);

  if (
    !post?.chatGameData?.questions ||
    currentChatQuestion >=
      post.chatGameData.questions.length - 1
  ) {
    setChatGameFinished(true);
    return;
  }

  setCurrentChatQuestion(
    (previousQuestion) =>
      previousQuestion + 1
  );
};

const restartChatGame = () => {
  setCurrentChatQuestion(0);
  setChatAnswers([]);
  setChatGameFinished(false);
  setChatGameStarted(true);
};
    
    /* =======================================================
       IMAGE ERROR
    ======================================================= */

    const handleImageError =
        () => {
            if (
                !imageFallbackTried &&
                imageSrc !==
                    DEFAULT_BLOG_IMAGE
            ) {
                const localFallback =
                    getLocalImageFallback(
                        post?.image_url
                    );

                if (
                    localFallback !==
                        imageSrc &&
                    localFallback !==
                        DEFAULT_BLOG_IMAGE
                ) {
                    setImageFallbackTried(
                        true
                    );

                    setImageLoaded(false);

                    setImageSrc(
                        localFallback
                    );

                    return;
                }
            }

            if (
                imageSrc !==
                DEFAULT_BLOG_IMAGE
            ) {
                setImageFallbackTried(
                    true
                );

                setImageLoaded(false);

                setImageSrc(
                    DEFAULT_BLOG_IMAGE
                );
            }
        };

    /* =======================================================
       SEO IMAGE
    ======================================================= */

    const seoImage =
        useMemo(() => {
            return resolveBlogImage(
                post?.image_url
            );
        }, [post]);

    /* =======================================================
       CANONICAL URL
    ======================================================= */

    const canonicalUrl =
        useMemo(() => {
            if (!post) {
                return `${BRAND.domain}/blog/${
                    slug || ''
                }`;
            }

            return `${BRAND.domain}/blog/${post.slug}`;
        }, [post, slug]);

    /* =======================================================
       STRUCTURED DATA
    ======================================================= */

    const structuredData =
        useMemo(() => {
            if (!post) {
                return null;
            }

            return {
                '@context':
                    'https://schema.org',

                '@type':
                    'Article',

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
                    '@type':
                        'Person',

                    name:
                        post.author ||
                        'Loveons Editorial',
                },

                publisher: {
                    '@type':
                        'Organization',

                    name:
                        BRAND.name,

                    url:
                        BRAND.domain,
                },

                datePublished:
                    post.published_at ||
                    post.created_at,

                dateModified:
                    post.updated_at ||
                    post.published_at ||
                    post.created_at,

                mainEntityOfPage: {
                    '@type':
                        'WebPage',

                    '@id':
                        canonicalUrl,
                },

                url:
                    canonicalUrl,

                articleSection:
                    post.category,

                keywords:
                    post.tags &&
                    post.tags.length > 0
                        ? post.tags.join(
                              ', '
                          )
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
                type="article"
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

                        {/* =================================================
                            FEATURED IMAGE
                        ================================================= */}

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
                                    setImageLoaded(
                                        true
                                    );
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

                        {/* =================================================
                            TITLE
                        ================================================= */}

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

                        {/* =================================================
                            EXCERPT
                        ================================================= */}

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

                        {/* =================================================
                            META
                        ================================================= */}

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

                       {/* =================================================
                       SHARE ARTICLE 
                        ================================================= */}
                        <BlogShare title={post.title} />                        
{/* =================================================
CHAT GAME
================================================= */}
{post.enableChatGame &&
  post.chatGameData?.questions &&
  post.chatGameData.questions.length > 0 && (
    <section
      className="
        mb-6
        rounded-2xl
        border
        border-rose-100
        bg-rose-50/40
        p-5
        sm:p-6
      "
    >
      {!chatGameStarted ? (
        <div className="text-center">
          <h2 className="mb-2 text-xl font-bold text-gray-800">
            Let's Play a Quick Game ✨
          </h2>

          <p className="mb-5 text-sm leading-6 text-gray-600">
            Answer a few quick questions and explore the topic.
          </p>

          <button
            type="button"
            onClick={startChatGame}
            className="
              rounded-full
              border-0
              bg-gradient-to-r
              from-rose-500
              to-pink-500
              px-5
              py-2.5
              text-sm
              font-semibold
              text-white
              shadow-md
              transition
              hover:scale-105
              hover:shadow-lg
            "
                                                                                                 
          >
            Start Game
          </button>
        </div>
      ) : chatGameFinished ? (
        <div className="text-center">
          <h2 className="mb-5 text-xl font-bold text-gray-800">
            🎉 Great Job! Keep Exploring
          </h2>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                document
                  .getElementById('blog-article-content')
                  ?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  });
              }}
                    className="
                      rounded-full
                      border-0
                      bg-gradient-to-r
                      from-rose-500
                      to-pink-500
                      px-5
                      py-2.5
                      text-sm
                      font-semibold
                      text-white
                      shadow-md
                      transition
                      hover:scale-105
                      hover:shadow-lg
                    "       
                                                                                               
            >
              Continue Reading ↓
            </button>

            <button
              type="button"
              onClick={restartChatGame}
              className="
                rounded-full
                border-0
                bg-gradient-to-r
                from-rose-500
                to-pink-500
                px-5
                py-2.5
                text-sm
                font-semibold
                text-white
                shadow-md
                transition
                hover:scale-105
                hover:shadow-lg
            "
                                                                                                                                               
         >
              Play Again
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-rose-500">
            Question {currentChatQuestion + 1} of{' '}
            {post.chatGameData.questions.length}
          </p>

          <h2 className="mb-5 text-lg font-bold leading-7 text-gray-800">
            {
              post.chatGameData.questions[
                currentChatQuestion
              ]?.question
            }
          </h2>

          <div className="space-y-3">
            {post.chatGameData.questions[
              currentChatQuestion
            ]?.options?.map(
              (option: string) => (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    handleChatAnswer(option)
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-rose-100
                    bg-white
                    px-4
                    py-3
                    text-left
                    text-sm
                    font-medium
                    text-gray-700
                    transition
                    hover:border-rose-300
                    hover:bg-rose-50
                  "
                >
                  {option}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </section>
  )}

                    
                        {/* =================================================
                            TABLE OF CONTENTS
                        ================================================= */}

                        {tocItems.length > 0 && (
                            <aside
                                aria-label="Table of Contents"
                                className="
                                    mb-8
                                    rounded-2xl
                                    border
                                    border-rose-100
                                    bg-white
                                    shadow-sm
                                "
                            <
                               <button
                                 type="button"
                                 onClick={() => {
                                   setTocOpen(
                                     (current) =>
                                        !current
                                  );
                                }}
                                aria-expanded={tocOpen}
                                  className="
                                    flex
                                    h-12
                                    w-full
                                    items-center
                                    justify-between
                                    gap-3
                                    px-4
                                    text-left
                                 "
                               >                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
                               <span className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-rose-500" />

                                        <span className="font-display text-sm font-bold text-gray-800">
                                            Table of Contents
                                        </span>
                                    </span>

                                    {tocOpen ? (
                                        <ChevronUp className="h-4 w-4 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                    )}
                                </button>

                                {tocOpen && (
                                      
                                <nav
                                  className="
                                  max-h-48
                                  overflow-y-auto
                                  border-t
                                  border-rose-50
                                  px-3
                                  py-3
                                "
                             >
                                 <ol className="space-y-1">
                                                                                                                                                                                                                                                                                                                                                                         {tocItems.map(
                                            (item) => (
                                                    <li
                                                        key={
                                                            item.id
                                                        }
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setActiveTocId(
                                                                    item.id
                                                                );

                                                                scrollToHeading(
                                                                    item.id
                                                                );
                                                            }}
                                                            className={`
                                                                w-full
                                                                rounded-lg
                                                                px-3
                                                                py-2
                                                                text-left
                                                                leading-5
                                                                transition

                                                                ${
                                                                    item.level ===
                                                                    3
                                                                        ? 'pl-7 text-xs'
                                                                        : 'pl-3 text-sm'
                                                                }

                                                                ${
                                                                    activeTocId ===
                                                                    item.id
                                                                        ? 'bg-rose-50 font-semibold text-rose-600'
                                                                        : 'text-gray-500 hover:bg-rose-50/70 hover:text-rose-600'
                                                                }
                                                            `}
                                                        >
                                                            {
                                                                item.text
                                                            }
                                                        </button>
                                                    </li>
                                                )
                                            )}
                                        </ol>
                                    </nav>
                                )}
                            </aside>
                        )}

                        {/* =================================================
                            TEXT TO SPEECH
                            
                            IMPORTANT:
                            BlogTTS reads ONLY the element whose
                            ID is "blog-article-content".

                            Therefore TOC, tags, related articles
                            and footer are NOT part of TTS reading.
                        ================================================= */}

                        <div className="mb-5 flex justify-start">
                            <BlogTTS
                                contentId="blog-article-content"
                            />
                        </div>

                        {/* =================================================
                            ARTICLE CONTENT
                        ================================================= */}

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
                                [&_h1]:scroll-mt-28
                                [&_h1]:font-display
                                [&_h1]:text-2xl
                                [&_h1]:font-bold
                                [&_h1]:leading-tight
                                [&_h1]:text-gray-800

                                [&_h2]:mb-3
                                [&_h2]:mt-8
                                [&_h2]:scroll-mt-28
                                [&_h2]:font-display
                                [&_h2]:text-xl
                                [&_h2]:font-bold
                                [&_h2]:leading-tight
                                [&_h2]:text-gray-800

                                [&_h3]:mb-3
                                [&_h3]:mt-7
                                [&_h3]:scroll-mt-28
                                [&_h3]:font-display
                                [&_h3]:text-lg
                                [&_h3]:font-bold
                                [&_h3]:leading-tight
                                [&_h3]:text-gray-800

                                [&_h4]:mb-2
                                [&_h4]:mt-6
                                [&_h4]:scroll-mt-28
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

                                [&_a:hover]:text-rose-600

                                [&_strong]:font-semibold
                                [&_strong]:text-gray-800

                                [&_em]:italic

                                [&_hr]:my-8
                                [&_hr]:border-rose-100
                            "
                            
                                dangerouslySetInnerHTML={{
                                   __html: addHeadingIds(post.content || ''),
                            }}        
                            />

                        {/* =================================================
                            TAGS
                        ================================================= */}

                        {post.tags &&
                            post.tags.length >
                                0 && (
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
                                                key={
                                                    tag
                                                }
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
                   COMMENTS
                   ================================================= */}
                   <BlogComments articleSlug={post.slug} />

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
                                    (
                                        relatedPost
                                    ) => (
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
