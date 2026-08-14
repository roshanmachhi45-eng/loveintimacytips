
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ChangeEvent,
  type FormEvent,
} from 'react';

import {
  Plus,
  Trash2,
  Pencil,
  X,
  Upload,
  Eye,
  EyeOff,
  Loader2,
  ExternalLink,
  FileText,
  Search,
  Save,
  Link as LinkIcon,
  Unlink,
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
} from 'lucide-react';

import Seo from '../components/Seo';
import PageLayout from '../components/PageLayout';
import BlogImage from '../components/BlogImage';

import {
  fetchAllPosts,
  createPost,
  updatePost,
  deletePost,
  uploadBlogImage,
  slugify,
  estimateReadingTime,
  type BlogPost,
} from '../lib/blogApi';

import { BLOG_CATEGORIES } from '../lib/blog';

const PLACEHOLDER_IMAGE =
  '/images/blogs/default.webp';

/* =========================================================
   FORM TYPE
   ========================================================= */

interface FormData {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  image_url: string;
  image_alt: string;
  author: string;
  tags: string;
  meta_title: string;
  meta_description: string;
}

const emptyForm: FormData = {
  title: '',
  slug: '',
  category: 'Communication',
  excerpt: '',
  content: '',
  image_url: '',
  image_alt: '',
  author: 'Loveons Editorial',
  tags: '',
  meta_title: '',
  meta_description: '',
};

/* =========================================================
   HELPERS
   ========================================================= */

