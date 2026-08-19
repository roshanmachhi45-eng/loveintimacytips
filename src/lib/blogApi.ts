
/* =========================================================
   LOVEONS BLOG API
   Contentful-powered version
   ========================================================= */

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
   CONTENTFUL CONFIG
   ========================================================= */

const CONTENTFUL_SPACE_ID =
  process.env.CONTENTFUL_SPACE_ID;

const CONTENTFUL_ACCESS_TOKEN =
  process.env.CONTENTFUL_ACCESS_TOKEN;

const CONTENTFUL_ENVIRONMENT =
  process.env.CONTENTFUL_ENVIRONMENT || 'master';

/*
 * IMPORTANT:
 * This must match the Content Type ID of your Blog Post model.
 *
 * If you created the content type with ID "blogPost",
 * leave this as it is.
 */
const CONTENTFUL_CONTENT_TYPE =
  process.env.CONTENTFUL_CONTENT_TYPE || 'blogPost';

/* =========================================================
   CONTENTFUL TYPES
   ========================================================= */

interface ContentfulAsset {
  sys?: {
    id?: string;
  };
  fields?: {
    title?: string;
    description?: string;
    file?: {
      url?: string;
      details?: {
        image?: {
          width?: number;
          height?: number;
        };
      };
      fileName?: string;
      contentType?: string;
    };
  };
}

interface ContentfulRichTextNode {
  nodeType?: string;
  value?: string;
  content?: ContentfulRichTextNode[];
  data?: Record<string, unknown>;
}

interface ContentfulEntry {
  sys: {
    id: string;
    createdAt?: string;
    updatedAt?: string;
    publishedAt?: string;
  };
  fields: {
    title?: string;
    slug?: string;
    category?: string;
    excerpt?: string;
    content?: ContentfulRichTextNode;
    featuredImage?: {
      sys?: {
        id?: string;
      };
    };
    author?: string;
    publishedDate?: string;
    seoTitle?: string;
    seoDescription?: string;
  };
}

interface ContentfulResponse {
  items?: ContentfulEntry[];
  includes?: {
    Asset?: ContentfulAsset[];
  };
}

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
   BASIC VALIDATION
   ========================================================= */

function validateContentfulConfig(): void {
  if (!CONTENTFUL_SPACE_ID) {
    throw new Error(
      'Missing CONTENTFUL_SPACE_ID environment variable.'
    );
  }

  if (!CONTENTFUL_ACCESS_TOKEN) {
    throw new Error(
      'Missing CONTENTFUL_ACCESS_TOKEN environment variable.'
    );
  }
}

/* =========================================================
   CONTENTFUL URL
   ========================================================= */

function getContentfulUrl(
  query = ''
): string {
  validateContentfulConfig();

  const baseUrl =
    `https://cdn.contentful.com/spaces/` +
    `${CONTENTFUL_SPACE_ID}/environments/` +
    `${CONTENTFUL_ENVIRONMENT}/entries`;

  return query ? `${baseUrl}?${query}` : baseUrl;
}

/* =========================================================
   CONTENTFUL FETCH
   ========================================================= */

