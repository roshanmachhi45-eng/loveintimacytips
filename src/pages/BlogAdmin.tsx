import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Pencil, X, Upload, Eye, EyeOff, Loader2 } from 'lucide-react';
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

const PLACEHOLDER_IMAGE = '/images/blogs/default.webp';

interface FormData {
  title: string;
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

export default function BlogAdmin() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAllPosts();
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      setError('');
      const url = await uploadBlogImage(file);
      setForm((f) => ({ ...f, image_url: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.excerpt || !form.content) {
      setError('Title, description, and article content are required.');
      return;
    }
    try {
      setSaving(true);
      setError('');
      const slug = slugify(form.title);
      const readingTime = estimateReadingTime(form.content);
      const tagsArray = form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title: form.title,
        slug,
        category: form.category,
        excerpt: form.excerpt,
        content: form.content,
        image_url: form.image_url || null,
        image_alt: form.image_alt || form.title,
        author: form.author,
        published: true,
        published_at: new Date().toISOString(),
        reading_time: readingTime,
        tags: tagsArray,
        meta_title: form.meta_title || form.title,
        meta_description: form.meta_description || form.excerpt,
      };

      if (editingId) {
        await updatePost(editingId, payload);
      } else {
        await createPost(payload as Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>);
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setForm({
      title: post.title,
      category: post.category,
      excerpt: post.excerpt,
      content: post.content,
      image_url: post.image_url || '',
      image_alt: post.image_alt || '',
      author: post.author,
      tags: post.tags.join(', '),
      meta_title: post.meta_title || '',
      meta_description: post.meta_description || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this article? This cannot be undone.')) return;
    try {
      await deletePost(id);
      await loadPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const togglePublish = async (post: BlogPost) => {
    try {
      await updatePost(post.id, {
        published: !post.published,
        published_at: !post.published ? new Date().toISOString() : post.published_at,
      });
      await loadPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  return (
    <>
      <Seo
        title="Blog Admin — Loveons"
        description="Manage blog articles for the Loveons relationship wellness platform."
        path="/admin/blog"
      />
      <PageLayout title="Blog Admin" subtitle="Publish and manage relationship wellness articles.">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">{posts.length} articles total</p>
          <button
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> New Article
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-rose-400 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No articles yet. Click "New Article" to publish your first blog post.
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-rose-100 shadow-sm"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-rose-50">
                  <BlogImage
                    src={post.image_url}
                    alt={post.image_alt || post.title}
                    className="w-full h-full"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-800 truncate">{post.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-medium">
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-400">{post.reading_time}</span>
                    {post.published ? (
                      <span className="text-xs text-green-600 font-medium">Published</span>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium">Draft</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => togglePublish(post)}
                    className="p-2 rounded-lg hover:bg-rose-50 transition-colors"
                    title={post.published ? 'Unpublish' : 'Publish'}
                  >
                    {post.published ? (
                      <Eye className="w-4 h-4 text-green-500" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(post)}
                    className="p-2 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 fade-in"
            onClick={() => setShowForm(false)}
          >
            <div
              className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-rose-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
                <h2 className="font-display text-lg font-bold text-gray-800">
                  {editingId ? 'Edit Article' : 'New Article'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 rounded-xl hover:bg-rose-50 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Featured Image</label>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-rose-50 flex-shrink-0 border border-rose-100">
                      <BlogImage
                        src={form.image_url || PLACEHOLDER_IMAGE}
                        alt="Preview"
                        className="w-full h-full"
                        loading="eager"
                      />
                    </div>
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="file"
                        accept="image/webp,image/avif,image/jpeg,image/png"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-rose-200 text-sm text-rose-500 font-medium hover:bg-rose-50 transition-colors">
                        {uploading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        {uploading ? 'Uploading...' : 'Upload Image'}
                      </div>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    placeholder="Or paste image URL"
                    className="mt-2 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Blog Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Enter article title"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
                  >
                    {BLOG_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Short Description *</label>
                  <textarea
                    value={form.excerpt}
                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                    placeholder="Brief summary shown on blog cards and search results"
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Article Content *</label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    placeholder="Write your article here. Separate paragraphs with blank lines."
                    rows={8}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-y leading-relaxed"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Author</label>
                    <input
                      type="text"
                      value={form.author}
                      onChange={(e) => setForm({ ...form, author: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={form.tags}
                      onChange={(e) => setForm({ ...form, tags: e.target.value })}
                      placeholder="communication, trust"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Image Alt Text</label>
                  <input
                    type="text"
                    value={form.image_alt}
                    onChange={(e) => setForm({ ...form, image_alt: e.target.value })}
                    placeholder="Describe the image for accessibility"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Meta Title (SEO)</label>
                  <input
                    type="text"
                    value={form.meta_title}
                    onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                    placeholder="Defaults to article title if empty"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Meta Description (SEO)</label>
                  <textarea
                    value={form.meta_description}
                    onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                    placeholder="Defaults to short description if empty"
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 rounded-2xl bg-rose-500 text-white font-semibold text-sm hover:bg-rose-600 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {editingId ? 'Update & Publish' : 'Publish Article'}
                </button>
              </form>
            </div>
          </div>
        )}
      </PageLayout>
    </>
  );
}