function makeTags(value: string): string[] {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function createPayload(
  form: FormData,
  published: boolean,
  existingPublishedAt?: string | null
) {
  const finalSlug = slugify(
    form.slug || form.title
  );

  const readingTime =
    estimateReadingTime(form.content);

  return {
    title: form.title.trim(),

    slug: finalSlug,

    category: form.category,

    excerpt: form.excerpt.trim(),

    content: form.content.trim(),

    image_url:
      form.image_url.trim() || null,

    image_alt:
      form.image_alt.trim() ||
      form.title.trim(),

    author:
      form.author.trim() ||
      'Loveons Editorial',

    published,

    published_at: published
      ? existingPublishedAt ||
        new Date().toISOString()
      : existingPublishedAt || null,

    reading_time: readingTime,

    tags: makeTags(form.tags),

    meta_title:
      form.meta_title.trim() ||
      form.title.trim(),

    meta_description:
      form.meta_description.trim() ||
      form.excerpt.trim(),
  };
}

/* =========================================================
   LINK HELPERS
   ========================================================= */

function isValidLink(url: string) {
  const value = url.trim();

  if (!value) {
    return false;
  }

  /*
   * Internal links:
   * /blog/example
   * /blog?category=Dating
   */
  if (value.startsWith('/')) {
    return true;
  }

  /*
   * External links.
   */
  try {
    const parsed = new URL(value);

    return (
      parsed.protocol === 'http:' ||
      parsed.protocol === 'https:'
    );
  } catch {
    return false;
  }
}

/* =========================================================
   BLOG ADMIN
   ========================================================= */

export default function BlogAdmin() {
  const [posts, setPosts] =
    useState<BlogPost[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<FormData>(emptyForm);

  const [uploading, setUploading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState('');

  const [search, setSearch] =
    useState('');

  const [filter, setFilter] =
    useState<
      'all' | 'published' | 'draft'
    >('all');

  /*
   * Article textarea reference.
   *
   * Used for inserting links/formatting
   * exactly where the cursor/selection is.
   */
  const contentRef =
    useRef<HTMLTextAreaElement | null>(
      null
    );

  /*
   * Link editor.
   */
  const [linkOpen, setLinkOpen] =
    useState(false);

  const [linkText, setLinkText] =
    useState('');

  const [linkUrl, setLinkUrl] =
    useState('');

  /* =======================================================
     LOAD POSTS
     ======================================================= */

  const loadPosts = useCallback(
    async () => {
      try {
        setLoading(true);
        setError('');

        const data =
          await fetchAllPosts();

        setPosts(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load posts'
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  /* =======================================================
     RESET
     ======================================================= */

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);

    setLinkOpen(false);
    setLinkText('');
    setLinkUrl('');

    setError('');
  };

  const openNewArticle = () => {
    setEditingId(null);
    setForm(emptyForm);

    setLinkOpen(false);
    setLinkText('');
    setLinkUrl('');

    setError('');
    setShowForm(true);
  };

  /* =======================================================
     IMAGE UPLOAD
     ======================================================= */

  const handleImageUpload = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);
      setError('');

      const url =
        await uploadBlogImage(file);

      setForm((current) => ({
        ...current,
        image_url: url,
      }));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Image upload failed'
      );
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  /* =======================================================
     VALIDATION
     ======================================================= */

  const validateForm = () => {
    if (!form.title.trim()) {
      setError(
        'Please enter a blog title.'
      );
      return false;
    }

    if (!form.excerpt.trim()) {
      setError(
        'Please enter a short description.'
      );
      return false;
    }

    if (!form.content.trim()) {
      setError(
        'Please enter the article content.'
      );
      return false;
    }

    const finalSlug = slugify(
      form.slug || form.title
    );

    if (!finalSlug) {
      setError(
        'Please enter a valid title or slug.'
      );
      return false;
    }

    return true;
  };

  /* =======================================================
     SAVE ARTICLE
     ======================================================= */

  const saveArticle = async (
    published: boolean
  ) => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError('');

      const existingPost = editingId
        ? posts.find(
            (post) =>
              post.id === editingId
          )
        : null;

      const payload = createPayload(
        form,
        published,
        existingPost?.published_at
      );

      if (editingId) {
        await updatePost(
          editingId,
          payload
        );
      } else {
        await createPost(
          payload as Omit<
            BlogPost,
            'id' |
              'created_at' |
              'updated_at'
          >
        );
      }

      await loadPosts();

      resetForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save article'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (
    e: FormEvent
  ) => {
    e.preventDefault();

    await saveArticle(false);
  };

  /* =======================================================
     EDIT
     ======================================================= */

  const handleEdit = (
    post: BlogPost
  ) => {
    setEditingId(post.id);

    setForm({
      title: post.title,

      slug: post.slug,

      category: post.category,

      excerpt: post.excerpt,

      content: post.content,

      image_url:
        post.image_url || '',

      image_alt:
        post.image_alt || '',

      author:
        post.author ||
        'Loveons Editorial',

      tags: post.tags.join(', '),

      meta_title:
        post.meta_title || '',

      meta_description:
        post.meta_description || '',
    });

    setLinkOpen(false);
    setLinkText('');
    setLinkUrl('');

    setError('');
    setShowForm(true);
  };

  /* =======================================================
     DELETE
     ======================================================= */

  const handleDelete = async (
    id: string
  ) => {
    const confirmed =
      window.confirm(
        'Delete this article permanently? This action cannot be undone.'
      );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError('');

      await deletePost(id);

      await loadPosts();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Delete failed'
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* =======================================================
     PUBLISH / UNPUBLISH
     ======================================================= */

  const togglePublish = async (
    post: BlogPost
  ) => {
    try {
      setError('');

      const nextPublished =
        !post.published;

      await updatePost(
        post.id,
        {
          published:
            nextPublished,

          published_at:
            nextPublished
              ? post.published_at ||
                new Date().toISOString()
              : post.published_at,
        }
      );

      await loadPosts();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Publish status update failed'
      );
    }
  };

  /* =======================================================
     OPEN ARTICLE
     ======================================================= */

  const openArticle = (
    post: BlogPost
  ) => {
    window.open(
      `/blog/${post.slug}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  /* =======================================================
     INSERT TEXT AT CURSOR
     ======================================================= */

  const insertIntoContent = (
    value: string,
    selectionStart?: number,
    selectionEnd?: number
  ) => {
    const textarea =
      contentRef.current;

    if (!textarea) {
      setForm((current) => ({
        ...current,
        content:
          current.content + value,
      }));

      return;
    }

    const start =
      selectionStart ??
      textarea.selectionStart;

    const end =
      selectionEnd ??
      textarea.selectionEnd;

    const currentContent =
      form.content;

    const newContent =
      currentContent.slice(
        0,
        start
      ) +
      value +
      currentContent.slice(end);

    setForm((current) => ({
      ...current,
      content: newContent,
    }));

    /*
     * Put cursor after inserted content.
     */
    requestAnimationFrame(() => {
      textarea.focus();

      const nextPosition =
        start + value.length;

      textarea.setSelectionRange(
        nextPosition,
        nextPosition
      );
    });
  };

  /* =======================================================
     OPEN LINK EDITOR
     ======================================================= */

  const openLinkEditor = () => {
    const textarea =
      contentRef.current;

    if (!textarea) {
      setLinkText('');
      setLinkUrl('');
      setLinkOpen(true);
      return;
    }

    const start =
      textarea.selectionStart;

    const end =
      textarea.selectionEnd;

    const selected =
      form.content.slice(
        start,
        end
      );

    setLinkText(selected);

    setLinkUrl('');

    setLinkOpen(true);
  };

  /* =======================================================
     ADD LINK
     ======================================================= */

  const addLink = () => {
    const text =
      linkText.trim();

    const url =
      linkUrl.trim();

    if (!text) {
      setError(
        'Select some text or enter link text first.'
      );
      return;
    }

    if (!isValidLink(url)) {
      setError(
        'Enter a valid internal or external URL.'
      );
      return;
    }

    const textarea =
      contentRef.current;

    const start =
      textarea?.selectionStart ??
      form.content.length;

    const end =
      textarea?.selectionEnd ??
      start;

    const markdownLink =
      `[${text}](${url})`;

    insertIntoContent(
      markdownLink,
      start,
      end
    );

    setLinkOpen(false);
    setLinkText('');
    setLinkUrl('');
    setError('');
  };

  /* =======================================================
     REMOVE LINK FROM SELECTED TEXT
     ======================================================= */

  const removeLink = () => {
    const textarea =
      contentRef.current;

    if (!textarea) {
      return;
    }

    const start =
      textarea.selectionStart;

    const end =
      textarea.selectionEnd;

    if (start === end) {
      setError(
        'Select a linked text first.'
      );
      return;
    }

    const selected =
      form.content.slice(
        start,
        end
      );

    /*
     * Converts:
     *
     * [Text](url)
     *
     * back to:
     *
     * Text
     */
    const plainText =
      selected.replace(
        /^\[([\s\S]+)\]\(([^)]+)\)$/,
        '$1'
      );

    if (plainText === selected) {
      setError(
        'Selected text does not look like a blog link.'
      );
      return;
    }

    insertIntoContent(
      plainText,
      start,
      end
    );

    setError('');
  };

  /* =======================================================
     SIMPLE MARKDOWN FORMATTING
     ======================================================= */

  const wrapSelection = (
    before: string,
    after: string = before
  ) => {
    const textarea =
      contentRef.current;

    if (!textarea) return;

    const start =
      textarea.selectionStart;

    const end =
      textarea.selectionEnd;

    const selected =
      form.content.slice(
        start,
        end
      );

    if (!selected) {
      setError(
        'Select some text first.'
      );
      return;
    }

    insertIntoContent(
      `${before}${selected}${after}`,
      start,
      end
    );

    setError('');
  };

  const addHeading = () => {
    wrapSelection('## ', '');
  };

  const addBullet = () => {
    wrapSelection('• ', '');
  };

  const addNumbered = () => {
    wrapSelection('1. ', '');
  };

  /* =======================================================
     SEARCH / FILTER
     ======================================================= */

  const filteredPosts =
    posts.filter((post) => {
      const query =
        search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        post.title
          .toLowerCase()
          .includes(query) ||
        post.category
          .toLowerCase()
          .includes(query) ||
        post.slug
          .toLowerCase()
          .includes(query) ||
        post.tags.some((tag) =>
          tag
            .toLowerCase()
            .includes(query)
        );

      const matchesFilter =
        filter === 'all' ||
        (filter === 'published' &&
          post.published) ||
        (filter === 'draft' &&
          !post.published);

      return (
        matchesSearch &&
        matchesFilter
      );
    });

  const publishedCount =
    posts.filter(
      (post) => post.published
    ).length;

  const draftCount =
    posts.filter(
      (post) => !post.published
    ).length;

  /* =======================================================
     UI
     ======================================================= */

  return (
    <>
      <Seo
        title="Blog Admin — Loveons"
        description="Manage Loveons blog articles, drafts, publishing and SEO metadata."
        path="/admin/blog"
      />

      <PageLayout
        title="Blog Admin"
        subtitle="Create, edit, draft and publish Loveons articles."
      >
        {/* ERROR */}

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* HEADER */}

        <div className="mb-5 rounded-3xl border border-rose-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-gray-800">
                Content Manager
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {posts.length} total ·{' '}
                {publishedCount}{' '}
                published ·{' '}
                {draftCount} drafts
              </p>
            </div>

            <button
              type="button"
              onClick={
                openNewArticle
              }
              className="flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />

              New Article
            </button>
          </div>

          {/* SEARCH + FILTER */}

          <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="search"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search articles, categories or tags..."
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-rose-300 focus:bg-white focus:ring-2 focus:ring-rose-100"
              />
            </div>

            <div className="flex rounded-2xl border border-gray-200 bg-gray-50 p-1">
              {[
                ['all', 'All'],
                [
                  'published',
                  'Published',
                ],
                ['draft', 'Drafts'],
              ].map(
                ([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setFilter(
                        value as
                          | 'all'
                          | 'published'
                          | 'draft'
                      )
                    }
                    className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                      filter === value
                        ? 'bg-white text-rose-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* ARTICLE LIST */}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-7 w-7 animate-spin text-rose-400" />
          </div>
        ) : filteredPosts.length ===
          0 ? (
          <div className="rounded-3xl border border-dashed border-rose-200 bg-white px-6 py-16 text-center">
            <FileText className="mx-auto h-10 w-10 text-rose-200" />

            <h3 className="mt-4 text-sm font-semibold text-gray-700">
              {posts.length ===
              0
                ? 'No articles yet'
                : 'No matching articles'}
            </h3>

            <p className="mt-1 text-sm text-gray-400">
              {posts.length ===
              0
                ? 'Create your first article to start building the blog.'
                : 'Try another search or filter.'}
            </p>

            {posts.length ===
              0 && (
              <button
                type="button"
                onClick={
                  openNewArticle
                }
                className="mt-5 rounded-2xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
              >
                Create Article
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPosts.map(
              (post) => (
                <article
                  key={post.id}
                  className="rounded-3xl border border-rose-100 bg-white p-3 shadow-sm transition hover:shadow-md sm:p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-rose-50 sm:h-20 sm:w-20">
                      <BlogImage
                        src={
                          post.image_url
                        }
                        alt={
                          post.image_alt ||
                          post.title
                        }
                        className="h-full w-full"
                        loading="lazy"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-bold text-gray-800 sm:text-base">
                        {post.title}
                      </h3>

                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-600">
                          {post.category}
                        </span>

                        {post.published ? (
                          <span className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-600">
                            Published
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500">
                            Draft
                          </span>
                        )}

                        {post.reading_time && (
                          <span className="text-[11px] text-gray-400">
                            {
                              post.reading_time
                            }
                          </span>
                        )}
                      </div>

                      <p className="mt-1 hidden truncate text-xs text-gray-400 sm:block">
                        /blog/
                        {post.slug}
                      </p>
                    </div>

                    <div className="flex flex-shrink-0 items-center gap-1">
                      {post.published && (
                        <button
                          type="button"
                          onClick={() =>
                            openArticle(
                              post
                            )
                          }
                          className="hidden rounded-xl p-2 transition hover:bg-blue-50 sm:block"
                          title="Open article"
                        >
                          <ExternalLink className="h-4 w-4 text-blue-500" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          togglePublish(
                            post
                          )
                        }
                        className="rounded-xl p-2 transition hover:bg-rose-50"
                        title={
                          post.published
                            ? 'Unpublish'
                            : 'Publish'
                        }
                      >
                        {post.published ? (
                          <Eye className="h-4 w-4 text-green-500" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(
                            post
                          )
                        }
                        className="rounded-xl p-2 transition hover:bg-rose-50"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4 text-gray-500" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            post.id
                          )
                        }
                        disabled={
                          deletingId ===
                          post.id
                        }
                        className="rounded-xl p-2 transition hover:bg-red-50 disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingId ===
                        post.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-red-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              )
            )}
          </div>
        )}

        {/* =================================================
            EDITOR MODAL
        ================================================= */}

        {showForm && (
          <div
            className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            onClick={resetForm}
          >
            <div
              className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              {/* MODAL HEADER */}

              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-rose-100 bg-white px-5 py-4 sm:px-6">
                <div>
                  <h2 className="font-display text-lg font-bold text-gray-800">
                    {editingId
                      ? 'Edit Article'
                      : 'New Article'}
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-400">
                    Save as draft first,
                    then publish when
                    ready.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    resetForm
                  }
                  className="rounded-xl p-2 transition hover:bg-rose-50"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <form
                onSubmit={
                  handleSubmit
                }
                className="space-y-5 p-5 sm:p-6"
              >
                {/* IMAGE */}

                <section className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <label className="mb-2 block text-xs font-bold text-gray-600">
                    Featured Image
                  </label>

                  <div className="flex gap-4">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border border-rose-100 bg-white">
                      <BlogImage
                        src={
                          form.image_url ||
                          PLACEHOLDER_IMAGE
                        }
                        alt={
                          form.image_alt ||
                          'Blog image preview'
                        }
                        className="h-full w-full"
                        loading="eager"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="block cursor-pointer">
                        <input
                          type="file"
                          accept="image/webp,image/avif,image/jpeg,image/png"
                          onChange={
                            handleImageUpload
                          }
                          className="hidden"
                        />

                        <div className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-500 transition hover:bg-rose-50">
                          {uploading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}

                          {uploading
                            ? 'Uploading...'
                            : 'Upload Image'}
                        </div>
                      </label>

                      <input
                        type="text"
                        value={
                          form.image_url
                        }
                        onChange={(e) =>
                          setForm({
                            ...form,
                            image_url:
                              e.target.value,
                          })
                        }
                        placeholder="Or paste image URL"
                        className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                      />
                    </div>
                  </div>
                </section>

                {/* BASIC CONTENT */}

                <section className="space-y-4">
                  {/* TITLE */}

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-gray-600">
                      Blog Title *
                    </label>

                    <input
                      type="text"
                      value={
                        form.title
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          title:
                            e.target.value,
                          slug:
                            editingId ||
                            form.slug
                              ? form.slug
                              : slugify(
                                  e.target
                                    .value
                                ),
                        })
                      }
                      placeholder="Enter article title"
                      className="w-full rounded-2xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                      required
                    />
                  </div>

                  {/* CATEGORY + SLUG */}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-gray-600">
                        Category *
                      </label>

                      <select
                        value={
                          form.category
                        }
                        onChange={(e) =>
                          setForm({
                            ...form,
                            category:
                              e.target
                                .value,
                          })
                        }
                        className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                      >
                        {BLOG_CATEGORIES.map(
                          (category) => (
                            <option
                              key={
                                category
                              }
                              value={
                                category
                              }
                            >
                              {
                                category
                              }
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-gray-600">
                        URL Slug *
                      </label>

                      <input
                        type="text"
                        value={
                          form.slug
                        }
                        onChange={(e) =>
                          setForm({
                            ...form,
                            slug: slugify(
                              e.target
                                .value
                            ),
                          })
                        }
                        placeholder="example-blog-slug"
                        className="w-full rounded-2xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                        required
                      />
                    </div>
                  </div>

                  {/* EXCERPT */}

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-gray-600">
                      Short Description *
                    </label>

                    <textarea
                      value={
                        form.excerpt
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          excerpt:
                            e.target
                              .value,
                        })
                      }
                      placeholder="Brief summary for blog cards and search engines"
                      rows={3}
                      className="w-full resize-none rounded-2xl border border-gray-200 px-3 py-3 text-sm leading-relaxed outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                      required
                    />
                  </div>

                  {/* =================================================
                      ARTICLE EDITOR
                  ================================================= */}

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-gray-600">
                      Article Content *
                    </label>

                    {/* TOOLBAR */}

                    <div className="flex flex-wrap items-center gap-1 rounded-t-2xl border border-b-0 border-gray-200 bg-gray-50 p-2">
                      <button
                        type="button"
                        onClick={() =>
                          wrapSelection(
                            '**',
                            '**'
                          )
                        }
                        title="Bold"
                        className="rounded-lg p-2 text-gray-600 hover:bg-white hover:text-rose-600"
                      >
                        <Bold className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          wrapSelection(
                            '*',
                            '*'
                          )
                        }
                        title="Italic"
                        className="rounded-lg p-2 text-gray-600 hover:bg-white hover:text-rose-600"
                      >
                        <Italic className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={
                          addHeading
                        }
                        title="Heading"
                        className="rounded-lg p-2 text-gray-600 hover:bg-white hover:text-rose-600"
                      >
                        <Heading2 className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={
                          addBullet
                        }
                        title="Bullet"
                        className="rounded-lg p-2 text-gray-600 hover:bg-white hover:text-rose-600"
                      >
                        <List className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={
                          addNumbered
                        }
                        title="Numbered"
                        className="rounded-lg p-2 text-gray-600 hover:bg-white hover:text-rose-600"
                      >
                        <ListOrdered className="h-4 w-4" />
                      </button>

                      <span className="mx-1 h-5 w-px bg-gray-200" />

                      {/* ADD LINK */}

                      <button
                        type="button"
                        onClick={
                          openLinkEditor
                        }
                        title="Add Link"
                        className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-2 text-xs font-semibold text-rose-600 shadow-sm ring-1 ring-rose-100 hover:bg-rose-50"
                      >
                        <LinkIcon className="h-4 w-4" />
                        Add Link
                      </button>

                      {/* REMOVE LINK */}

                      <button
                        type="button"
                        onClick={
                          removeLink
                        }
                        title="Remove Link"
                        className="rounded-lg p-2 text-gray-500 hover:bg-white hover:text-red-500"
                      >
                        <Unlink className="h-4 w-4" />
                      </button>
                    </div>

                    <textarea
                      ref={
                        contentRef
                      }
                      value={
                        form.content
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          content:
                            e.target
                              .value,
                        })
                      }
                      placeholder="Write your complete article here. Select text and use Add Link to create internal or external links."
                      rows={16}
                      className="w-full resize-y rounded-b-2xl border border-gray-200 px-3 py-3 text-sm leading-7 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                      required
                    />

                    <p className="mt-1.5 text-[11px] text-gray-400">
                      Select text → Add Link
                      → enter URL. Use
                      internal URLs such as
                      /blog/example for SEO-friendly
                      internal links.
                    </p>

                    {/* =================================================
                        LINK EDITOR
                    ================================================= */}

                    {linkOpen && (
                      <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50/60 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-gray-700">
                              Add Article Link
                            </h4>

                            <p className="mt-0.5 text-[11px] text-gray-400">
                              Internal links help
                              visitors discover
                              related articles.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setLinkOpen(
                                false
                              )
                            }
                            className="rounded-lg p-1.5 hover:bg-white"
                          >
                            <X className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          {/* LINK TEXT */}

                          <div>
                            <label className="mb-1 block text-[11px] font-bold text-gray-600">
                              Link Text
                            </label>

                            <input
                              type="text"
                              value={
                                linkText
                              }
                              onChange={(e) =>
                                setLinkText(
                                  e.target
                                    .value
                                )
                              }
                              placeholder="Example: Building Trust"
                              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                            />
                          </div>

                          {/* URL */}

                          <div>
                            <label className="mb-1 block text-[11px] font-bold text-gray-600">
                              URL
                            </label>

                            <input
                              type="text"
                              value={
                                linkUrl
                              }
                              onChange={(e) =>
                                setLinkUrl(
                                  e.target
                                    .value
                                )
                              }
                              placeholder="/blog/building-trust or https://example.com"
                              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                            />
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={
                                addLink
                              }
                              className="flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-rose-600"
                            >
                              <LinkIcon className="h-3.5 w-3.5" />
                              Insert Link
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setLinkOpen(
                                  false
                                );
                                setLinkText(
                                  ''
                                );
                                setLinkUrl(
                                  ''
                                );
                              }}
                              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-500 hover:bg-white"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* AUTHOR + TAGS */}

                <section className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-gray-600">
                      Author
                    </label>

                    <input
                      type="text"
                      value={
                        form.author
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          author:
                            e.target
                              .value,
                        })
                      }
                      placeholder="Loveons Editorial"
                      className="w-full rounded-2xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-gray-600">
                      Tags
                    </label>

                    <input
                      type="text"
                      value={
                        form.tags
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          tags: e.target
                            .value,
                        })
                      }
                      placeholder="communication, trust, relationships"
                      className="w-full rounded-2xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                    />
                  </div>
                </section>

                {/* IMAGE SEO */}

                <section className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <h3 className="mb-4 text-sm font-bold text-gray-700">
                    Image & Accessibility
                  </h3>

                  <label className="mb-1.5 block text-xs font-bold text-gray-600">
                    Image Alt Text
                  </label>

                  <input
                    type="text"
                    value={
                      form.image_alt
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        image_alt:
                          e.target
                            .value,
                      })
                    }
                    placeholder="Describe the featured image"
                    className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                  />
                </section>

                {/* SEO */}

                <section className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4">
                  <h3 className="mb-4 text-sm font-bold text-gray-700">
                    Search Engine Optimization
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-gray-600">
                        Meta Title
                      </label>

                      <input
                        type="text"
                        value={
                          form.meta_title
                        }
                        onChange={(e) =>
                          setForm({
                            ...form,
                            meta_title:
                              e.target
                                .value,
                          })
                        }
                        placeholder="Defaults to article title"
                        maxLength={70}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                      />

                      <p className="mt-1 text-[11px] text-gray-400">
                        {
                          form
                            .meta_title
                            .length
                        }
                        /70
                      </p>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-gray-600">
                        Meta Description
                      </label>

                      <textarea
                        value={
                          form.meta_description
                        }
                        onChange={(e) =>
                          setForm({
                            ...form,
                            meta_description:
                              e.target
                                .value,
                          })
                        }
                        placeholder="Defaults to article description"
                        maxLength={170}
                        rows={3}
                        className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                      />

                      <p className="mt-1 text-[11px] text-gray-400">
                        {
                          form
                            .meta_description
                            .length
                        }
                        /170
                      </p>
                    </div>
                  </div>
                </section>

                {/* ACTIONS */}

                <div className="sticky bottom-0 -mx-5 border-t border-rose-100 bg-white px-5 pb-1 pt-4 sm:-mx-6 sm:px-6">
                  <div className="grid gap-2 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() =>
                        saveArticle(
                          false
                        )
                      }
                      disabled={
                        saving ||
                        uploading
                      }
                      className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}

                      Save Draft
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        saveArticle(
                          true
                        )
                      }
                      disabled={
                        saving ||
                        uploading
                      }
                      className="flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}

                      {editingId
                        ? 'Save & Publish'
                        : 'Publish Article'}
                    </button>

                    <button
                      type="button"
                      onClick={
                        resetForm
                      }
                      disabled={saving}
                      className="rounded-2xl px-4 py-3 text-sm font-semibold text-gray-500 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </PageLayout>
    </>
  );
}
