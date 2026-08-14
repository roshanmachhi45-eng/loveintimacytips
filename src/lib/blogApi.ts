
import { supabase } from './supabase';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  image_url: string | null;
  image_alt: string | null;
  author: string;
  published: boolean;
  published_at: string | null;
  reading_time: string | null;
  tags: string[];
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export const FALLBACK_IMAGE = '/images/blogs/default.webp';

/* =========================================================
   LOCAL BLOG IMAGE MAP
   ========================================================= */

const LOCAL_BLOG_IMAGES: Record<string, string> = {
  communication: '/images/blogs/communication.webp',
  conflict: '/images/blogs/conflict.webp',
  'date-ideas': '/images/blogs/date-ideas.webp',
  'relationship-tips': '/images/blogs/relationship-tips.webp',
  relationship: '/images/blogs/relationship.webp',
  trust: '/images/blogs/trust.webp',
};

/* =========================================================
   RESOLVE BLOG IMAGE
   ========================================================= */

function resolveBlogImage(post: BlogPost): string {
  const rawImage = post.image_url?.trim();

  /*
   * 1. Existing local public image path
   */
  if (rawImage && rawImage.startsWith('/images/blogs/')) {
    return rawImage;
  }

  /*
   * 2. Existing local filename
   *
   * communication.webp
   * ->
   * /images/blogs/communication.webp
   */
  if (
    rawImage &&
    /^[a-z0-9-]+\.(webp|jpg|jpeg|png|avif)$/i.test(rawImage)
  ) {
    const filename = rawImage.split('/').pop()?.toLowerCase();

    if (filename) {
      const localFile = Object.values(LOCAL_BLOG_IMAGES).find((path) =>
        path.toLowerCase().endsWith(filename)
      );

      if (localFile) {
        return localFile;
      }
    }
  }

  /*
   * 3. Identify image from slug/title/category
   */
  const searchText = [
    post.slug,
    post.title,
    post.category,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (
    searchText.includes('communication') ||
    searchText.includes('communicate')
  ) {
    return LOCAL_BLOG_IMAGES.communication;
  }

  if (
    searchText.includes('conflict') ||
    searchText.includes('argument') ||
    searchText.includes('fighting')
  ) {
    return LOCAL_BLOG_IMAGES.conflict;
  }

  if (
    searchText.includes('date') ||
    searchText.includes('dating')
  ) {
    return LOCAL_BLOG_IMAGES['date-ideas'];
  }

  if (
    searchText.includes('trust') ||
    searchText.includes('commitment')
  ) {
    return LOCAL_BLOG_IMAGES.trust;
  }

  if (
    searchText.includes('relationship tip') ||
    searchText.includes('relationship advice') ||
    searchText.includes('healthy relationship')
  ) {
    return LOCAL_BLOG_IMAGES['relationship-tips'];
  }

  if (searchText.includes('relationship')) {
    return LOCAL_BLOG_IMAGES.relationship;
  }

  /*
   * 4. Safe fallback
   */
  return FALLBACK_IMAGE;
}

/* =========================================================
   NORMALIZE POST
   ========================================================= */

function normalizePost(post: BlogPost): BlogPost {
  return {
    ...post,
    image_url: resolveBlogImage(post),
    tags: Array.isArray(post.tags) ? post.tags : [],
  };
}

/* =========================================================
   FETCH PUBLISHED POSTS
   ========================================================= */

export async function fetchPublishedPosts(): Promise<BlogPost[]> {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('published_at', {
        ascending: false,
      });

    if (error) {
      console.error('fetchPublishedPosts:', error);
      return [];
    }

    return ((data as BlogPost[]) || []).map(normalizePost);
  } catch (error) {
    console.error('fetchPublishedPosts:', error);
    return [];
  }
}

/* =========================================================
   FETCH SINGLE PUBLISHED POST
   ========================================================= */

export async function fetchPostBySlug(
  slug: string
): Promise<BlogPost | null> {
  try {
    const cleanSlug = slugify(slug);

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', cleanSlug)
      .eq('published', true)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return normalizePost(data as BlogPost);
  } catch (error) {
    console.error('fetchPostBySlug:', error);
    return null;
  }
}

/* =========================================================
   FETCH RELATED POSTS
   ========================================================= */

