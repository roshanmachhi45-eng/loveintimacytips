
const SITE_URL = "https://loveons.com";

const CONTENTFUL_SPACE_ID =
  process.env.VITE_CONTENTFUL_SPACE_ID || "";

const CONTENTFUL_ACCESS_TOKEN =
  process.env.VITE_CONTENTFUL_ACCESS_TOKEN || "";

const CONTENTFUL_ENVIRONMENT =
  process.env.VITE_CONTENTFUL_ENVIRONMENT || "master";

const CONTENTFUL_CONTENT_TYPE =
  process.env.VITE_CONTENTFUL_CONTENT_TYPE || "blogPost";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getFieldValue<T>(
  value: T | Record<string, T> | undefined
): T | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    const objectValue =
      value as Record<string, T>;

    if ("en-US" in objectValue) {
      return objectValue["en-US"];
    }

    const firstKey =
      Object.keys(objectValue)[0];

    if (firstKey) {
      return objectValue[firstKey];
    }
  }

  return value as T;
}

interface ContentfulEntry {
  sys?: {
    id?: string;
    publishedAt?: string;
    updatedAt?: string;
  };
  fields?: {
    title?: string | Record<string, string>;
    slug?: string | Record<string, string>;
    publishedDate?: string | Record<string, string>;
  };
}

interface ContentfulResponse {
  items?: ContentfulEntry[];
  total?: number;
}

export default async function handler(
  _request: unknown,
  response: {
    setHeader: (
      name: string,
      value: string
    ) => void;
    status: (code: number) => {
      send: (body: string) => void;
    };
  }
) {
  try {
    if (
      !CONTENTFUL_SPACE_ID ||
      !CONTENTFUL_ACCESS_TOKEN
    ) {
      throw new Error(
        "Missing Contentful environment variables."
      );
    }

    const query = new URLSearchParams();

    query.set(
      "content_type",
      CONTENTFUL_CONTENT_TYPE
    );

    query.set(
      "order",
      "-fields.publishedDate"
    );

    query.set("limit", "1000");

    const contentfulUrl =
      `https://cdn.contentful.com/spaces/` +
      `${encodeURIComponent(CONTENTFUL_SPACE_ID)}` +
      `/environments/` +
      `${encodeURIComponent(CONTENTFUL_ENVIRONMENT)}` +
      `/entries?${query.toString()}`;

    const contentfulResponse =
      await fetch(contentfulUrl, {
        method: "GET",
        headers: {
          Authorization:
            `Bearer ${CONTENTFUL_ACCESS_TOKEN}`,
          Accept: "application/json",
        },
      });

    if (!contentfulResponse.ok) {
      const errorBody =
        await contentfulResponse.text();

      throw new Error(
        `Contentful API error ${contentfulResponse.status}` +
          `${errorBody ? `: ${errorBody}` : ""}`
      );
    }

    const data =
      (await contentfulResponse.json()) as ContentfulResponse;

    const blogUrls = (data.items || [])
      .map((entry) => {
        const title = getFieldValue(
          entry.fields?.title
        );

        const slug = getFieldValue(
          entry.fields?.slug
        );

        const publishedDate =
          getFieldValue(
            entry.fields?.publishedDate
          ) ||
          entry.sys?.publishedAt ||
          entry.sys?.updatedAt ||
          "";

        if (
          typeof title !== "string" ||
          !title.trim() ||
          typeof slug !== "string" ||
          !slug.trim()
        ) {
          return null;
        }

        return {
          slug: slug.trim(),
          publishedDate,
        };
      })
      .filter(
        (
          item
        ): item is {
          slug: string;
          publishedDate: string;
        } => Boolean(item)
      );

    const staticUrls = [
      {
        loc: `${SITE_URL}/`,
        changefreq: "weekly",
        priority: "1.0",
      },
      {
        loc: `${SITE_URL}/about`,
        changefreq: "monthly",
        priority: "0.8",
      },
      {
        loc: `${SITE_URL}/contact`,
        changefreq: "monthly",
        priority: "0.6",
      },
      {
        loc: `${SITE_URL}/privacy-policy`,
        changefreq: "yearly",
        priority: "0.3",
      },
      {
        loc: `${SITE_URL}/disclaimer`,
        changefreq: "yearly",
        priority: "0.3",
      },
      {
        loc: `${SITE_URL}/terms`,
        changefreq: "yearly",
        priority: "0.3",
      },
    ];

    const staticXml = staticUrls
      .map(
        (item) => `
  <url>
    <loc>${escapeXml(item.loc)}</loc>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
      )
      .join("");

    const blogXml = blogUrls
      .map((item) => {
        const lastmod = item.publishedDate
          ? new Date(item.publishedDate)
          : null;

        const validLastmod =
          lastmod &&
          !Number.isNaN(
            lastmod.getTime()
          )
            ? lastmod.toISOString()
            : "";

        return `
  <url>
    <loc>${escapeXml(
      `${SITE_URL}/blog/${item.slug}`
    )}</loc>${
      validLastmod
        ? `
    <lastmod>${validLastmod}</lastmod>`
        : ""
    }
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      })
      .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticXml}
${blogXml}
</urlset>`;

    response.setHeader(
      "Content-Type",
      "application/xml; charset=utf-8"
    );

    response.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400"
    );

    response.status(200).send(xml);
  } catch (error) {
    console.error(
      "Dynamic sitemap error:",
      error
    );

    response.setHeader(
      "Content-Type",
      "text/plain; charset=utf-8"
    );

    response
      .status(500)
      .send(
        "Unable to generate sitemap."
      );
  }
}
