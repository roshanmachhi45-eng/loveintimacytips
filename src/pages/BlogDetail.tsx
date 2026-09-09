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
   TOC HELPERS
========================================================= */

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

function scrollToHeading(
    id: string
): void {
    const article =
        document.getElementById(
            'blog-article-content'
        );

    if (!article) return;

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

    if (!target) return;

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

function forcePageTop(): void {
    try {
        if (
            'scrollRestoration' in
            window.history
        ) {
            window.history.scrollRestoration =
                'manual';
        }
    } catch {
        // Ignore.
    }

    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto',
    });
}

function addHeadingIds(html: string): string {
    if (!html.trim()) {
        return '';
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const usedIds = new Set<string>();

    doc.querySelectorAll('h1, h2, h3, h4').forEach((heading, index) => {
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

/* =========================================================
   MAIN COMPONENT
========================================================= */

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

    /* CHAT GAME STATE */
    const [chatGameStarted, setChatGameStarted] = useState(false);
    const [currentChatQuestion, setCurrentChatQuestion] = useState(0);
    const [chatAnswers, setChatAnswers] = useState<string[]>([]);
    const [chatGameFinished, setChatGameFinished] = useState(false);
    
    useEffect(() => {
        setChatGameStarted(false);
        setCurrentChatQuestion(0);
        setChatAnswers([]);
        setChatGameFinished(false);
    }, [slug]);
    
    /* SCROLL RESET */
    useLayoutEffect(() => {
        if (window.location.hash) {
            window.history.replaceState(
                null,
                '',
                window.location.pathname + window.location.search
            );
        }

        forcePageTop();

        const frame1 = window.requestAnimationFrame(() => {
            forcePageTop();
            window.requestAnimationFrame(() => {
                forcePageTop();
            });
        });

        return () => {
            window.cancelAnimationFrame(frame1);
        };
    }, [slug]);

    /* LOAD DATA */
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
            setTocItems([]);
            setActiveTocId(null);
            setTocOpen(true);

            try {
                const data = await fetchPostBySlug(slug);
                if (cancelled) return;

                if (!data) {
                    setError('Article not found.');
                    return;
                }

                setPost(data);

                try {


