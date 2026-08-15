
import {
  useCallback,
  useEffect,
  useRef,
  useState,
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
  estimateReadingTime,
  type BlogPost,
} from '../lib/blogApi';
import { BLOG_CATEGORIES } from '../lib/blog';

const PLACEHOLDER_IMAGE = '/images/blogs/default.webp';
const LOCAL_DRAFT_KEY = 'loveons-blog-admin-local-draft-v2';

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

  if (url.startsWith('/')) return true;

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

function hasContent(form: Partial<FormData>): boolean {
  return Boolean(
    form.title?.trim() ||
      form.slug?.trim() ||
      form.excerpt?.trim() ||
      form.content?.trim() ||
      form.image_url?.trim() ||
      form.tags?.trim() ||
      form.meta_title?.trim() ||
      form.meta_description?.trim(),
  );
}

function buildPayload(
  form: FormData,
  published: boolean,
  oldPublishedAt?: string | null,
) {
  const slug = cleanSlug(form.slug || form.title);

  return {
    title: form.title.trim(),
    slug,
    category: form.category,
    excerpt: form.excerpt.trim(),
    content: form.content.trim(),
    image_url: form.image_url.trim() || null,
    image_alt:
      form.image_alt.trim() ||
      form.title.trim() ||
      null,
    author:
      form.author.trim() ||
      'Loveons Editorial',
    published,
    published_at: published
      ? oldPublishedAt || new Date().toISOString()
      : oldPublishedAt || null,
    reading_time: estimateReadingTime(form.content),
    tags: makeTags(form.tags),
    meta_title:
      form.meta_title.trim() ||
      form.title.trim(),
    meta_description:
      form.meta_description.trim() ||
      form.excerpt.trim(),
  };
}

