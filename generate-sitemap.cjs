const fs = require('fs');
const path = require('path');

const SPACE_ID = process.env.VITE_CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = process.env.VITE_CONTENT_ACCESS_TOKEN;
const CONTENT_TYPE = 'blogPost';

const PROTOCOL = 'https://';
const DOMAIN = 'www.loveons.com';
const BASE_URL = PROTOCOL + DOMAIN;

async function generateSitemap() {
  if (!SPACE_ID || !ACCESS_TOKEN) {
    console.error('❌ Contentful ID or Token not found!');
    return;
  }

  const cdnHost = 'cdn.contentful.com';
  const apiUrl = `${PROTOCOL}${cdnHost}/spaces/${SPACE_ID}/environments/master/entries?access_token=${ACCESS_TOKEN}&content_type=${CONTENT_TYPE}&limit=1000`;

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();

    let xmlUrls = `
  <url>
    <loc>${BASE_URL}/</loc>
    <priority>1.00</priority>
  </url>
  <url>
    <loc>${BASE_URL}/tools/love-calculator</loc>
    <priority>0.80</priority>
  </url>
  <url>
    <loc>${BASE_URL}/tools/tarot</loc>
    <priority>0.80</priority>
  </url>`;

    if (data.items && data.items.length > 0) {
      data.items.forEach(item => {
        if (item.fields && item.fields.slug) {
          xmlUrls += `
  <url>
    <loc>${BASE_URL}/blog/${item.fields.slug}</loc>
    <priority>0.70</priority>
  </url>`;
        }
      });
    }

    const schemaUrl = 'http://sitemaps.org';
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="${schemaUrl}">${xmlUrls}
</urlset>`;

    const publicDir = path.resolve(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }

    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent.trim());
    console.log('✅ Sitemap updated successfully!');
  } catch (error) {
    console.error('❌ Error creating sitemap:', error);
  }
}

generateSitemap();

