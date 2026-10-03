import { ImageResponse } from '@vercel/og';
import { createElement } from 'react';

function text(value: unknown, fallback: string, max = 180) {
  if (typeof value !== 'string') return fallback;
  return value.replace(/[<>]/g, '').trim().slice(0, max) || fallback;
}

const el = (
  type: string,
  style: Record<string, string | number>,
  children?: unknown
) => createElement(type, { style }, ...(Array.isArray(children) ? children : children === undefined ? [] : [children]));

export default {
  async fetch(request: Request) {
    const url = new URL(request.url, 'https://loveons.com');
    const name = text(url.searchParams.get('name'), 'Your Partner', 40);
    const palette = text(url.searchParams.get('palette'), 'Mystic Cosmic', 30);

    const image = el('div', {
      width: '1200px', height: '630px', display: 'flex', flexDirection: 'column',
      padding: '54px 72px', position: 'relative', overflow: 'hidden', fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #1e0a3c 0%, #0d0520 100%)', color: '#e879f9',
    }, [
      el('div', { position: 'absolute', right: '-120px', top: '-180px', width: '520px', height: '520px', borderRadius: '50%', background: 'rgba(139,92,246,0.15)' }),
      el('div', { position: 'absolute', left: '-180px', bottom: '-240px', width: '560px', height: '560px', borderRadius: '50%', background: 'rgba(236,72,153,0.10)' }),
      el('div', { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }, [
        el('div', { display: 'flex', alignItems: 'center', gap: '16px' }, [
          el('div', { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '58px', height: '58px', borderRadius: '50%', background: '#8b5cf6', color: '#fff', fontSize: '32px', fontWeight: 700 }, 'L'),
          el('div', { display: 'flex', flexDirection: 'column' }, [
            el('div', { display: 'flex', fontSize: '30px', fontWeight: 800, color: '#e879f9' }, 'Loveons.com'),
            el('div', { display: 'flex', marginTop: '4px', fontSize: '14px', color: '#a78bfa' }, 'Build authentic connections beyond the screen'),
          ]),
        ]),
        el('div', { display: 'flex', padding: '12px 20px', borderRadius: '999px', background: '#1e0a3c', color: '#e879f9', fontSize: '16px', fontWeight: 800, letterSpacing: '1.5px', border: '1px solid #8b5cf6' }, 'MAGIC EYE'),
      ]),
      el('div', { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, position: 'relative' }, [
        el('div', { display: 'flex', fontSize: '36px', fontWeight: 800, color: '#c084fc' }, `${name}'s Aura Chart`),
        el('div', { display: 'flex', alignItems: 'center', marginTop: '18px', gap: '12px' }, [
          el('div', { display: 'flex', fontSize: '64px', lineHeight: 1, fontWeight: 900 }, '\u{1F441}'),
          el('div', { display: 'flex', fontSize: '42px', fontWeight: 800, color: '#e879f9' }, '3D Magic Eye'),
        ]),
        el('div', { display: 'flex', maxWidth: '820px', marginTop: '18px', textAlign: 'center', fontSize: '22px', lineHeight: 1.35, color: '#a78bfa' }, `Relax your vision and decode the hidden holographic aura of ${name}.`),
        el('div', { display: 'flex', marginTop: '14px', padding: '8px 18px', borderRadius: '999px', background: 'rgba(139,92,246,0.2)', fontSize: '16px', fontWeight: 700, color: '#c084fc' }, `${palette} Pattern`),
      ]),
      el('div', { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(139,92,246,0.2)', paddingTop: '16px', fontSize: '15px', color: '#7c3aed' }, [
        el('div', { display: 'flex', fontWeight: 700 }, 'A personalized Loveons Magic Eye result'),
        el('div', { display: 'flex' }, 'Discover at Loveons.com'),
      ]),
    ]);

    return new ImageResponse(image, { width: 1200, height: 630, headers: { 'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400' } });
  },
};
