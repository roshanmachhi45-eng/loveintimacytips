import type { VercelRequest, VercelResponse } from '@vercel/node';

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function read(value: unknown, fallback: string, max = 220) {
  return typeof value === 'string' ? value.replace(/[<>]/g, '').trim().slice(0, max) || fallback : fallback;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const name = read(req.query?.name, 'You', 40);
  const partner = read(req.query?.partner, 'Your Partner', 40);
  const summary = read(req.query?.summary, 'A beautiful connection with room to grow together.', 210);
  const score = read(req.query?.score, '0', 3);
  const params = new URLSearchParams({ name, partner, summary, score });
  const resultUrl = `https://www.loveons.com/tools/love-calculator?${params.toString()}`;
  const imageUrl = `https://www.loveons.com/api/love-og?${params.toString()}`;
  const title = `${name} + ${partner} · ${score}% Love Compatibility`;
  const description = `A personalized Loveons compatibility result for ${name} and ${partner}.`;
  const shareUrl = `https://www.loveons.com/share/love-calculator?${params.toString()}`;

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><meta property="og:type" content="website"><meta property="og:site_name" content="Loveons"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:image" content="${imageUrl}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:type" content="image/png"><meta property="og:url" content="${shareUrl}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(description)}"><meta name="twitter:image" content="${imageUrl}"><link rel="canonical" href="${shareUrl}"><meta http-equiv="refresh" content="0;url=${resultUrl}"><script>window.location.replace(${JSON.stringify(resultUrl)});</script></head><body><p>Opening your Loveons result...</p></body></html>`;
  res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
}
