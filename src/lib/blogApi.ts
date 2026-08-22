
// src/lib/blogApi.ts

// ============================================================
// Contentful Blog API
// ============================================================

const CONTENTFUL_SPACE_ID =
  import.meta.env.VITE_CONTENTFUL_SPACE_ID;

const CONTENTFUL_ACCESS_TOKEN =
  import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN;

const CONTENTFUL_ENVIRONMENT =
  import.meta.env.VITE_CONTENTFUL_ENVIRONMENT || "master";

const CONTENTFUL_CONTENT_TYPE =
  import.meta.env.VITE_CONTENTFUL_CONTENT_TYPE || "blogPost";

const CONTENTFUL_BASE_URL =
  `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}` +
  `/environments/${CONTENTFUL_ENVIRONMENT}/entries`;

// ============================================================
// Types
// ============================================================

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  featuredImage: string;
  excerpt: string;
  content: any;
  author: string;
  category: string;
  publishedDate: string;
  seoTitle: string;
  seoDescription: string;
}

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

interface ContentfulEntry {
  sys: {
    id: string;
    publishedAt?: string;
    createdAt?: string;
    updatedAt?: string;
    contentType?: {
      sys?: {
        id?: string;
      };
    };
  };
  fields: {
    title?: string;
    slug?: string;
    featuredImage?: any;
    excerpt?: string;
    content?: any;
    author?: string;
    category?: string;
    publishedDate?: string;
    seoTitle?: string;
    seoDescription?: string;
  };
}

interface ContentfulResponse {
  items?: ContentfulEntry[];
  includes?: {
    Asset?: ContentfulAsset[];
    Entry?: any[];
  };
  total?: number;
}

// ============================================================
// Configuration check
// ============================================================

function validateConfig(): void {
  if (!CONTENTFUL_SPACE_ID) {
    throw new Error(
      "Missing VITE_CONTENTFUL_SPACE_ID environment variable."
    );
  }

  if (!CONTENTFUL_ACCESS_TOKEN) {
    throw new Error(
      "Missing VITE_CONTENTFUL_ACCESS_TOKEN environment variable."
    );
  }
}

// ============================================================
// Helpers
// ============================================================

function getFieldValue<T>(
  value: T | { [key: string]: T } | undefined
): T | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  // Contentful normally returns the value directly.
  // This fallback also handles localized field objects.
  if (
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    const objectValue = value as Record<string, T>;

    if ("en-US" in objectValue) {
      return objectValue["en-US"];
    }

    const firstKey = Object.keys(objectValue)[0];

    if (firstKey) {
      return objectValue[firstKey];
    }
  }

  return value as T;
}

function getAssetId(value: any): string | null {
  if (!value) {
    return null;
  }

  if (value.sys?.id) {
    return value.sys.id;
  }

  if (value.fields?.file?.url) {
    return null;
  }

  if (Array.isArray(value)) {
    const first = value[0];

    if (first?.sys?.id) {
      return first.sys.id;
    }
  }

  return null;
}

function normalizeImageUrl(url?: string): string {
  if (!url) {
    return "";
  }

  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  if (url.startsWith("http://")) {
    return url.replace("http://", "https://");
  }

  if (url.startsWith("https://")) {
    return url;
  }

  return `https://${url}`;
}

function findAsset(
  assetId: string | null,
  assets: ContentfulAsset[]
): ContentfulAsset | undefined {
  if (!assetId) {
    return undefined;
  }

  return assets.find(
    (asset) => asset.sys?.id === assetId
  );
}

function getFeaturedImage(
  value: any,
  assets: ContentfulAsset[]
): string {
  if (!value) {
    return "";
  }

  // Direct URL
  if (typeof value === "string") {
    return normalizeImageUrl(value);
  }

  // Contentful asset link
  const assetId = getAssetId(value);

  if (assetId) {
    const asset = findAsset(assetId, assets);

    const assetUrl =
      getFieldValue(
        asset?.fields?.file?.url
      );

    if (assetUrl) {
      return normalizeImageUrl(assetUrl);
    }
  }

  // Already expanded asset
  const directUrl =
    getFieldValue(
      value?.fields?.file?.url
    );

  if (directUrl) {
    return normalizeImageUrl(directUrl);
  }

  return "";
}