export async function fetchRelatedPosts(
  category: string,
  excludeSlug: string,
  limit = 3
): Promise<BlogPost[]> {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .eq('category', category)
      .neq('slug', excludeSlug)
      .order('published_at', {
        ascending: false,
      })
      .limit(limit);

    if (error) {
      console.error('fetchRelatedPosts:', error);
      return [];
    }

    return ((data as BlogPost[]) || []).map(normalizePost);
  } catch (error) {
    console.error('fetchRelatedPosts:', error);
    return [];
  }
}

/* =========================================================
   FETCH ALL POSTS
   ========================================================= */

export async function fetchAllPosts(): Promise<BlogPost[]> {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    return ((data as BlogPost[]) || []).map(normalizePost);
  } catch (error) {
    console.error('fetchAllPosts:', error);
    throw error;
  }
}

/* =========================================================
   CREATE POST
   ========================================================= */

export async function createPost(
  post: Omit<
    BlogPost,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<BlogPost> {
  const safeSlug = slugify(post.slug || post.title);

  const payload = {
    ...post,
    slug: safeSlug,
    tags: Array.isArray(post.tags) ? post.tags : [],
    published_at: post.published
      ? post.published_at || new Date().toISOString()
      : post.published_at || null,
    reading_time:
      post.reading_time || estimateReadingTime(post.content),
  };

  const { data, error } = await supabase
    .from('blog_posts')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('createPost:', error);
    throw error;
  }

  return normalizePost(data as BlogPost);
}

/* =========================================================
   UPDATE POST
   ========================================================= */

export async function updatePost(
  id: string,
  updates: Partial<BlogPost>
): Promise<BlogPost> {
  const payload: Partial<BlogPost> = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  /*
   * Keep slug SEO-friendly when it is changed.
   */
  if (payload.slug) {
    payload.slug = slugify(payload.slug);
  }

  /*
   * Make sure tags always remain an array.
   */
  if (payload.tags && !Array.isArray(payload.tags)) {
    payload.tags = [];
  }

  /*
   * Automatically calculate reading time
   * when article content changes.
   */
  if (payload.content) {
    payload.reading_time = estimateReadingTime(
      payload.content
    );
  }

  /*
   * Publishing logic
   *
   * Published -> make sure published_at exists.
   * Unpublished -> keep existing published_at so
   * we don't destroy historical publish information.
   */
  if (payload.published === true && !payload.published_at) {
    payload.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('updatePost:', error);
    throw error;
  }

  return normalizePost(data as BlogPost);
}

/* =========================================================
   DELETE POST
   ========================================================= */

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('deletePost:', error);
    throw error;
  }
}

/* =========================================================
   PUBLISH POST
   ========================================================= */

export async function publishPost(
  id: string
): Promise<BlogPost> {
  return updatePost(id, {
    published: true,
    published_at: new Date().toISOString(),
  });
}

/* =========================================================
   UNPUBLISH POST
   ========================================================= */

export async function unpublishPost(
  id: string
): Promise<BlogPost> {
  return updatePost(id, {
    published: false,
  });
}

/* =========================================================
   UPLOAD BLOG IMAGE
   ========================================================= */

export async function uploadBlogImage(
  file: File
): Promise<string> {
  const extension =
    file.name.split('.').pop()?.toLowerCase() || 'jpg';

  const safeExtension = [
    'webp',
    'avif',
    'jpg',
    'jpeg',
    'png',
  ].includes(extension)
    ? extension
    : 'jpg';

  const filename = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 9)}.${safeExtension}`;

  const { error } = await supabase.storage
    .from('blog_images')
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('uploadBlogImage:', error);
    throw error;
  }

  const { data } = supabase.storage
    .from('blog_images')
    .getPublicUrl(filename);

  return data.publicUrl;
}

/* =========================================================
   SLUGIFY
   ========================================================= */

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/* =========================================================
   READING TIME
   ========================================================= */

export function estimateReadingTime(
  content: string
): string {
  const cleanContent = content.trim();

  if (!cleanContent) {
    return '1 min read';
  }

  const words = cleanContent
    .split(/\s+/)
    .filter(Boolean).length;

  const minutes = Math.max(
    1,
    Math.ceil(words / 200)
  );

  return `${minutes} min read`;
}

/* =========================================================
   CHECK SLUG AVAILABILITY
   ========================================================= */

export async function isSlugAvailable(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const cleanSlug = slugify(slug);

  if (!cleanSlug) {
    return false;
  }

  let query = supabase
    .from('blog_posts')
    .select('id')
    .eq('slug', cleanSlug)
    .limit(1);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error('isSlugAvailable:', error);

    /*
     * Don't incorrectly block the editor if the
     * availability check itself fails.
     */
    return true;
  }

  return !data;
}
