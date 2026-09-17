const fs = require('fs');
const path = require('path');

const SPACE_ID = process.env.VITE_CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = process.env.VITE_CONTENT_ACCESS_TOKEN;
const CONTENT_TYPE = 'blogPost'; 

async function generateSitemap() {
  if (!SPACE_ID || !ACCESS_TOKEN) {
    console.error('❌ Contentful ID or Token not found!');
    return;
  }

  const url = `https://contentful.com{SPACE_ID}/environments/master/entries?access_token=${ACCESS_TOKEN}&content_type=${CONTENT_TYPE}&limit=1000`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    let xmlUrls = `
  <url>
    <loc>https://loveons.com</loc>
    <priority>1.00</priority>
  </url>
  <url>
    <loc>https://loveons.com</loc>
    <priority>0.80</priority>
  </url>`;

    if (data.items && data.items.length > 0) {
      data.items.forEach(item => {
        if (item.fields && item.fields.slug) {
          xmlUrls += `
  <url>
    <loc>https://loveons.com/${item.fields.slug}</loc>
    <priority>0.70</priority>
  </url>`;
        }
      });
    }

    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://sitemaps.org">${xmlUrls}
</urlset>`;

    const publicDir = path.resolve(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)){
        fs.mkdirSync(publicDir);
    }
    
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent.trim());
    console.log('✅ Sitemap updated successfully!');
  } catch (error) {
    console.error('❌ Error creating sitemap:', error);
  }
}

generateSitemap();