function normalizeCategory(value: any): string {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (value.fields?.name) {
    return (
      getFieldValue(value.fields.name) || ""
    );
  }

  if (value.fields?.title) {
    return (
      getFieldValue(value.fields.title) || ""
    );
  }

  if (value.name) {
    return value.name;
  }

  if (value.title) {
    return value.title;
  }

  return "";
}

function normalizeAuthor(value: any): string {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (value.fields?.name) {
    return (
      getFieldValue(value.fields.name) || ""
    );
  }

  if (value.fields?.title) {
    return (
      getFieldValue(value.fields.title) || ""
    );
  }

  if (value.name) {
    return value.name;
  }

  if (value.title) {
    return value.title;
  }

  return "";
}

// ============================================================
// Contentful request
// ============================================================

async function contentfulFetch(
  searchParams: URLSearchParams
): Promise<ContentfulResponse> {
  validateConfig();

  const url =
    `${CONTENTFUL_BASE_URL}?${searchParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization:
        `Bearer ${CONTENTFUL_ACCESS_TOKEN}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    let errorBody = "";

    try {
      errorBody = await response.text();
    } catch {
      errorBody = "";
    }

    throw new Error(
      `Contentful API error ${response.status} ${response.statusText}` +
        (errorBody ? `: ${errorBody}` : "")
    );
  }

  return response.json();
}

// ============================================================
// Convert Contentful entry → BlogPost
// ============================================================

function mapEntryToBlogPost(
  entry: ContentfulEntry,
  assets: ContentfulAsset[]
): BlogPost {
  const fields = entry.fields || {};

  const title =
    getFieldValue(fields.title) || "";

  const slug =
    getFieldValue(fields.slug) || "";

  const excerpt =
    getFieldValue(fields.excerpt) || "";

  const content =
    getFieldValue(fields.content) ?? null;

  const author =
    normalizeAuthor(
      getFieldValue(fields.author)
    );

  const category =
    normalizeCategory(
      getFieldValue(fields.category)
    );

  const publishedDate =
    getFieldValue(fields.publishedDate) ||
    entry.sys.publishedAt ||
    entry.sys.createdAt ||
    "";

  const seoTitle =
    getFieldValue(fields.seoTitle) ||
    title;

  const seoDescription =
    getFieldValue(fields.seoDescription) ||
    excerpt;

  const featuredImage =
    getFeaturedImage(
      getFieldValue(fields.featuredImage),
      assets
    );

  return {
    id: entry.sys.id,
    title,
    slug,
    featuredImage,
    excerpt,
    content,
    author,
    category,
    publishedDate,
    seoTitle,
    seoDescription,
  };
}

// ============================================================
// Fetch all published blog posts
// ============================================================

export async function fetchPublishedPosts(): Promise<BlogPost[]> {
  try {
    const query = new URLSearchParams();

    query.set(
      "content_type",
      CONTENTFUL_CONTENT_TYPE
    );

    query.set(
      "order",
      "-fields.publishedDate"
    );

    // Include linked featured-image assets.
    query.set("include", "2");

    // Fetch a reasonable number of posts.
    query.set("limit", "100");

    const response =
      await contentfulFetch(query);

    const entries =
      Array.isArray(response.items)
        ? response.items
        : [];

    const assets =
      Array.isArray(response.includes?.Asset)
        ? response.includes.Asset
        : [];

    console.log(
      `Contentful: fetched ${entries.length} ${CONTENTFUL_CONTENT_TYPE} entries`
    );

    const posts = entries
      .filter((entry) => {
        if (!entry?.sys?.id) {
          return false;
        }

        const fields = entry.fields || {};

        const title =
          getFieldValue(fields.title);

        const slug =
          getFieldValue(fields.slug);

        // A published Contentful entry is already returned
        // by the Delivery API. We only require the essential
        // blog fields here.
        return Boolean(title && slug);
      })
      .map((entry) =>
        mapEntryToBlogPost(
          entry,
          assets
        )
      );

    return posts;
  } catch (error) {
    console.error(
      "❌ Contentful fetchPublishedPosts ERROR:",
      error
    );

    // IMPORTANT:
    // Do not silently convert a Contentful API error
    // into an empty array. This makes debugging possible.
    throw error;
  }
}