export default function BlogAdmin() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(
    null,
  );

  const [form, setForm] = useState<FormData>({
    ...emptyForm,
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(
    null,
  );

  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const contentRef =
    useRef<HTMLTextAreaElement | null>(null);

  const draftTimerRef = useRef<number | null>(null);

  const [linkOpen, setLinkOpen] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const setFields = useCallback(
    (patch: Partial<FormData>) => {
      setForm((current) => ({
        ...current,
        ...patch,
      }));
    },
    [],
  );

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await fetchAllPosts();

      setPosts(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load posts.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const saveLocalDraft = useCallback(
    (
      nextForm: FormData,
      nextEditingId: string | null,
    ) => {
      try {
        localStorage.setItem(
          LOCAL_DRAFT_KEY,
          JSON.stringify({
            form: nextForm,
            editingId: nextEditingId,
            savedAt: new Date().toISOString(),
          }),
        );
      } catch {
        // Local recovery is best effort.
      }
    },
    [],
  );

  const clearLocalDraft = useCallback(() => {
    try {
      localStorage.removeItem(LOCAL_DRAFT_KEY);
    } catch {
      // Ignore storage errors.
    }
  }, []);

  useEffect(() => {
    if (!showForm || !hasContent(form)) return;

    if (draftTimerRef.current) {
      window.clearTimeout(draftTimerRef.current);
    }

    draftTimerRef.current = window.setTimeout(() => {
      saveLocalDraft(form, editingId);
    }, 700);

    return () => {
      if (draftTimerRef.current) {
        window.clearTimeout(draftTimerRef.current);
      }
    };
  }, [
    form,
    editingId,
    showForm,
    saveLocalDraft,
  ]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(
        LOCAL_DRAFT_KEY,
      );

      if (!raw) return;

      const saved = JSON.parse(raw) as {
        form?: FormData;
        editingId?: string | null;
        savedAt?: string;
      };

      if (
        saved.form &&
        hasContent(saved.form)
      ) {
        setForm({
          ...emptyForm,
          ...saved.form,
        });

        setEditingId(
          saved.editingId || null,
        );

        setShowForm(true);

        setNotice(
          'Recovered your unsaved local draft.',
        );
      }
    } catch {
      // Ignore invalid local draft data.
    }
  }, []);

  const resetForm = useCallback(() => {
    setForm({
      ...emptyForm,
    });

    setEditingId(null);
    setError('');
    setNotice('');
    setLinkOpen(false);
    setLinkText('');
    setLinkUrl('');
  }, []);

  const startNewArticle = useCallback(() => {
    resetForm();
    setShowForm(true);
  }, [resetForm]);

  const startEdit = useCallback(
    (post: BlogPost) => {
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
        tags: Array.isArray(post.tags)
          ? post.tags.join(', ')
          : '',
        meta_title:
          post.meta_title ||
          post.title ||
          '',
        meta_description:
          post.meta_description ||
          post.excerpt ||
          '',
      });

      setEditingId(post.id);
      setShowForm(true);
      setError('');
      setNotice('');
      setLinkOpen(false);
    },
    [],
  );

  const closeEditor = useCallback(() => {
    if (hasContent(form)) {
      saveLocalDraft(
        form,
        editingId,
      );
    }

    setShowForm(false);
    setLinkOpen(false);
  }, [
    form,
    editingId,
    saveLocalDraft,
  ]);

  const handleFieldChange = useCallback(
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const {
        name,
        value,
      } = event.target;

      setFields({
        [name]: value,
      } as Partial<FormData>);
    },
    [setFields],
  );

  const handleTitleChange = useCallback(
    (
      event: ChangeEvent<HTMLInputElement>,
    ) => {
      const title = event.target.value;

      setForm((current) => ({
        ...current,
        title,
        slug:
          current.slug.trim() ===
            '' ||
          current.slug ===
            cleanSlug(current.title)
            ? cleanSlug(title)
            : current.slug,
      }));
    },
    [],
  );

  const handleSlugChange = useCallback(
    (
      event: ChangeEvent<HTMLInputElement>,
    ) => {
      /*
       * Keep hyphens while typing.
       * Final cleanup happens when the field loses focus.
       */
      setFields({
        slug: event.target.value,
      });
    },
    [setFields],
  );

  const handleSlugBlur = useCallback(() => {
    setForm((current) => ({
      ...current,
      slug: cleanSlug(
        current.slug ||
          current.title,
      ),
    }));
  }, []);

  const handleImageUpload = useCallback(
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
          'Image uploaded successfully.',
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
    },
    [setFields],
  );

  const insertAtCursor = useCallback(
    (
      before: string,
      after = '',
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

      const replacement =
        `${before}${selected}${after}`;

      const nextContent =
        form.content.slice(
          0,
          start,
        ) +
        replacement +
        form.content.slice(end);

      setFields({
        content: nextContent,
      });

      window.requestAnimationFrame(() => {
        textarea.focus();

        const cursorPosition =
          start +
          replacement.length;

        textarea.setSelectionRange(
          cursorPosition,
          cursorPosition,
        );
      });
    },
    [form.content, setFields],
  );

  const applyBold = useCallback(() => {
    insertAtCursor(
      '**',
      '**',
    );
  }, [insertAtCursor]);

  const applyItalic = useCallback(() => {
    insertAtCursor(
      '*',
      '*',
    );
  }, [insertAtCursor]);

  const applyHeading = useCallback(() => {
    insertAtCursor(
      '## ',
    );
  }, [insertAtCursor]);

  const applyBulletList =
    useCallback(() => {
      insertAtCursor(
        '- ',
      );
    }, [insertAtCursor]);

  const applyNumberedList =
    useCallback(() => {
      insertAtCursor(
        '1. ',
      );
    }, [insertAtCursor]);

  const openLinkEditor =
    useCallback(() => {
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

      setLinkText(selected);
      setLinkUrl('');
      setLinkOpen(true);
      setError('');
    }, [form.content]);

  const insertLink =
    useCallback(() => {
      const text =
        linkText.trim();

      const url =
        linkUrl.trim();

      if (!text) {
        setError(
          'Select or enter the link text first.',
        );
        return;
      }

      if (!isValidLink(url)) {
        setError(
          'Enter a valid http, https, or internal / link.',
        );
        return;
      }

      const textarea =
        contentRef.current;

      if (!textarea) {
        setError(
          'Unable to place the link.',
        );
        return;
      }

      const start =
        textarea.selectionStart;

      const end =
        textarea.selectionEnd;

      const selected =
        form.content.slice(
          start,
          end,
        );

      const finalText =
        selected || text;

      const markdown =
        `[${finalText}](${url})`;

      const nextContent =
        form.content.slice(
          0,
          start,
        ) +
        markdown +
        form.content.slice(end);

      setFields({
        content: nextContent,
      });

      setLinkOpen(false);
      setLinkText('');
      setLinkUrl('');
      setNotice(
        'Link added to the article.',
      );

      window.requestAnimationFrame(() => {
        textarea.focus();

        const position =
          start +
          markdown.length;

        textarea.setSelectionRange(
          position,
          position,
        );
      });
    }, [
      form.content,
      linkText,
      linkUrl,
      setFields,
    ]);

  const removeLink =
    useCallback(() => {
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

      const markdownMatch =
        selected.match(
          /^\[([^\]]+)\]\(([^)]+)\)$/,
        );

      if (!markdownMatch) {
        setError(
          'Select a complete Markdown link to remove it.',
        );
        return;
      }

      const nextContent =
        form.content.slice(
          0,
          start,
        ) +
        markdownMatch[1] +
        form.content.slice(end);

      setFields({
        content: nextContent,
      });

      setNotice(
        'Link removed.',
      );
    }, [
      form.content,
      setFields,
    ]);

  const handleSubmit = useCallback(
    async (
      event: FormEvent<HTMLFormElement>,
      publish: boolean,
    ) => {
      event.preventDefault();

      if (!form.title.trim()) {
        setError('Please enter an article title.');
        return;
      }

      if (!form.content.trim()) {
        setError('Please enter article content.');
        return;
      }

      const slug = cleanSlug(
        form.slug || form.title,
      );

      if (!slug) {
        setError(
          'Please enter a valid article slug.',
        );
        return;
      }

      try {
        setSaving(true);
        setError('');
        setNotice('');

        const existingPost =
          editingId
            ? posts.find(
                (post) =>
                  post.id === editingId,
              )
            : undefined;

        const payload = buildPayload(
          {
            ...form,
            slug,
          },
          publish,
          existingPost?.published_at ||
            null,
        );

        if (editingId) {
          await updatePost(
            editingId,
            payload,
          );

          setNotice(
            publish
              ? 'Article published successfully.'
              : 'Article saved as draft.',
          );
        } else {
          await createPost(
            payload,
          );

          setNotice(
            publish
              ? 'Article published successfully.'
              : 'Draft saved successfully.',
          );
        }

        clearLocalDraft();

        await loadPosts();

        setShowForm(false);
        setEditingId(null);

        setForm({
          ...emptyForm,
        });

        setLinkOpen(false);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to save the article.',
        );
      } finally {
        setSaving(false);
      }
    },
    [
      form,
      editingId,
      posts,
      clearLocalDraft,
      loadPosts,
    ],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const confirmed =
        window.confirm(
          'Are you sure you want to delete this article?',
        );

      if (!confirmed) return;

      try {
        setDeletingId(id);
        setError('');

        await deletePost(id);

        setPosts((current) =>
          current.filter(
            (post) => post.id !== id,
          ),
        );

        if (editingId === id) {
          setShowForm(false);
          setEditingId(null);
          resetForm();
        }

        setNotice(
          'Article deleted successfully.',
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to delete the article.',
        );
      } finally {
        setDeletingId(null);
      }
    },
    [
      editingId,
      resetForm,
    ],
  );

  const handleTogglePublished =
    useCallback(
      async (post: BlogPost) => {
        try {
          setError('');

          const nextPublished =
            !post.published;

          await updatePost(
            post.id,
            buildPayload(
              {
                title:
                  post.title || '',
                slug:
                  post.slug || '',
                category:
                  post.category ||
                  'Communication',
                excerpt:
                  post.excerpt || '',
                content:
                  post.content || '',
                image_url:
                  post.image_url || '',
                image_alt:
                  post.image_alt || '',
                author:
                  post.author ||
                  'Loveons Editorial',
                tags:
                  Array.isArray(
                    post.tags,
                  )
                    ? post.tags.join(', ')
                    : '',
                meta_title:
                  post.meta_title ||
                  '',
                meta_description:
                  post.meta_description ||
                  '',
              },
              nextPublished,
              post.published_at ||
                null,
            ),
          );

          setPosts((current) =>
            current.map(
              (item) =>
                item.id === post.id
                  ? {
                      ...item,
                      published:
                        nextPublished,
                      published_at:
                        nextPublished
                          ? item.published_at ||
                            new Date().toISOString()
                          : item.published_at,
                    }
                  : item,
            ),
          );

          setNotice(
            nextPublished
              ? 'Article published.'
              : 'Article moved to draft.',
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to update article status.',
          );
        }
      },
      [],
    );

  const filteredPosts =
    posts.filter((post) => {
      const searchValue =
        search.trim().toLowerCase();

      const matchesSearch =
        !searchValue ||
        post.title
          ?.toLowerCase()
          .includes(searchValue) ||
        post.slug
          ?.toLowerCase()
          .includes(searchValue) ||
        post.category
          ?.toLowerCase()
          .includes(searchValue);

      if (!matchesSearch) {
        return false;
      }

      if (filter === 'published') {
        return Boolean(post.published);
      }

      if (filter === 'draft') {
        return !post.published;
      }

      return true;
    });

  const publishedCount =
    posts.filter(
      (post) => post.published,
    ).length;

  const draftCount =
    posts.filter(
      (post) => !post.published,
    ).length;

  const openArticle =
    (post: BlogPost) => {
      if (!post.slug) return;

      window.open(
        `/blog/${post.slug}`,
        '_blank',
        'noopener,noreferrer',
      );
    };

  return (
    <PageLayout>
      <Seo
        title="Blog CMS"
        description="Manage blog articles."
      />

      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <FileText className="h-7 w-7 text-gray-900" />

                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  Blog CMS
                </h1>
              </div>

              <p className="mt-2 text-sm text-gray-600">
                Create, edit, save drafts and publish
                your articles.
              </p>
            </div>

            <button
              type="button"
              onClick={startNewArticle}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
            >
              <Plus className="h-4 w-4" />
              New Article
            </button>
          </div>

          {(error || notice) && (
            <div
              className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
                error
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-green-200 bg-green-50 text-green-700'
              }`}
            >
              {error || notice}
            </div>
          )}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Total Articles
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {posts.length}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Published
              </p>

              <p className="mt-1 text-2xl font-bold text-green-600">
                {publishedCount}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Drafts
              </p>

              <p className="mt-1 text-2xl font-bold text-amber-600">
                {draftCount}
              </p>
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
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
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ['all', 'All'],
                    [
                      'published',
                      'Published',
                    ],
                    ['draft', 'Drafts'],
                  ] as const
                ).map(
                  ([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setFilter(
                          value,
                        )
                      }
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                        filter === value
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-gray-200 bg-white">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading articles...
              </div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
              <FileText className="mx-auto h-10 w-10 text-gray-300" />

              <h2 className="mt-4 text-lg font-semibold text-gray-900">
                No articles found
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Create your first article or change
                the search/filter.
              </p>

              <button
                type="button"
                onClick={startNewArticle}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" />
                Create Article
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="divide-y divide-gray-100">
                {filteredPosts.map(
                  (post) => (
                    <article
                      key={post.id}
                      className="flex flex-col gap-4 p-5 transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                          <BlogImage
                            src={
                              post.image_url ||
                              PLACEHOLDER_IMAGE
                            }
                            alt={
                              post.image_alt ||
                              post.title ||
                              'Blog image'
                            }
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="truncate text-base font-semibold text-gray-900">
                              {post.title}
                            </h2>

                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                post.published
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {post.published
                                ? 'Published'
                                : 'Draft'}
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-gray-500">
                            {post.category}
                            {post.slug
                              ? ` • /blog/${post.slug}`
                              : ''}
                          </p>

                          {post.excerpt && (
                            <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                              {post.excerpt}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        {post.slug && (
                          <button
                            type="button"
                            onClick={() =>
                              openArticle(
                                post,
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            startEdit(
                              post,
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void handleTogglePublished(
                              post,
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                          {post.published ? (
                            <>
                              <EyeOff className="h-4 w-4" />
                              Draft
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4" />
                              Publish
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          disabled={
                            deletingId ===
                            post.id
                          }
                          onClick={() =>
                            void handleDelete(
                              post.id,
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId ===
                          post.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Delete
                        </button>
                      </div>
                    </article>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {showForm && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4 sm:p-6"
          onMouseDown={(event) => {
            /*
             * Do NOT close the editor when the user taps
             * somewhere outside a field.
             *
             * The editor must remain stable while writing.
             */
            if (
              event.target ===
              event.currentTarget
            ) {
              event.preventDefault();
            }
          }}
        >
          <div className="mx-auto flex min-h-full max-w-5xl items-center justify-center py-6">
            <section
              className="w-full overflow-hidden rounded-2xl bg-white shadow-2xl"
              onMouseDown={(event) =>
                event.stopPropagation()
              }
            >
              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 sm:px-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {editingId
                      ? 'Edit Article'
                      : 'Create Article'}
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Your work is automatically kept locally
                    while you write.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeEditor}
                  className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                  aria-label="Close editor"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form
                onSubmit={(event) => {
                  void handleSubmit(
                    event,
                    false,
                  );
                }}
                className="space-y-6 p-5 sm:p-6"
              >
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <div className="lg:col-span-2">
                    <label
                      htmlFor="title"
                      className="mb-2 block text-sm font-semibold text-gray-800"
                    >
                      Article Title
                    </label>

                    <input
                      id="title"
                      name="title"
                      value={form.title}
                      onChange={
                        handleTitleChange
                      }
                      placeholder="Enter article title"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="slug"
                      className="mb-2 block text-sm font-semibold text-gray-800"
                    >
                      Slug
                    </label>

                    <input
                      id="slug"
                      name="slug"
                      value={form.slug}
                      onChange={
                        handleSlugChange
                      }
                      onBlur={
                        handleSlugBlur
                      }
                      placeholder="article-slug"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500"
                    />

                    <p className="mt-1.5 text-xs text-gray-500">
                      Example:
                      relationship-tips
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="category"
                      className="mb-2 block text-sm font-semibold text-gray-800"
                    >
                      Category
                    </label>

                    <select
                      id="category"
                      name="category"
                      value={
                        form.category
                      }
                      onChange={
                        handleFieldChange
                      }
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-500"
                    >
                      {BLOG_CATEGORIES.map(
                        (category) => (
                          <option
                            key={category}
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

                  <div className="lg:col-span-2">
                    <label
                      htmlFor="excerpt"
                      className="mb-2 block text-sm font-semibold text-gray-800"
                    >
                      Short Excerpt
                    </label>

                    <textarea
                      id="excerpt"
                      name="excerpt"
                      value={
                        form.excerpt
                      }
                      onChange={
                        handleFieldChange
                      }
                      rows={3}
                      placeholder="Short description shown in article cards and SEO areas..."
                      className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="author"
                      className="mb-2 block text-sm font-semibold text-gray-800"
                    >
                      Author
                    </label>

                    <input
                      id="author"
                      name="author"
                      value={
                        form.author
                      }
                      onChange={
                        handleFieldChange
                      }
                      placeholder="Loveons Editorial"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="tags"
                      className="mb-2 block text-sm font-semibold text-gray-800"
                    >
                      Tags
                    </label>

                    <input
                      id="tags"
                      name="tags"
                      value={form.tags}
                      onChange={
                        handleFieldChange
                      }
                      placeholder="communication, relationships, trust"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-500"
                    />

                    <p className="mt-1.5 text-xs text-gray-500">
                      Separate tags with commas.
                    </p>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label
                      htmlFor="image_url"
                      className="block text-sm font-semibold text-gray-800"
                    >
                      Featured Image
                    </label>

                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50">
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}

                      {uploading
                        ? 'Uploading...'
                        : 'Upload Image'}

                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={
                          uploading
                        }
                        onChange={
                          handleImageUpload
                        }
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="md:col-span-2">
                      <input
                        id="image_url"
                        name="image_url"
                        value={
                          form.image_url
                        }
                        onChange={
                          handleFieldChange
                        }
                        placeholder="https://..."
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-500"
                      />
                    </div>

                    <div>
                      <input
                        id="image_alt"
                        name="image_alt"
                        value={
                          form.image_alt
                        }
                        onChange={
                          handleFieldChange
                        }
                        placeholder="Image alt text"
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-500"
                      />
                    </div>
                  </div>

                  {form.image_url && (
                    <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                      <BlogImage
                        src={
                          form.image_url
                        }
                        alt={
                          form.image_alt ||
                          form.title ||
                          'Featured image'
                        }
                        className="max-h-72 w-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="content"
                      className="block text-sm font-semibold text-gray-800"
                    >
                      Article Content
                    </label>

                    <span className="text-xs text-gray-500">
                      {estimateReadingTime(
                        form.content,
                      )}
                    </span>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-gray-200">
                    <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 p-2">
                      <button
                        type="button"
                        onClick={
                          applyBold
                        }
                        className="rounded-lg p-2 text-gray-600 transition hover:bg-white hover:text-gray-900"
                        title="Bold"
                      >
                        <Bold className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={
                          applyItalic
                        }
                        className="rounded-lg p-2 text-gray-600 transition hover:bg-white hover:text-gray-900"
                        title="Italic"
                      >
                        <Italic className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={
                          applyHeading
                        }
                        className="rounded-lg p-2 text-gray-600 transition hover:bg-white hover:text-gray-900"
                        title="Heading"
                      >
                        <Heading2 className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={
                          applyBulletList
                        }
                        className="rounded-lg p-2 text-gray-600 transition hover:bg-white hover:text-gray-900"
                        title="Bullet list"
                      >
                        <List className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={
                          applyNumberedList
                        }
                        className="rounded-lg p-2 text-gray-600 transition hover:bg-white hover:text-gray-900"
                        title="Numbered list"
                      >
                        <ListOrdered className="h-4 w-4" />
                      </button>

                      <div className="mx-1 h-6 w-px bg-gray-200" />

                      <button
                        type="button"
                        onClick={
                          openLinkEditor
                        }
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-white"
                        title="Add link"
                      >
                        <LinkIcon className="h-4 w-4" />
                        Add Link
                      </button>

                      <button
                        type="button"
                        onClick={
                          removeLink
                        }
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-white"
                        title="Remove link"
                      >
                        <Unlink className="h-4 w-4" />
                        Remove Link
                      </button>
                    </div>

                    <textarea
                      ref={contentRef}
                      id="content"
                      name="content"
                      value={
                        form.content
                      }
                      onChange={
                        handleFieldChange
                      }
                      rows={18}
                      placeholder="Write your article here..."
                      className="min-h-[420px] w-full resize-y border-0 px-4 py-4 text-sm leading-7 text-gray-900 outline-none"
                    />
                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    You can use Markdown links like
                    [Google](https://google.com).
                  </p>
                </div>

                {linkOpen && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          Add Link
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          Select text in the article,
                          then enter its URL.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setLinkOpen(
                            false,
                          )
                        }
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-white hover:text-gray-900"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <input
                        value={
                          linkText
                        }
                        onChange={(
                          event,
                        ) =>
                          setLinkText(
                            event.target
                              .value,
                          )
                        }
                        placeholder="Link text"
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                      />

                      <input
                        value={
                          linkUrl
                        }
                        onChange={(
                          event,
                        ) =>
                          setLinkUrl(
                            event.target
                              .value,
                          )
                        }
                        placeholder="https://example.com"
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                      />
                    </div>

                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={
                          insertLink
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
                      >
                        <LinkIcon className="h-4 w-4" />
                        Insert Link
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <div>
                    <label
                      htmlFor="meta_title"
                      className="mb-2 block text-sm font-semibold text-gray-800"
                    >
                      SEO Meta Title
                    </label>

                    <input
                      id="meta_title"
                      name="meta_title"
                      value={
                        form.meta_title
                      }
                      onChange={
                        handleFieldChange
                      }
                      placeholder="SEO title"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-500"
                    />

                    <p className="mt-1.5 text-xs text-gray-500">
                      Recommended: around 50–60 characters.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="meta_description"
                      className="mb-2 block text-sm font-semibold text-gray-800"
                    >
                      SEO Meta Description
                    </label>

                    <textarea
                      id="meta_description"
                      name="meta_description"
                      value={
                        form.meta_description
                      }
                      onChange={
                        handleFieldChange
                      }
                      rows={3}
                      placeholder="SEO description"
                      className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-500"
                    />

                    <p className="mt-1.5 text-xs text-gray-500">
                      Recommended: around 140–160 characters.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Article Status
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Save your work as a draft or publish it
                      when it is ready.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${
                        editingId
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {editingId
                        ? 'Editing existing article'
                        : 'New article'}
                    </span>

                    <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700">
                      {form.content.trim()
                        ? 'Unsaved changes are auto-recovered'
                        : 'Not started'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={closeEditor}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={(event) => {
                        const formElement =
                          event.currentTarget.form;

                        if (!formElement) {
                          return;
                        }

                        void handleSubmit(
                          {
                            preventDefault: () => {},
                          } as FormEvent<HTMLFormElement>,
                          false,
                        );
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}

                      {saving
                        ? 'Saving...'
                        : 'Save Draft'}
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      onClick={() => {
                        /*
                         * The form's normal submit handler saves
                         * a draft. This flag lets the next handler
                         * know that this button means Publish.
                         */
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}

                      {saving
                        ? 'Publishing...'
                        : 'Publish Article'}
                    </button>
                  </div>
                </div>
              </form>
            </section>
          </div>
        </div>
      )}

        {/* 
         * Editor recovery notice.
         * This stays outside the form so it does not interfere
         * with the article fields or submit behaviour.
         */}
        
        {showForm && (
          <div className="pointer-events-none fixed bottom-4 left-1/2 z-[60] -translate-x-1/2">
            <div className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-600 shadow-lg">
              {saving
                ? 'Saving your article...'
                : 'Your work is being kept safe locally.'}
            </div>
          </div>
        )}
      </>
    );
  }















    