async function contentfulFetch(
  query = ''
): Promise<ContentfulResponse> {
  const url = getContentfulUrl(query);

  const response = await fetch(url, {
    headers: {
      Authorization:
        `Bearer ${CONTENTFUL_ACCESS_TOKEN}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      `Contentful API error ${response.status}: ${message}`
    );
  }

  return response.json();
}

/* =========================================================
   RICH TEXT -> PLAIN TEXT
   ========================================================= */

function richTextToPlainText(
  node: ContentfulRichTextNode | undefined
): string {
  if (!node) {
    return '';
  }

  if (node.nodeType === 'text') {
    return node.value || '';
  }

  return (node.content || [])
    .map((child) => richTextToPlainText(child))
    .join(' ');
}

/* =========================================================
   RICH TEXT -> SIMPLE HTML
   ========================================================= */

function richTextToHtml(
  node: ContentfulRichTextNode | undefined
): string {
  if (!node) {
    return '';
  }

  if (node.nodeType === 'text') {
    return escapeHtml(node.value || '');
  }

  const children = (node.content || [])
    .map((child) => richTextToHtml(child))
    .join('');

  switch (node.nodeType) {
    case 'document':
      return children;

    case 'paragraph':
      return `<p>${children}</p>`;

    case 'heading-1':
      return `<h1>${children}</h1>`;

    case 'heading-2':
      return `<h2>${children}</h2>`;

    case 'heading-3':
      return `<h3>${children}</h3>`;

    case 'heading-4':
      return `<h4>${children}</h4>`;

    case 'heading-5':
      return `<h5>${children}</h5>`;

    case 'heading-6':
      return `<h6>${children}</h6>`;

    case 'blockquote':
      return `<blockquote>${children}</blockquote>`;

    case 'unordered-list':
      return `<ul>${children}</ul>`;

    case 'ordered-list':
      return `<ol>${children}</ol>`;

    case 'list-item':
      return `<li>${children}</li>`;

    case 'hyperlink': {
      const uri =
        typeof node.data?.uri === 'string'
          ? node.data.uri
          : '#';

      return `<a href="${escapeHtmlAttribute(uri)}">${children}</a>`;
    }

    case 'hr':
      return '<hr />';

    case 'embedded-asset-block':
      return '';

    default:
      return children;
  }
}

/* =========================================================
   HTML HELPERS
   ========================================================= */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeHtmlAttribute(value: string): string {
  return escapeHtml(value);
}

/* =========================================================
   READING TIME
   ========================================================= */

export function estimateReadingTime(
  content: string
): string {
  const cleanContent = content
    .replace(/<[^>]*>/g, ' ')
    .trim();

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
   FIND CONTENTFUL IMAGE
   ========================================================= */

function getAssetUrl(
  post: ContentfulEntry,
  response: ContentfulResponse
): {
  url: string | null;
  alt: string | null;
} {
  const imageId =
    post.fields.featuredImage?.sys?.id;

  if (!imageId) {
    return {
      url: null,
      alt: null,
    };
  }

  const asset = (
    response.includes?.Asset || []
  ).find(
    (item) => item.sys?.id === imageId
  );

  const rawUrl =
    asset?.fields?.file?.url;

  if (!rawUrl) {
    return {
      url: null,
      alt:
        asset?.fields?.description ||
        asset?.fields?.title ||
        null,
    };
  }

  const fullUrl = rawUrl.startsWith('//')
    ? `https:${rawUrl}`
    : rawUrl.startsWith('http')
      ? rawUrl
      : `https://${rawUrl}`;

  return {
    url: fullUrl,
    alt:
      asset?.fields?.description ||
      asset?.fields?.title ||
      null,
  };
}

/* =========================================================
   RESOLVE BLOG IMAGE
   ========================================================= */

function resolveBlogImage(
  post: BlogPost
): string {
  const rawImage =
    post.image_url?.trim();

  if (
    rawImage &&
    rawImage.startsWith('/images/blogs/')
  ) {
    return rawImage;
  }

  if (
    rawImage &&
    /^https?:\/\//i.test(rawImage)
  ) {
    return rawImage;
  }

  if (
    rawImage &&
    /^[a-z0-9-]+\.(webp|jpg|jpeg|png|avif)$/i.test(
      rawImage
    )
  ) {
    const filename =
      rawImage.split('/').pop()?.toLowerCase();

    if (filename) {
      const localFile =
        Object.values(LOCAL_BLOG_IMAGES).find(
          (path) =>
            path
              .toLowerCase()
              .endsWith(filename)
        );

      if (localFile) {
        return localFile;
      }
    }
  }

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

  return FALLBACK_IMAGE;
}

/* =========================================================
   NORMALIZE CONTENTFUL POST
   ========================================================= */

function normalizeContentfulPost(
  entry: ContentfulEntry,
  response: ContentfulResponse
): BlogPost {
  const fields = entry.fields || {};

  const contentHtml =
    richTextToHtml(fields.content);

  const contentPlainText =
    richTextToPlainText(fields.content);

  const image =
    getAssetUrl(entry, response);

  const publishedAt =
    fields.publishedDate ||
    entry.sys.publishedAt ||
    null;

  const post: BlogPost = {
    id: entry.sys.id,

    title:
      fields.title || '',

    slug:
      slugify(fields.slug || fields.title || ''),

    category:
      fields.category || '',

    excerpt:
      fields.excerpt || '',

    content:
      contentHtml,

    image_url:
      image.url,

    image_alt:
      image.alt,

    author:
      fields.author || '',

    published:
      Boolean(
        entry.sys.publishedAt ||
        fields.publishedDate
      ),

    published_at:
      publishedAt,

    reading_time:
      estimateReadingTime(
        contentPlainText
      ),

    tags: [],

    meta_title:
      fields.seoTitle || null,

    meta_description:
      fields.seoDescription || null,

    created_at:
      entry.sys.createdAt ||
      new Date().toISOString(),

    updated_at:
      entry.sys.updatedAt ||
      new Date().toISOString(),
  };

  return {
    ...post,
    image_url:
      resolveBlogImage(post),
  };
}

/* =========================================================
   FETCH PUBLISHED POSTS
   ========================================================= */

export async function fetchPublishedPosts():
  Promise<BlogPost[]> {
  try {
    const query = new URLSearchParams({
      content_type:
        CONTENTFUL_CONTENT_TYPE,
      order:
        '-fields.publishedDate',
      include: '2',
      limit: '100',
    });

    const response =
      await contentfulFetch(
        query.toString()
      );

    return (response.items || [])
      .filter((entry) =>
        Boolean(
          entry.sys.publishedAt ||
          entry.fields.publishedDate
        )
      )
      .map((entry) =>
        normalizeContentfulPost(
          entry,
          response
        )
      );
  } catch (error) {
    console.error(
      'fetchPublishedPosts:',
      error
    );

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
    const cleanSlug =
      slugify(slug);

    const query =
      new URLSearchParams({
        content_type:
          CONTENTFUL_CONTENT_TYPE,

        'fields.slug':
          cleanSlug,

        include: '2',

        limit: '1',
      });

    const response =
      await contentfulFetch(
        query.toString()
      );

    const entry =
      (response.items || [])
        .find((item) =>
          Boolean(
            item.sys.publishedAt ||
            item.fields.publishedDate
          )
        );

    if (!entry) {
      return null;
    }

    return normalizeContentfulPost(
      entry,
      response
    );
  } catch (error) {
    console.error(
      'fetchPostBySlug:',
      error
    );

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
    const posts =
      await fetchPublishedPosts();

    return posts
      .filter(
        (post) =>
          post.category
            .toLowerCase() ===
            category.toLowerCase() &&
          post.slug !==
            slugify(excludeSlug)
      )
      .slice(0, limit);
  } catch (error) {
    console.error(
      'fetchRelatedPosts:',
      error
    );

    return [];
  }
}

/* =========================================================
   FETCH ALL POSTS
   ========================================================= */

export async function fetchAllPosts():
  Promise<BlogPost[]> {
  try {
    const query = new URLSearchParams({
      content_type:
        CONTENTFUL_CONTENT_TYPE,

      order:
        '-sys.createdAt',

      include: '2',

      limit: '100',
    });

    const response =
      await contentfulFetch(
        query.toString()
      );

    return (response.items || [])
      .map((entry) =>
        normalizeContentfulPost(
          entry,
          response
        )
      );
  } catch (error) {
    console.error(
      'fetchAllPosts:',
      error
    );

    throw error;
  }
}

/* =========================================================
   CREATE POST
   =========================================================

   Contentful Content Delivery API is READ-ONLY.

   Creating/updating/deleting Contentful entries requires
   the Content Management API and a server-side CMA token.

   Therefore these functions intentionally throw a clear
   message instead of attempting an unsafe client-side write.
   ========================================================= */

export async function createPost(
  _post: Omit<
    BlogPost,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<BlogPost> {
  throw new Error(
    'createPost is not available through the Contentful Delivery API. Create the blog post directly in Contentful.'
  );
}

/* =========================================================
   UPDATE POST
   ========================================================= */

export async function updatePost(
  _id: string,
  _updates: Partial<BlogPost>
): Promise<BlogPost> {
  throw new Error(
    'updatePost is not available through the Contentful Delivery API. Update the blog post directly in Contentful.'
  );
}

/* =========================================================
   DELETE POST
   ========================================================= */

export async function deletePost(
  _id: string
): Promise<void> {
  throw new Error(
    'deletePost is not available through the Contentful Delivery API. Delete the blog post directly in Contentful.'
  );
}

/* =========================================================
   PUBLISH POST
   ========================================================= */

export async function publishPost(
  _id: string
): Promise<BlogPost> {
  throw new Error(
    'publishPost is not available through the Contentful Delivery API. Publish the blog post directly in Contentful.'
  );
}

/* =========================================================
   UNPUBLISH POST
   ========================================================= */

export async function unpublishPost(
  _id: string
): Promise<BlogPost> {
  throw new Error(
    'unpublishPost is not available through the Contentful Delivery API. Unpublish the blog post directly in Contentful.'
  );
}

/* =========================================================
   UPLOAD BLOG IMAGE
   =========================================================

   Images should now be uploaded through Contentful Assets.
   ========================================================= */

export async function uploadBlogImage(
  _file: File
): Promise<string> {
  throw new Error(
    'uploadBlogImage is not available through the Contentful Delivery API. Upload the image as a Featured Image asset in Contentful.'
  );
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
   CHECK SLUG AVAILABILITY
   ========================================================= */

export async function isSlugAvailable(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  try {
    const cleanSlug =
      slugify(slug);

    if (!cleanSlug) {
      return false;
    }

    const query =
      new URLSearchParams({
        content_type:
          CONTENTFUL_CONTENT_TYPE,

        'fields.slug':
          cleanSlug,

        limit: '10',
      });

    const response =
      await contentfulFetch(
        query.toString()
      );

    const matches =
      response.items || [];

    if (!excludeId) {
      return matches.length === 0;
    }

    return !matches.some(
      (entry) =>
        entry.sys.id === excludeId
    );
  } catch (error) {
    console.error(
      'isSlugAvailable:',
      error
    );

    /*
     * Don't incorrectly block the editor
     * if the availability check itself fails.
     */
    return true;
  }
}
