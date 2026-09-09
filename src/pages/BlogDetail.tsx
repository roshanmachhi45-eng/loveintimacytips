import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Calendar, ChevronDown, ChevronUp, Clock, Loader2, User } from 'lucide-react';
import Seo from '../components/Seo';
import BlogCard from '../components/BlogCard';
import BlogTTS from '../components/BlogTTS';
import BlogShare from '../components/BlogShare';
import BlogComments from "../components/BlogComments";
import { fetchPostBySlug, fetchRelatedPosts, type BlogPost } from '../lib/blogApi';
import { BRAND } from '../lib/brand';

interface TocItem { id: string; text: string; level: 2 | 3; }
const DEFAULT_BLOG_IMAGE = '/images/blogs/default.webp';
const TOC_SCROLL_OFFSET = 110;

function formatDate(d: string | null | undefined): string {
    if (!d) return '';
    const date = new Date(d);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function resolveBlogImage(src: string | null | undefined): string {
    if (!src) return DEFAULT_BLOG_IMAGE;
    const v = src.trim();
    if (v.startsWith('/') || v.startsWith('http://') || v.startsWith('https://')) return v;
    return `/images/blogs/${v}`;
}

function getTocFromArticle(container: HTMLElement): TocItem[] {
    return Array.from(container.querySelectorAll('h2, h3')).map((h) => {
        const id = h.getAttribute('id'), text = h.textContent?.trim() || '';
        return (!id || !text) ? null : { id, text, level: h.tagName.toLowerCase() === 'h3' ? 3 : 2 };
    }).filter((item): item is TocItem => item !== null);
}

function scrollToHeading(id: string): void {
    const article = document.getElementById('blog-article-content'); if (!article) return;
    const target = Array.from(article.querySelectorAll('h2, h3')).find((h) => h.getAttribute('id') === id) as HTMLElement | undefined; if (!target) return;
    window.scrollTo({ top: Math.max(0, window.scrollY + target.getBoundingClientRect().top - TOC_SCROLL_OFFSET), left: 0, behavior: 'smooth' });
}

function forcePageTop(): void {
    try { if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'; } catch {}
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
}

export default function BlogDetail() {
    const { slug } = useParams<{ slug: string }>();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [related, setRelated] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [imageSrc, setImageSrc] = useState(DEFAULT_BLOG_IMAGE);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [tocItems, setTocItems] = useState<TocItem[]>([]);
    const [tocOpen, setTocOpen] = useState(true);
    const [activeTocId, setActiveTocId] = useState<string | null>(null);

    const [chatGameStarted, setChatGameStarted] = useState(false);
    const [currentChatQuestion, setCurrentChatQuestion] = useState(0);
    const [chatAnswers, setChatAnswers] = useState<string[]>([]);
    const [chatGameFinished, setChatGameFinished] = useState(false);
    
    useEffect(() => { setChatGameStarted(false); setCurrentChatQuestion(0); setChatAnswers([]); setChatGameFinished(false); }, [slug]);
    
    useLayoutEffect(() => {
        if (window.location.hash) window.history.replaceState(null, '', window.location.pathname + window.location.search);
        forcePageTop();
        const frame1 = window.requestAnimationFrame(() => { forcePageTop(); window.requestAnimationFrame(() => forcePageTop()); });
        return () => window.cancelAnimationFrame(frame1);
    }, [slug]);

    useEffect(() => {
        let cancelled = false;
        async function loadArticle() {
            if (!slug) { setLoading(false); setError('Article not found.'); return; }
            setLoading(true); setError(''); setPost(null); setRelated([]); setTocItems([]); setActiveTocId(null); setTocOpen(true);
            try {
                const data = await fetchPostBySlug(slug); if (cancelled) return;
                if (!data) { setError('Article not found.'); return; }
                setPost(data);
                try {
                    const relatedData = await fetchRelatedPosts(data.category, data.slug, 3);
                    if (!cancelled) setRelated(relatedData || []);
                } catch (e) { if (!cancelled) setRelated([]); }
            } catch (err) { if (!cancelled) setError('Unable to load this article.'); }
            finally { if (!cancelled) setLoading(false); }
        }
        loadArticle(); return () => { cancelled = true; };
    }, [slug]);

    useEffect(() => {
        if (!post) { setImageSrc(DEFAULT_BLOG_IMAGE); setImageLoaded(false); return; }
        setImageSrc(resolveBlogImage(post.image_url)); setImageLoaded(false);
    }, [post]);

    useEffect(() => {
        if (!post) { setTocItems([]); return; }
        let cancelled = false; let attempts = 0; let timer: number | undefined;
        const setupToc = () => {
            if (cancelled) return; const container = document.getElementById('blog-article-content');
            if (!container) { attempts += 1; if (attempts < 30) timer = window.setTimeout(setupToc, 50); return; }
            const items = getTocFromArticle(container); if (cancelled) return;
            setTocItems(items); setTocOpen(true); if (items.length > 0) setActiveTocId(items[0].id);
            forcePageTop(); window.requestAnimationFrame(() => { if (!cancelled) forcePageTop(); });
        };
        timer = window.setTimeout(setupToc, 0); return () => { cancelled = true; if (timer !== undefined) window.clearTimeout(timer); };
    }, [post]);

    useEffect(() => {
        if (tocItems.length === 0) return;
        const updateActiveHeading = () => {
            const article = document.getElementById('blog-article-content'); if (!article) return;
            const headingElements = tocItems.map((item) => {
                const element = Array.from(article.querySelectorAll('h2, h3')).find((h) => h.getAttribute('id') === item.id) as HTMLElement | undefined;
                return { item, element };
            }).filter((entry): entry is { item: TocItem; element: HTMLElement } => Boolean(entry.element));
            if (headingElements.length === 0) return;
            const currentPosition = window.scrollY + TOC_SCROLL_OFFSET + 30; let currentId = headingElements[0].item.id;
            headingElements.forEach(({ item, element }) => {
                if (element.getBoundingClientRect().top + window.scrollY <= currentPosition) currentId = item.id;
            });
            setActiveTocId(currentId);
        };
        updateActiveHeading(); window.addEventListener('scroll', updateActiveHeading, { passive: true });
        return () => window.removeEventListener('scroll', updateActiveHeading);
    }, [tocItems]);

    const seoImage = useMemo(() => resolveBlogImage(post?.image_url), [post]);
    const canonicalUrl = useMemo(() => post ? `${BRAND.domain}/blog/${post.slug}` : `${BRAND.domain}/blog/${slug || ''}`, [post, slug]);

    const structuredData = useMemo(() => {
        if (!post) return null;
        return {
            '@context': 'https://schema.org', '@type': 'Article',
            headline: post.meta_title || post.title, description: post.meta_description || post.excerpt, image: [seoImage],
            author: { '@type': 'Person', name: post.author || 'Loveons Editorial' },
            publisher: { '@type': 'Organization', name: BRAND.name, url: BRAND.domain },
            datePublished: post.published_at || post.created_at, dateModified: post.updated_at || post.published_at || post.created_at,
            mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl }, url: canonicalUrl, articleSection: post.category,
            keywords: post.tags && post.tags.length > 0 ? post.tags.join(', ') : undefined,
        };
    }, [post, seoImage, canonicalUrl]);

    if (loading) return <div className="flex min-h-screen items-center justify-center pt-20"><Loader2 className="h-6 w-6 animate-spin text-rose-400" /></div>;
    if (error || !post) return <div className="flex min-h-screen flex-col items-center justify-center px-4 pt-20"><p className="mb-4 text-sm text-gray-500">{error || 'Article not found.'}</p><Link to="/" className="text-sm font-semibold text-rose-500">Back to Home</Link></div>;

    return (
        <>
            <Seo title={post.meta_title || post.title} description={post.meta_description || post.excerpt} path={`/blog/${post.slug}`} ogImage={seoImage} type="article" />
            {structuredData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />}
            <div className="min-h-screen pb-12 pt-14">
                <div className="mx-auto max-w-2xl px-4">
                    <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-rose-500 transition-all hover:gap-2"><ArrowLeft className="h-4 w-4" />Back to Home</Link>
                    <article>
                        <div className="relative mb-6 h-56 overflow-hidden rounded-3xl bg-rose-50 sm:h-64">
                            {!imageLoaded && <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-rose-50 to-rose-100" />}
                            <img src={imageSrc} alt={post.image_alt || post.title} loading="eager" decoding="async" onLoad={() => setImageLoaded(true)} onError={() => setImageSrc(DEFAULT_BLOG_IMAGE)} className={`relative z-10 h-full w-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`} />
                            {post.category && <span className="absolute left-3 top-3 z-20 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-rose-600 backdrop-blur-sm">{post.category}</span>}
                        </div>



