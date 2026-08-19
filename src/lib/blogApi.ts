
import { createClient } from 'contentful';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: any; // Contentful Rich Text ke liye
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

// Contentful Client Setup
const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID || '',
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN || '',
});

export const FALLBACK_IMAGE = '/images/blogs/default.webp';

/* =========================================================
CONTENTFUL DATA NORMALIZATION (Future image mapping ke sath)
========================================================= */
function normalizeContentfulPost(item: any): BlogPost {
  const fields = item.fields;
  
  // Future image field se dynamic URL nikalna
  const assetUrl = fields.futureImage?.fields?.file?.url;
  const image_url = assetUrl ? `https:${assetUrl}` : FALLBACK_IMAGE;

  const rawContent = fields.content || '';
  
  return {
    id: item.sys.id,
    title: fields.title || '',
    slug: fields.slug || '',
    category: fields.category || '',
    excerpt: fields.excerpt || '',
    content: rawContent, 
    image_url: image_url,
    image_alt: fields.image_alt || fields.title || null,
    author: fields.author || 'Anonymous',
    published: true, // Contentful sirf published blogs hi laata hai
    published_at: item.sys.createdAt,
    reading_time: fields.reading_time || estimateReadingTime(JSON.stringify(rawContent)),
    tags: Array.isArray(fields.tags) ? fields.tags : [],
    meta_title: fields.meta_title || null,
    meta_description: fields.meta_description || null,
    created_at: item.sys.createdAt,
    updated_at: item.sys.updatedAt,
  };
}

/* =========================================================
FETCH SAARE BLOGS
========================================================= */
export async function fetchPublishedPosts(): Promise<BlogPost[]> {
  try {
    const response = await client.getEntries({
      content_type: 'blogPost', // Contentful dashboard ki content type ID se match hona chahiye
      order: ['-sys.createdAt'], // New blogs top par aayenge
    });
    
    return response.items.map(normalizeContentfulPost);
  } catch (error) {
    console.error('fetchPublishedPosts Error:', error);
    return [];
  }
}

/* =========================================================
FETCH SINGLE BLOG (Slug Se)
========================================================= */
export async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const response = await client.getEntries({
      content_type: 'blogPost',
      'fields.slug': slug,
      limit: 1,
    });

    if (!response.items.length) return null;
    return normalizeContentfulPost(response.items[0]); // Pehla item return karega
  } catch (error) {
    console.error('fetchPostBySlug Error:', error);
    return null;
  }
}

/* =========================================================
FETCH RELATED BLOGS (Same Category Ke)
========================================================= */
export async function fetchRelatedPosts(
  category: string,
  excludeSlug: string,
  limit = 3
): Promise<BlogPost[]> {
  try {
    const response = await client.getEntries({
      content_type: 'blogPost',
      'fields.category': category,
      'fields.slug[ne]': excludeSlug, // [ne] ka matlab Not Equal
      limit: limit,
      order: ['-sys.createdAt'],
    });

    return response.items.map(normalizeContentfulPost);
  } catch (error) {
    console.error('fetchRelatedPosts Error:', error);
    return [];
  }
}

/* =========================================================
FETCH ALL POSTS FALLBACK
========================================================= */
export async function fetchAllPosts(): Promise<BlogPost[]> {
  return fetchPublishedPosts();
}

/* =========================================================
READING TIME ESTIMATOR
========================================================= */
export function estimateReadingTime(content: string): string {
  const cleanContent = content.trim();
  if (!cleanContent) return '1 min read';
  const words = cleanContent.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

