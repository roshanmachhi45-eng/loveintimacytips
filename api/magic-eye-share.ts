import type { VercelRequest, VercelResponse } from '@vercel/node';

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function read(value: unknown, fallback: string, max = 220) {
  return typeof value === 'string' ? value.replace(/[<>]/g, '').trim().slice(0, max) || fallback : fallback;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const name = read(req.query?.name, 'Your Partner', 40);
  const palette = read(req.query?.palette, 'Mystic Cosmic', 30);
  const params = new URLSearchParams({ name, palette });
  const resultUrl = `https://www.loveons.com/love-magic-eye`;
  const imageUrl = `https://www.loveons.com/api/magic-eye-og?${params.toString()}`;
  const title = `${name}'s Custom Relationship Aura Chart`;
  const description = `Check out our custom Relationship Aura Chart! Can you decode the hidden 3D energy of ${name}?`;
  const shareUrl = `https://www.loveons.com/love-magic-eye`;

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><meta property="og:type" content="website"><meta property="og:site_name" content="Loveons"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:image" content="${imageUrl}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:type" content="image/png"><meta property="og:url" content="${shareUrl}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(description)}"><meta name="twitter:image" content="${imageUrl}"><link rel="canonical" href="${shareUrl}"><meta http-equiv="refresh" content="0;url=${resultUrl}"><script>window.location.replace(${JSON.stringify(resultUrl)});</script></head><body><p>Opening your Love Magic Eye result...</p></body></html>`;
  res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
}
