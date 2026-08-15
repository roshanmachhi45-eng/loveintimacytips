
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

/* =========================================================
   CONSTANTS
   ========================================================= */

const PLACEHOLDER_IMAGE =
  '/images/blogs/default.webp';

/*
 * Browser-only temporary recovery storage.
 *
 * This is NOT the Supabase database.
 * It is only used to protect the article while the
 * administrator is typing.
 */
const LOCAL_DRAFT_KEY =
  'loveons_blog_admin_unsaved_v19';

const LOCAL_DRAFT_MAX_AGE =
  1000 * 60 * 60 * 24 * 7;

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

/* =========================================================
   EMPTY FORM
   ========================================================= */

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

/*
 * CMS slug helper.
 *
 * Only:
 * a-z
 * 0-9
 * hyphen
 *
 * are allowed.
 */
function safeCmsSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

/* =========================================================
   LINK VALIDATION
   ========================================================= */

function isValidLink(value: string): boolean {
  const url = value.trim();

  if (!url) {
    return false;
  }

  /*
   * Internal links.
   *
   * Example:
   * /blog/building-trust
   */
  if (url.startsWith('/')) {
    return true;
  }

  /*
   * External links.
   */
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

/* =========================================================
   PAYLOAD
   ========================================================= */

function createPayload(
  form: FormData,
  published: boolean,
  existingPublishedAt?: string | null
) {
  const finalSlug =
    safeCmsSlug(form.slug || form.title);

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
   COMPONENT
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
   * Unsaved changes.
   */
  const [hasUnsavedChanges, setHasUnsavedChanges] =
    useState(false);

  /*
   * Recovery.
   */
  const [showRecovery, setShowRecovery] =
    useState(false);

  const [recoveryData, setRecoveryData] =
    useState<{
      editingId: string | null;
      form: FormData;
      savedAt: number;
    } | null>(null);

  /*
   * Article textarea.
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

  /*
   * Prevent the initial recovery check from
   * being confused with an empty form.
   */
  const recoveryChecked =
    useRef(false);

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
     RECOVER LOCAL ARTICLE
     ======================================================= */

  useEffect(() => {
    if (recoveryChecked.current) {
      return;
    }

    recoveryChecked.current = true;

    try {
      const raw =
        window.localStorage.getItem(
          LOCAL_DRAFT_KEY
        );

      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw);

      if (
        !parsed ||
        typeof parsed !== 'object' ||
        !parsed.form ||
        typeof parsed.savedAt !==
          'number'
      ) {
        window.localStorage.removeItem(
          LOCAL_DRAFT_KEY
        );

        return;
      }

      const age =
        Date.now() -
        parsed.savedAt;

      if (
        age >
        LOCAL_DRAFT_MAX_AGE
      ) {
        window.localStorage.removeItem(
          LOCAL_DRAFT_KEY
        );

        return;
      }

      const recoveredForm: FormData = {
        ...emptyForm,
        ...parsed.form,
      };

      const hasActualContent =
        recoveredForm.title.trim() ||
        recoveredForm.excerpt.trim() ||
        recoveredForm.content.trim() ||
        recoveredForm.slug.trim();

      if (!hasActualContent) {
        window.localStorage.removeItem(
          LOCAL_DRAFT_KEY
        );

        return;
      }

      setRecoveryData({
        editingId:
          parsed.editingId ??
          null,

        form: recoveredForm,

        savedAt:
          parsed.savedAt,
      });

      setShowRecovery(true);
    } catch {
      try {
        window.localStorage.removeItem(
          LOCAL_DRAFT_KEY
        );
      } catch {
        // Ignore storage failure.
      }
    }
  }, []);

  /* =======================================================
     AUTO SAVE TO LOCAL STORAGE
     ======================================================= */

  useEffect(() => {
    if (!showForm) {
      return;
    }

    const hasContent =
      form.title.trim() ||
      form.excerpt.trim() ||
      form.content.trim() ||
      form.slug.trim() ||
      form.tags.trim() ||
      form.meta_title.trim() ||
      form.meta_description.trim();

    if (!hasContent) {
      return;
    }

    try {
      window.localStorage.setItem(
        LOCAL_DRAFT_KEY,
        JSON.stringify({
          editingId,
          form,
          savedAt: Date.now(),
        })
      );

      setHasUnsavedChanges(true);
    } catch {
      /*
       * If browser storage is unavailable,
       * the CMS still continues working normally.
       */
    }
  }, [
    showForm,
    editingId,
    form,
  ]);

  /* =======================================================
     PAGE LEAVE WARNING
     ======================================================= */

  useEffect(() => {
    if (
      !showForm ||
      !hasUnsavedChanges
    ) {
      return;
    }

    const handleBeforeUnload = (
      event: BeforeUnloadEvent
    ) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener(
      'beforeunload',
      handleBeforeUnload
    );

    return () => {
      window.removeEventListener(
        'beforeunload',
        handleBeforeUnload
      );
    };
  }, [
    showForm,
    hasUnsavedChanges,
  ]);

  /* =======================================================
     RESET FORM
     ======================================================= */

  const clearLocalRecovery = () => {
    try {
      window.localStorage.removeItem(
        LOCAL_DRAFT_KEY
      );
    } catch {
      // Ignore storage failure.
    }
  };

  const resetForm = (
    force = false
  ) => {
    if (
      !force &&
      showForm &&
      hasUnsavedChanges
    ) {
      const confirmed =
        window.confirm(
          'You have unsaved changes. Are you sure you want to close this article?'
        );

      if (!confirmed) {
        return;
      }
    }

    setEditingId(null);

    setForm({
      ...emptyForm,
    });

    setShowForm(false);

    setHasUnsavedChanges(false);

    setLinkOpen(false);

    setLinkText('');

    setLinkUrl('');

    setError('');

    clearLocalRecovery();
  };

  /* =======================================================
     NEW ARTICLE
     ======================================================= */

  const openNewArticle = () => {
    if (
      showForm &&
      hasUnsavedChanges
    ) {
      const confirmed =
        window.confirm(
          'You have unsaved changes. Start a new article and discard the current changes?'
        );

      if (!confirmed) {
        return;
      }
    }

    setEditingId(null);

    setForm({
      ...emptyForm,
    });

    setLinkOpen(false);

    setLinkText('');

    setLinkUrl('');

    setError('');

    setHasUnsavedChanges(false);

    clearLocalRecovery();

    setShowForm(true);
  };

  /* =======================================================
     RECOVER ARTICLE
     ======================================================= */

  const recoverArticle = () => {
    if (!recoveryData) {
      return;
    }

    setEditingId(
      recoveryData.editingId
    );

    setForm({
      ...recoveryData.form,
    });

    setHasUnsavedChanges(true);

    setShowForm(true);

    setShowRecovery(false);

    setRecoveryData(null);

    setError('');
  };

  const discardRecoveredArticle =
    () => {
      clearLocalRecovery();

      setRecoveryData(null);

      setShowRecovery(false);
    };

  /* =======================================================
     IMAGE UPLOAD
     ======================================================= */

  const handleImageUpload = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploading(true);

      setError('');

      const url =
        await uploadBlogImage(file);

      setForm((current) => ({
        ...current,
        image_url: url,
      }));

      setHasUnsavedChanges(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Image upload failed'
      );
    } finally {
      setUploading(false);

      event.target.value = '';
    }
  };

  /* =======================================================
     VALIDATE
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

    const finalSlug =
      safeCmsSlug(
        form.slug ||
          form.title
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
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      setError('');

      const existingPost =
        editingId
          ? posts.find(
              (post) =>
                post.id ===
                editingId
            )
          : null;

      const payload =
        createPayload(
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

      /*
       * IMPORTANT:
       * Reload only after the database
       * request succeeds.
       */
      await loadPosts();

      /*
       * Database save succeeded.
       * Now local recovery copy can be removed.
       */
      clearLocalRecovery();

      setHasUnsavedChanges(false);

      setEditingId(null);

      setForm({
        ...emptyForm,
      });

      setLinkOpen(false);

      setLinkText('');

      setLinkUrl('');

      setShowForm(false);

      setError('');
    } catch (err) {
      /*
       * Keep the editor open.
       * Keep local backup.
       *
       * This is important:
       * if Supabase save fails, the article
       * must NOT disappear.
       */
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save article. Your article is still open and has been kept locally.'
      );

      setHasUnsavedChanges(true);
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     FORM SUBMIT
     ======================================================= */

  const handleSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    await saveArticle(false);
  };

  /* =======================================================
     EDIT
     ======================================================= */

  const handleEdit = (
    post: BlogPost
  ) => {
    if (
      showForm &&
      hasUnsavedChanges
    ) {
      const confirmed =
        window.confirm(
          'You have unsaved changes. Open another article and discard the current changes?'
        );

      if (!confirmed) {
        return;
      }
    }

    setEditingId(post.id);

    setForm({
      title: post.title,

      slug:
        post.slug || '',

      category:
        post.category,

      excerpt:
        post.excerpt,

      content:
        post.content,

      image_url:
        post.image_url || '',

      image_alt:
        post.image_alt || '',

      author:
        post.author ||
        'Loveons Editorial',

      tags:
        post.tags.join(', '),

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

    setHasUnsavedChanges(
      false
    );

    /*
     * Existing article editing should not
     * inherit a previous new-article recovery.
     */
    clearLocalRecovery();

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

    if (!confirmed) {
      return;
    }

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
     INSERT CONTENT AT SELECTION
     ======================================================= */

  const insertIntoContent = (
    value: string,
    start?: number,
    end?: number
  ) => {
    const textarea =
      contentRef.current;

    const selectionStart =
      start ??
      textarea?.selectionStart ??
      form.content.length;

    const selectionEnd =
      end ??
      textarea?.selectionEnd ??
      selectionStart;

    const newContent =
      form.content.slice(
        0,
        selectionStart
      ) +
      value +
      form.content.slice(
        selectionEnd
      );

    setForm((current) => ({
      ...current,
      content: newContent,
    }));

    setHasUnsavedChanges(true);

    requestAnimationFrame(() => {
      if (!textarea) {
        return;
      }

      textarea.focus();

      const nextPosition =
        selectionStart +
        value.length;

      textarea.setSelectionRange(
        nextPosition,
        nextPosition
      );
    });
  };

  /* =======================================================
     ADD LINK
     ======================================================= */

  const openLinkEditor = () => {
    const textarea =
      contentRef.current;

    const start =
      textarea?.selectionStart ??
      form.content.length;

    const end =
      textarea?.selectionEnd ??
      start;

    const selectedText =
      form.content.slice(
        start,
        end
      );

    setLinkText(
      selectedText
    );

    setLinkUrl('');

    setLinkOpen(true);

    setError('');
  };

  const addLink = () => {
    const text =
      linkText.trim();

    const url =
      linkUrl.trim();

    if (!text) {
      setError(
        'Select the text you want to link, or enter link text.'
      );

      return;
    }

    if (!isValidLink(url)) {
      setError(
        'Enter a valid URL. Example: /blog/example or https://example.com'
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

    /*
     * IMPORTANT:
     * Only selected text becomes the link.
     *
     * Result:
     * [honest conversation](https://google.com)
     */
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
     REMOVE LINK
     ======================================================= */

  const removeLink = () => {
    const textarea =
      contentRef.current;

    if (!textarea) {
      setError(
        'Select a link first.'
      );

      return;
    }

    const start =
      textarea.selectionStart;

    const end =
      textarea.selectionEnd;

    if (start === end) {
      setError(
        'Select the linked text first.'
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
     * [honest conversation](https://google.com)
     *
     * to:
     *
     * honest conversation
     */
    const plainText =
      selected.replace(
        /^\[([\s\S]+)\]\(([^)]+)\)$/,
        '$1'
      );

    if (
      plainText ===
      selected
    ) {
      setError(
        'The selected text is not a Markdown link.'
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
     FORMATTING
     ======================================================= */

  const wrapSelection = (
    before: string,
    after: string = before
  ) => {
    const textarea =
      contentRef.current;

    if (!textarea) {
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
    wrapSelection(
      '## ',
      ''
    );
  };

  const addBullet = () => {
    wrapSelection(
      '- ',
      ''
    );
  };

  const addNumbered = () => {
    wrapSelection(
      '1. ',
      ''
    );
  };

  /* =======================================================
     SEARCH
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
              .includes(query)
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
        post.published
    ).length;

  const draftCount =
    posts.filter(
      (post) =>
        !post.published
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
        {/* =================================================
            RECOVERY NOTICE
        ================================================= */}

        {showRecovery &&
          recoveryData && (
            <div className="mb-5 rounded-3xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-amber-800">
                    Unsaved article recovered
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-700">
                    We found an article
                    you were working on
                    before the page was
                    refreshed or closed.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={
                      recoverArticle
                    }
                    className="rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-600"
                  >
                    Recover
                  </button>

                  <button
                    type="button"
                    onClick={
                      discardRecoveredArticle
                    }
                    className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-amber-700 ring-1 ring-amber-200 hover:bg-amber-100"
                  >
                    Discard
                  </button>
                </div>
              </div>
            </div>
          )}

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
            {error}
          </div>
        )}

        {/* =================================================
            HEADER
        ================================================= */}

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

          {/* SEARCH */}

          <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search articles, categories or tags..."
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-rose-300 focus:bg-white focus:ring-2 focus:ring-rose-100"
              />
            </div>

            {/* FILTER */}

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

        {/* =================================================
            ARTICLE LIST
        ================================================= */}

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
          >
            <div
              className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              {/* HEADER */}

              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-rose-100 bg-white px-5 py-4 sm:px-6">
                <div>
                  <h2 className="font-display text-lg font-bold text-gray-800">
                    {editingId
                      ? 'Edit Article'
                      : 'New Article'}
                  </h2>

                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {hasUnsavedChanges
                        ? 'Changes protected locally'
                        : 'Ready to edit'}
                    </span>

                    {hasUnsavedChanges && (
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    resetForm()
                  }
                  className="rounded-xl p-2 transition hover:bg-rose-50"
                  title="Close editor"
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
                {/* =================================================
                    IMAGE
                ================================================= */}

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
                        onChange={(event) =>
                          setForm({
                            ...form,
                            image_url:
                              event.target
                                .value,
                          })
                        }
                        placeholder="Or paste image URL"
                        className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                      />
                    </div>
                  </div>
                </section>

                {/* =================================================
                    BASIC CONTENT
                ================================================= */}

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
                      onChange={(event) => {
                        const title =
                          event.target
                            .value;

                        setForm(
                          (current) => ({
                            ...current,

                            title,

                            slug:
                              editingId ||
                              current.slug
                                ? current.slug
                                : safeCmsSlug(
                                    title
                                  ),
                          })
                        );

                        setHasUnsavedChanges(
                          true
                        );
                      }}
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
                        onChange={(event) => {
                          setForm({
                            ...form,
                            category:
                              event.target
                                .value,
                          });

                          setHasUnsavedChanges(
                            true
                          );
                        }}
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
                        onChange={(event) => {
                          setForm({
                            ...form,
                            slug: safeCmsSlug(
                              event.target
                                .value
                            ),
                          });

                          setHasUnsavedChanges(
                            true
                          );
                        }}
                        placeholder="example-blog-slug"
                        className="w-full rounded-2xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                        required
                      />

                      <p className="mt-1 text-[11px] text-gray-400">
                        URL-safe format:
                        letters, numbers and
                        hyphens.
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
                      onChange={(event) => {
                        setForm({
                          ...form,
                          excerpt:
                            event.target
                              .value,
                        });

                        setHasUnsavedChanges(
                          true
                        );
                      }}
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
                        className="rounded-lg p-2 text-gray-600 hover:bg-white hover:text-rose-600"
                        title="Bold"
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
                        className="rounded-lg p-2 text-gray-600 hover:bg-white hover:text-rose-600"
                        title="Italic"
                      >
                        <Italic className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={
                          addHeading
                        }
                        className="rounded-lg p-2 text-gray-600 hover:bg-white hover:text-rose-600"
                        title="Heading"
                      >
                        <Heading2 className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={
                          addBullet
                        }
                        className="rounded-lg p-2 text-gray-600 hover:bg-white hover:text-rose-600"
                        title="Bullet list"
                      >
                        <List className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={
                          addNumbered
                        }
                        className="rounded-lg p-2 text-gray-600 hover:bg-white hover:text-rose-600"
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
                        className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-2 text-xs font-semibold text-rose-600 shadow-sm ring-1 ring-rose-100 hover:bg-rose-50"
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
                        className="rounded-lg p-2 text-gray-