// ============================================================
// Fetch a single blog post by slug
// ============================================================

export async function fetchPostBySlug(
  slug: string
): Promise<BlogPost | null> {
  try {
    if (!slug) {
      return null;
    }

    const query = new URLSearchParams();

    query.set(
      "content_type",
      CONTENTFUL_CONTENT_TYPE
    );

    query.set(
      "fields.slug",
      slug
    );

    query.set(
      "limit",
      "1"
    );

    query.set(
      "include",
      "2"
    );

    const response =
      await contentfulFetch(query);

    const entry =
      response.items?.[0];

    if (!entry) {
      return null;
    }

    const assets =
      Array.isArray(response.includes?.Asset)
        ? response.includes.Asset
        : [];

    return mapEntryToBlogPost(
      entry,
      assets
    );
  } catch (error) {
    console.error(
      "❌ Contentful fetchPostBySlug ERROR:",
      error
    );

    throw error;
  }
}

// ============================================================
// Fetch a single blog post by Contentful entry ID
// ============================================================

export async function fetchPostById(
  id: string
): Promise<BlogPost | null> {
  try {
    if (!id) {
      return null;
    }

    const query = new URLSearchParams();

    query.set(
      "sys.id",
      id
    );

    query.set(
      "content_type",
      CONTENTFUL_CONTENT_TYPE
    );

    query.set(
      "limit",
      "1"
    );

    query.set(
      "include",
      "2"
    );

    const response =
      await contentfulFetch(query);

    const entry =
      response.items?.[0];

    if (!entry) {
      return null;
    }

    const assets =
      Array.isArray(response.includes?.Asset)
        ? response.includes.Asset
        : [];

    return mapEntryToBlogPost(
      entry,
      assets
    );
  } catch (error) {
    console.error(
      "❌ Contentful fetchPostById ERROR:",
      error
    );

    throw error;
  }
}

// ============================================================
// Fetch posts by category
// ============================================================

export async function fetchPostsByCategory(
  category: string
): Promise<BlogPost[]> {
  try {
    if (!category) {
      return fetchPublishedPosts();
    }

    const allPosts =
      await fetchPublishedPosts();

    return allPosts.filter(
      (post) =>
        post.category.toLowerCase() ===
        category.toLowerCase()
    );
  } catch (error) {
    console.error(
      "❌ Contentful fetchPostsByCategory ERROR:",
      error
    );

    throw error;
  }
}

// ============================================================
// Search posts
// ============================================================

export async function searchPosts(
  searchTerm: string
): Promise<BlogPost[]> {
  const posts =
    await fetchPublishedPosts();

  const term =
    searchTerm.trim().toLowerCase();

  if (!term) {
    return posts;
  }

  return posts.filter((post) => {
    const searchableText = [
      post.title,
      post.excerpt,
      post.author,
      post.category,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(term);
  });
}

// ============================================================
// Compatibility helpers
// ============================================================

// These functions intentionally do not create/update/delete
// Contentful entries from the frontend.
// Blogs should be created and published directly in Contentful.

export async function createPost(): Promise<never> {
  throw new Error(
    "Creating blog posts from the website is disabled. Please create and publish posts in Contentful."
  );
}

export async function updatePost(): Promise<never> {
  throw new Error(
    "Updating blog posts from the website is disabled. Please edit and publish posts in Contentful."
  );
}

export async function deletePost(): Promise<never> {
  throw new Error(
    "Deleting blog posts from the website is disabled. Please manage posts in Contentful."
  );
}
