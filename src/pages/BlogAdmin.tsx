
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
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
  estimateReadingTime,
  type BlogPost,
} from '../lib/blogApi';

import { BLOG_CATEGORIES } from '../lib/blog';

const PLACEHOLDER_IMAGE = '/images/blogs/default.webp';

const LOCAL_DRAFT_KEY =
  'loveons-blog-admin-local-draft-v3';

type Filter = 'all' | 'published' | 'draft';

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

const EMPTY_FORM: FormData = {
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

function cleanSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function makeTags(value: string): string[] {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function isValidLink(value: string): boolean {
  const url = value.trim();

  if (!url) return false;

  if (url.startsWith('/')) {
    return true;
  }

  try {
    const parsed = new URL(url);

    return (
      parsed.protocol === 'http:' ||
      parsed.protocol === 'https:'
    );
  } catch {
    return false;
  }
}

function hasContent(
  data: Partial<FormData>,
): boolean {
  return Boolean(
    data.title?.trim() ||
      data.slug?.trim() ||
      data.excerpt?.trim() ||
      data.content?.trim() ||
      data.image_url?.trim() ||
      data.tags?.trim() ||
      data.meta_title?.trim() ||
      data.meta_description?.trim(),
  );
}

function buildPayload(
  form: FormData,
  published: boolean,
  oldPublishedAt?: string | null,
): Omit<
  BlogPost,
  'id' | 'created_at' | 'updated_at'
> {
  return {
    title: form.title.trim(),

    slug: cleanSlug(
      form.slug || form.title,
    ),

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
      ? oldPublishedAt ||
        new Date().toISOString()
      : oldPublishedAt || null,

    reading_time:
      estimateReadingTime(
        form.content,
      ),

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
   COMPONENT
========================================================= */

export default function BlogAdmin() {
  const [posts, setPosts] =
    useState<BlogPost[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [showEditor, setShowEditor] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<FormData>({
      ...EMPTY_FORM,
    });

  const [saving, setSaving] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState('');

  const [notice, setNotice] =
    useState('');

  const [search, setSearch] =
    useState('');

  const [filter, setFilter] =
    useState<Filter>('all');

  const [linkOpen, setLinkOpen] =
    useState(false);

  const [linkText, setLinkText] =
    useState('');

  const [linkUrl, setLinkUrl] =
    useState('');

  const contentRef =
    useRef<HTMLTextAreaElement | null>(
      null,
    );

  const draftTimerRef =
    useRef<number | null>(null);

  /* =======================================================
     STATE
  ======================================================= */

  const setFields = useCallback(
    (patch: Partial<FormData>) => {
      setForm((current) => ({
        ...current,
        ...patch,
      }));
    },
    [],
  );

  /* =======================================================
     LOAD POSTS
  ======================================================= */

  const loadPosts =
    useCallback(async () => {
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
            : 'Failed to load articles.',
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  /* =======================================================
     LOCAL DRAFT
  ======================================================= */

  const saveLocalDraft =
    useCallback(
      (
        nextForm: FormData,
        nextEditingId: string | null,
      ) => {
        try {
          localStorage.setItem(
            LOCAL_DRAFT_KEY,
            JSON.stringify({
              form: nextForm,
              editingId:
                nextEditingId,
              savedAt:
                new Date().toISOString(),
            }),
          );
        } catch {
          // Local recovery is optional.
        }
      },
      [],
    );

  const clearLocalDraft =
    useCallback(() => {
      try {
        localStorage.removeItem(
          LOCAL_DRAFT_KEY,
        );
      } catch {
        // Ignore storage errors.
      }
    }, []);

  useEffect(() => {
    if (!showEditor) return;

    if (!hasContent(form)) return;

    if (draftTimerRef.current !== null) {
      window.clearTimeout(
        draftTimerRef.current,
      );
    }

    draftTimerRef.current =
      window.setTimeout(() => {
        saveLocalDraft(
          form,
          editingId,
        );
      }, 700);

    return () => {
      if (
        draftTimerRef.current !== null
      ) {
        window.clearTimeout(
          draftTimerRef.current,
        );
      }
    };
  }, [
    form,
    editingId,
    showEditor,
    saveLocalDraft,
  ]);

  /* =======================================================
     EDITOR OPEN / CLOSE
  ======================================================= */

  const openNewArticle = () => {
    setEditingId(null);

    setForm({
      ...EMPTY_FORM,
    });

    setLinkOpen(false);
    setLinkText('');
    setLinkUrl('');

    setError('');
    setNotice('');

    setShowEditor(true);
  };

  const closeEditor = (
    clearDraft = true,
  ) => {
    if (draftTimerRef.current !== null) {
      window.clearTimeout(
        draftTimerRef.current,
      );
    }

    setShowEditor(false);

    setEditingId(null);

    setForm({
      ...EMPTY_FORM,
    });

    setLinkOpen(false);
    setLinkText('');
    setLinkUrl('');

    setError('');
    setNotice('');

    if (clearDraft) {
      clearLocalDraft();
    }
  };

  /* =======================================================
     RESTORE LOCAL DRAFT
  ======================================================= */

  const restoreLocalDraft = () => {
    try {
      const raw =
        localStorage.getItem(
          LOCAL_DRAFT_KEY,
        );

      if (!raw) {
        setNotice(
          'No local draft found on this device.',
        );
        return;
      }

      const saved = JSON.parse(raw) as {
        form?: Partial<FormData>;
        editingId?: string | null;
        savedAt?: string;
      };

      if (
        !saved.form ||
        !hasContent(saved.form)
      ) {
        clearLocalDraft();

        setNotice(
          'No usable local draft was found.',
        );

        return;
      }

      const confirmed =
        window.confirm(
          `Restore the saved local draft${
            saved.savedAt
              ? ` from ${new Date(
                  saved.savedAt,
                ).toLocaleString()}`
              : ''
          }?`,
        );

      if (!confirmed) return;

      setForm({
        ...EMPTY_FORM,
        ...saved.form,
      });

      setEditingId(
        saved.editingId ?? null,
      );

      setShowEditor(true);

      setError('');

      setNotice(
        'Local draft restored.',
      );
    } catch {
      setError(
        'The local draft could not be restored.',
      );
    }
  };

  /* =======================================================
     IMAGE UPLOAD
  ======================================================= */

  const handleImageUpload =
    async (
      event: ChangeEvent<HTMLInputElement>,
    ) => {
      const file =
        event.target.files?.[0];

      if (!file) return;

      try {
        setUploading(true);
        setError('');
        setNotice('');

        const url =
          await uploadBlogImage(file);

        setFields({
          image_url: url,
        });

        setNotice(
          'Featured image uploaded.',
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Image upload failed.',
        );
      } finally {
        setUploading(false);

        event.target.value = '';
      }
    };

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validate = (): boolean => {
    if (!form.title.trim()) {
      setError(
        'Please enter a blog title.',
      );
      return false;
    }

    if (!form.excerpt.trim()) {
      setError(
        'Please enter a short description.',
      );
      return false;
    }

    if (!form.content.trim()) {
      setError(
        'Please enter the article content.',
      );
      return false;
    }

    if (
      !cleanSlug(
        form.slug || form.title,
      )
    ) {
      setError(
        'Please enter a valid title or slug.',
      );
      return false;
    }

    return true;
  };

  /* =======================================================
     SAVE ARTICLE
  ======================================================= */

  const saveArticle = async (
    published: boolean,
  ) => {
    if (!validate()) return;

    try {
      setSaving(true);
      setError('');
      setNotice('');

      const existing =
        editingId
          ? posts.find(
              (post) =>
                post.id ===
                editingId,
            )
          : undefined;

      const payload =
        buildPayload(
          form,
          published,
          existing?.published_at,
        );

      if (editingId) {
        await updatePost(
          editingId,
          payload,
        );
      } else {
        await createPost(
          payload,
        );
      }

      await loadPosts();

      clearLocalDraft();

      setNotice(
        published
          ? 'Article published successfully.'
          : 'Draft saved successfully.',
      );

      setShowEditor(false);

      setEditingId(null);

      setForm({
        ...EMPTY_FORM,
      });

      setLinkOpen(false);
      setLinkText('');
      setLinkUrl('');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save article.',
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     EDIT
  ======================================================= */

  const handleEdit = (
    post: BlogPost,
  ) => {
    setEditingId(post.id);

    setForm({
      title: post.title || '',
      slug: post.slug || '',
      category:
        post.category ||
        'Communication',
      excerpt: post.excerpt || '',
      content: post.content || '',
      image_url:
        post.image_url || '',
      image_alt:
        post.image_alt || '',
      author:
        post.author ||
        'Loveons Editorial',
      tags:
        post.tags?.join(', ') ||
        '',
      meta_title:
        post.meta_title || '',
      meta_description:
        post.meta_description ||
        '',
    });

    setLinkOpen(false);
    setLinkText('');
    setLinkUrl('');

    setError('');
    setNotice('');

    setShowEditor(true);
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete = async (
    id: string,
  ) => {
    const confirmed =
      window.confirm(
        'Delete this article permanently? This cannot be undone.',
      );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError('');
      setNotice('');

      await deletePost(id);

      await loadPosts();

      setNotice(
        'Article deleted.',
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Delete failed.',
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* =======================================================
     PUBLISH / UNPUBLISH
  ======================================================= */

  const togglePublish =
    async (
      post: BlogPost,
    ) => {
      try {
        setError('');
        setNotice('');

        const next =
          !post.published;

        await updatePost(
          post.id,
          {
            published: next,
            published_at: next
              ? post.published_at ||
                new Date().toISOString()
              : post.published_at,
          },
        );

        await loadPosts();

        setNotice(
          next
            ? 'Article published.'
            : 'Article moved to draft.',
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Publish status update failed.',
        );
      }
    };

  /* =======================================================
     OPEN ARTICLE
  ======================================================= */

  const openArticle = (
    post: BlogPost,
  ) => {
    window.open(
      `/blog/${post.slug}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  /* =======================================================
     TEXT EDITOR
  ======================================================= */

  const insertContent = (
    value: string,
    start?: number,
    end?: number,
  ) => {
    const textarea =
      contentRef.current;

    if (!textarea) {
      setFields({
        content:
          form.content + value,
      });

      return;
    }

    const from =
      start ??
      textarea.selectionStart;

    const to =
      end ??
      textarea.selectionEnd;

    const next =
      form.content.slice(
        0,
        from,
      ) +
      value +
      form.content.slice(to);

    setFields({
      content: next,
    });

    requestAnimationFrame(() => {
      textarea.focus();

      const position =
        from + value.length;

      textarea.setSelectionRange(
        position,
        position,
      );
    });
  };

  const wrapSelection = (
    before: string,
    after = before,
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
        end,
      );

    if (!selected) {
      setError(
        'Select some text first.',
      );
      return;
    }

    insertContent(
      `${before}${selected}${after}`,
      start,
      end,
    );

    setError('');
  };

  /* =======================================================
     LINK EDITOR
  ======================================================= */

  const openLinkEditor = () => {
    const textarea =
      contentRef.current;

    const start =
      textarea?.selectionStart ?? 0;

    const end =
      textarea?.selectionEnd ?? 0;

    const selected =
      form.content.slice(
        start,
        end,
      );

    setLinkText(selected);

    setLinkUrl('');

    setError('');

    setLinkOpen(true);
  };

  const addLink = () => {
    const text =
      linkText.trim();

    const url =
      linkUrl.trim();

    if (!text) {
      setError(
        'Select some text or enter link text first.',
      );
      return;
    }

    if (!isValidLink(url)) {
      setError(
        'Use /blog/slug or a full http/https URL.',
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

    insertContent(
      `[${text}](${url})`,
      start,
      end,
    );

    setLinkOpen(false);

    setLinkText('');
    setLinkUrl('');

    setError('');
  };

  const removeLink = () => {
    const textarea =
      contentRef.current;

    if (!textarea) {
      setError(
        'Select the complete markdown link first.',
      );
      return;
    }

    const start =
      textarea.selectionStart;

    const end =
      textarea.selectionEnd;

    if (start === end) {
      setError(
        'Select the complete markdown link first.',
      );
      return;
    }

    const selected =
      form.content.slice(
        start,
        end,
      );

    const match =
      selected.match(
        /^\[([\s\S]+)\]\(([^)]+)\)$/,
      );

    if (!match) {
      setError(
        'The selected text is not a markdown link.',
      );
      return;
    }

    insertContent(
      match[1],
      start,
      end,
    );

    setError('');
  };

  /* =======================================================
     FILTERS
  ======================================================= */

  const filteredPosts =
    posts.filter((post) => {
      const query =
        search
          .trim()
          .toLowerCase();

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
        post.tags.some(
          (tag) =>
            tag
              .toLowerCase()
              .includes(query),
        );

      const matchesFilter =
        filter === 'all' ||
        (filter ===
          'published' &&
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
      (post) =>
        post.published,
    ).length;

  const draftCount =
    posts.filter(
      (post) =>
        !post.published,
    ).length;

  /* =======================================================
     RENDER
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
        {/* GLOBAL ERROR */}

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {notice && !error && (
          <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {notice}
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

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={
                  restoreLocalDraft
                }
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Restore Draft
              </button>

              <button
                type="button"
                onClick={
                  openNewArticle
                }
                className="flex items-center gap-2 rounded-2xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white hover:bg-rose-600"
              >
                <Plus className="h-4 w-4" />
                New Article
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search articles..."
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-rose-300 focus:bg-white focus:ring-2 focus:ring-rose-100"
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
                        value as Filter,
                      )
                    }
                    className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                      filter === value
                        ? 'bg-white text-rose-600 shadow-sm'
                        : 'text-gray-500'
                    }`}
                  >
                    {label}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>

        {/* LIST */}

        {loading ? (
          <div className="flex justify-center py-16">
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

            {posts.length ===
              0 && (
              <button
                type="button"
                onClick={
                  openNewArticle
                }
                className="mt-5 rounded-2xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white"
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
                  className="rounded-3xl border border-rose-100 bg-white p-3 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-rose-50 sm:h-20 sm:w-20">
                      <BlogImage
                        src={
                          post.image_url ||
                          PLACEHOLDER_IMAGE
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

                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-600">
                          {post.category}
                        </span>

                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            post.published
                              ? 'bg-green-50 text-green-600'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {post.published
                            ? 'Published'
                            : 'Draft'}
                        </span>
                      </div>

                      <p className="mt-1 hidden truncate text-xs text-gray-400 sm:block">
                        /blog/
                        {post.slug}
                      </p>
                    </div>

                    <div className="flex gap-1">
                      {post.published && (
                        <button
                          type="button"
                          onClick={() =>
                            openArticle(
                              post,
                            )
                          }
                          className="hidden rounded-xl p-2 hover:bg-blue-50 sm:block"
                          title="Open"
                        >
                          <ExternalLink className="h-4 w-4 text-blue-500" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          togglePublish(
                            post,
                          )
                        }
                        className="rounded-xl p-2 hover:bg-rose-50"
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
                            post,
                          )
                        }
                        className="rounded-xl p-2 hover:bg-rose-50"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4 text-gray-500" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            post.id,
                          )
                        }
                        disabled={
                          deletingId ===
                          post.id
                        }
                        className="rounded-xl p-2 hover:bg-red-50"
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
              ),
            )}
          </div>
        )}

        {/* EDITOR */}

        {showEditor && (
          <div
            className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div
              className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
              onMouseDown={(event) =>
                event.stopPropagation()
              }
            >
              {/* EDITOR HEADER */}

              <div className="sticky top-0 z-20 flex items-center justify-between border-b border-rose-100 bg-white px-5 py-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-gray-800">
                    {editingId
                      ? 'Edit Article'
                      : 'New Article'}
                  </h2>

                  <p className="text-xs text-gray-400">
                    Your work stays here until you save or cancel.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    closeEditor(true)
                  }
                  className="rounded-xl p-2 hover:bg-rose-50"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* NO FORM TAG HERE */}

              <div className="space-y-5 p-5 sm:p-6">
                {/* IMAGE */}

                <section className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <label className="mb-2 block text-xs font-bold text-gray-600">
                    Featured Image
                  </label>

                  <div className="flex gap-4">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-white">
                      <BlogImage
                        src={
                          form.image_url ||
                          PLACEHOLDER_IMAGE
                        }
                        alt={
                          form.image_alt ||
                          form.title
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

                        <div className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-500">
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
                        onChange={(event) =>
                          setFields({
                            image_url:
                              event.target
                                .value,
                          })
                        }
                        placeholder="Or paste image URL"
                        className="mt-2 w-full rounded-2xl border border-gray-200 px-3 py-3 text-sm"
                      />
                    </div>
                  </div>
                </section>

                {/* TITLE */}

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-gray-600">
                    Blog Title *
                  </label>

                  <input
                    type="text"
                    value={form.title}
                    onChange={(event) => {
                      const title =
                        event.target
                          .value;

                      setFields({
                        title,
                        slug:
                          editingId ||
                          form.slug
                            ? form.slug
                            : cleanSlug(
                                title,
                              ),
                      });
                    }}
                    placeholder="Enter article title"
                    className="w-full rounded-2xl border border-gray-200 px-3 py-3 text-sm"
                  />
                </div>

                {/* CATEGORY + SLUG */}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-gray-600">
                      Category
                    </label>

                    <select
                      value={
                        form.category
                      }
                      onChange={(event) =>
                        setFields({
                          category:
                            event.target
                              .value,
                        })
                      }
                      className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-3 text-sm"
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
                            {category}
                          </option>
                        ),
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-gray-600">
                      URL Slug
                    </label>

                    <input
                      type="text"
                      value={
                        form.slug
                      }
                      onChange={(event) =>
                        setFields({
                          slug:
                            event.target
                              .value,
                        })
                      }
                      onBlur={() =>
                        setFields({
                          slug: cleanSlug(
                            form.slug ||
                              form.title,
                          ),
                        })
                      }
                      placeholder="honest-conversation"
                      className="w-full rounded-2xl border border-gray-200 px-3 py-3 text-sm"
                    />

                    <p className="mt-1 text-[11px] text-gray-400">
                      Hyphen `-` is allowed.
                    </p>
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
                    onChange={(event) =>
                      setFields({
                        excerpt:
                          event.target
                            .value,
                      })
                    }
                    rows={3}
                    className="w-full resize-none rounded-2xl border border-gray-200 px-3 py-3 text-sm"
                  />
                </div>

                {/* CONTENT TOOLBAR */}

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-gray-600">
                    Article Content *
                  </label>

                  <div className="flex flex-wrap gap-1 rounded-t-2xl border border-b-0 border-gray-200 bg-gray-50 p-2">
                    <button
                      type="button"
                      onClick={() =>
                        wrapSelection(
                          '**',
                          '**',
                        )
                      }
                      className="rounded-lg p-2 hover:bg-white"
                      title="Bold"
                    >
                      <Bold className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        wrapSelection(
                          '*',
                          '*',
                        )
                      }
                      className="rounded-lg p-2 hover:bg-white"
                      title="Italic"
                    >
                      <Italic className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        wrapSelection(
                          '## ',
                          '',
                        )
                      }
                      className="rounded-lg p-2 hover:bg-white"
                      title="Heading"
                    >
                      <Heading2 className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        wrapSelection(
                          '- ',
                          '',
                        )
                      }
                      className="rounded-lg p-2 hover:bg-white"
                      title="Bullet"
                    >
                      <List className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        wrapSelection(
                          '1. ',
                          '',
                        )
                      }
                      className="rounded-lg p-2 hover:bg-white"
                      title="Numbered list"
                    >
                      <ListOrdered className="h-4 w-4" />
                    </button>

                    <span className="mx-1 h-5 w-px bg-gray-200" />

                    <button
                      type="button"
                      onClick={
                        openLinkEditor
                      }
                      className="flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-rose-600"
                    >
                      <LinkIcon className="h-4 w-4" />
                      Add Link
                    </button>

                    <button
                      type="button"
                      onClick={
                        removeLink
                      }
                      className="rounded-lg p-2 hover:bg-white"
                      title="Remove Link"
                    >
                      <Unlink className="h-4 w-4" />
                    </button>
                  </div>

                  <textarea
                    ref={contentRef}
                    value={
                      form.content
                    }
                    onChange={(event) =>
                      setFields({
                        content:
                          event.target
                            .value,
                      })
                    }
                    rows={16}
                    className="w-full resize-y rounded-b-2xl border border-gray-200 px-3 py-3 text-sm leading-7"
                  />

                  {/* LINK PANEL */}

                  {linkOpen && (
                    <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-bold text-gray-700">
                          Add Link
                        </h4>

                        <button
                          type="button"
                          onClick={() => {
                            setLinkOpen(
                              false,
                            );
                            setLinkText(
                              '',
                            );
                            setLinkUrl(
                              '',
                            );
                          }}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <input
                          type="text"
                          value={
                            linkText
                          }
                          onChange={(
                            event,
                          ) =>
                            setLinkText(
                              event
                                .target
                                .value,
                            )
                          }
                          placeholder="Honest Conversation"
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm"
                        />

                        <input
                          type="text"
                          value={
                            linkUrl
                          }
                          onChange={(
                            event,
                          ) =>
                            setLinkUrl(
                              event
                                .target
                                .value,
                            )
                          }
                          placeholder="https://example.com"
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm"
                        />

                        <button
                          type="button"
                          onClick={
                            addLink
                          }
                          className="rounded-xl bg-rose-500 px-4 py-2.5 text-xs font-semibold text-white"
                        >
                          Insert Link
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* AUTHOR + TAGS */}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-gray-600">
                      Author
                    </label>

                    <input
                      type="text"
                      value={
                        form.author
                      }
                      onChange={(event) =>
                        setFields({
                          author:
                            event.target
                              .value,
                        })
                      }
                      className="w-full rounded-2xl border border-gray-200 px-3 py-3 text-sm"
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
                      onChange={(event) =>
                        setFields({
                          tags:
                            event.target
                              .value,
                        })
                      }
                      placeholder="communication, trust, relationships"
                      className="w-full rounded-2xl border border-gray-200 px-3 py-3 text-sm"
                    />
                  </div>
                </div>

                {/* IMAGE ALT */}

                <div className="rounded-2xl bg-gray-50 p-4">
                  <label className="mb-1.5 block text-xs font-bold text-gray-600">
                    Image Alt Text
                  </label>

                  <input
                    type="text"
                    value={
                      form.image_alt
                    }
                    onChange={(event) =>
                      setFields({
                        image_alt:
                          event.target
                            .value,
                      })
                    }
                    placeholder="Describe the featured image"
                    className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-3 text-sm"
                  />
                </div>

                {/* SEO */}

                <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
                  <h3 className="mb-4 text-sm font-bold text-gray-700">
                    SEO
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
                        onChange={(event) =>
                          setFields({
                            meta_title:
                              event.target
                                .value,
                          })
                        }
                        maxLength={70}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-3 text-sm"
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
                        onChange={(event) =>
                          setFields({
                            meta_description:
                              event.target
                                .value,
                          })
                        }
                        maxLength={170}
                        rows={3}
                        className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-3 py-3 text-sm"
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
                </div>

                {/* ACTIONS */}

                <div className="sticky bottom-0 -mx-5 border-t border-rose-100 bg-white px-5 pt-4 sm:-mx-6 sm:px-6">
                  <div className="grid gap-2 sm:grid-cols-4">
                    <button
                      type="button"
                      onClick={() =>
                        saveArticle(
                          false,
                        )
                      }
                      disabled={
                        saving ||
                        uploading
                      }
                      className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 disabled:opacity-50"
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
                          true,
                        )
                      }
                      disabled={
                        saving ||
                        uploading
                      }
                      className="flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
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
                      onClick={() => {
                        saveLocalDraft(
                          form,
                          editingId,
                        );

                        setNotice(
                          'Local draft saved on this device.',
                        );
                      }}
                      disabled={saving}
                      className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 disabled:opacity-50"
                    >
                      Keep Local Draft
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        closeEditor(
                          true,
                        )
                      }
                      disabled={saving}
                      className="rounded-2xl px-4 py-3 text-sm font-semibold text-gray-500 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </PageLayout>
    </>
  );
}
















    









