const SITE_URL = 'https://loveons.com';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default async function handler(
  _req: any,
  res: any
) {
  try {
    const spaceId = process.env.CONTENTFUL_SPACE_ID;
    const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
    const environment =
      process.env.CONTENTFUL_ENVIRONMENT || 'master';
    const contentType =
      process.env.CONTENTFUL_CONTENT_TYPE || 'blogPost';

    if (!spaceId || !accessToken) {
      throw new Error(
        'Missing Contentful server environment variables.'
      );
    }

    const posts: any[] = [];

    let skip = 0;
    const limit = 100;
    let total = Infinity;

    while (skip < total) {
      const params = new URLSearchParams({
        content_type: contentType,
        limit: String(limit),
        skip: String(skip),
        order: '-sys.updatedAt',
      });

      const url =
        `https://cdn.contentful.com/spaces/` +
        `${encodeURIComponent(spaceId)}/environments/` +
        `${encodeURIComponent(environment)}/entries?` +
        params.toString();

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          `Contentful API error ${response.status}: ${message}`
        );
      }

      const data = await response.json();

      const items = Array.isArray(data.items)
        ? data.items
        : [];

      posts.push(...items);

      total = Number(data.total || posts.length);

      if (items.length === 0) {
        break;
      }

      skip += items.length;
    }

    const blogUrls = posts
      .map((post) => {
        const slug = post?.fields?.slug;

        if (!slug) {
          return '';
        }

        const lastModified = post?.sys?.updatedAt;

        return `
  <url>
    <loc>${escapeXml(`${SITE_URL}/blog/${slug}`)}</loc>
    ${
      lastModified
        ? `<lastmod>${escapeXml(lastModified)}</lastmod>`
        : ''
    }
  </url>`;
      })
      .filter(Boolean)
      .join('');
    
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
    <loc>${SITE_URL}/</loc>
    </url>
  <url>
    <loc>${SITE_URL}/tools/love-calculator</loc>
  </url>
  <url>
    <loc>${SITE_URL}/tools/tarot</loc>
  </url>${blogUrls}  
</urlset>
    
    res.setHeader(
      'Content-Type',
      'application/xml; charset=utf-8'
    );

    res.setHeader(
      'Cache-Control',
      'public, s-maxage=600, stale-while-revalidate=86400'
    );

    res.status(200).send(xml);
  } catch (error) {
    console.error('Sitemap generation failed:', error);

    res.status(500).json({
      error: 'Failed to generate sitemap',
    });
  }
}
