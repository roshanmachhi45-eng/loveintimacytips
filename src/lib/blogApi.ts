
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
   * 1. If the database already contains a local image path,
   * keep it.
   */
  if (
    rawImage &&
    rawImage.startsWith('/images/blogs/')
  ) {
    return rawImage;
  }

  /*
   * 2. If database contains only a local filename,
   * convert it to the correct public path.
   *
   * Example:
   * communication.webp
   * ->
   * /images/blogs/communication.webp
   */
  if (
    rawImage &&
    /^[a-z0-9-]+\.(webp|jpg|jpeg|png|avif)$/i.test(
      rawImage
    )
  ) {
    const filename = rawImage
      .split('/')
      .pop()
      ?.toLowerCase();

    if (filename) {
      const localFile =
        Object.values(LOCAL_BLOG_IMAGES).find(
          (path) =>
            path.toLowerCase().endsWith(filename)
        );

      if (localFile) {
        return localFile;
      }
    }
  }

  /*
   * 3. Try to identify the correct local image
   * from slug + title + category.
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

  if (
    searchText.includes('relationship')
  ) {
    return LOCAL_BLOG_IMAGES.relationship;
  }

  /*
   * 4. Final safe fallback.
   */
  return FALLBACK_IMAGE;
}

/* =========================================================
   APPLY IMAGE RESOLUTION
   ========================================================= */

function normalizePost(
  post: BlogPost
): BlogPost {
  return {
    ...post,
    image_url: resolveBlogImage(post),
  };
}

/* =========================================================
   FETCH PUBLISHED POSTS
   ========================================================= */

export async function fetchPublishedPosts(): Promise<
  BlogPost[]
> {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('published_at', {
        ascending: false,
      });

    if (error) {
      return [];
    }

    return (
      ((data as BlogPost[]) || []).map(
        normalizePost
      )
    );
  } catch {
    return [];
  }
}

/* =========================================================
   FETCH SINGLE POST
   ========================================================= */

export async function fetchPostBySlug(
  slug: string
): Promise<BlogPost | null> {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return normalizePost(data as BlogPost);
  } catch {
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
      .limit(limit);

    if (error) {
      return [];
    }

    return (
      ((data as BlogPost[]) || []).map(
        normalizePost
      )
    );
  } catch {
    return [];
  }
}

/* =========================================================
   FETCH ALL POSTS
   ========================================================= */

export async function fetchAllPosts(): Promise<
  BlogPost[]
> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (
    (data as BlogPost[]).map(normalizePost)
  );
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
  const { data, error } = await supabase
    .from('blog_posts')
    .insert(post)
    .select()
    .single();

  if (error) {
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
  const { data, error } = await supabase
    .from('blog_posts')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return normalizePost(data as BlogPost);
}

/* =========================================================
   DELETE POST
   ========================================================= */

export async function deletePost(
  id: string
): Promise<void> {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}

/* =========================================================
   UPLOAD BLOG IMAGE
   ========================================================= */

export async function uploadBlogImage(
  file: File
): Promise<string> {
  const ext =
    file.name.split('.').pop() || 'jpg';

  const filename = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 9)}.${ext}`;

  const { error } = await supabase.storage
    .from('blog_images')
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
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

export function slugify(
  text: string
): string {
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
  const words = content
    .trim()
    .split(/\s+/)
    .length;

  const minutes = Math.max(
    1,
    Math.ceil(words / 200)
  );

  return `${minutes} min read`;
}

