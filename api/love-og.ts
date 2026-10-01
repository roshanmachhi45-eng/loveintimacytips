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
    const firstName = text(url.searchParams.get('name'), 'You', 40);
    const partnerName = text(url.searchParams.get('partner'), 'Your Partner', 40);
    const summary = text(url.searchParams.get('summary'), 'A beautiful connection with room to grow together.', 210);
    const parsedScore = Number(url.searchParams.get('score'));
    const score = Number.isFinite(parsedScore) ? Math.max(0, Math.min(100, Math.round(parsedScore))) : 0;

    const image = el('div', {
      width: '1200px', height: '630px', display: 'flex', flexDirection: 'column',
      padding: '54px 72px', position: 'relative', overflow: 'hidden', fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #fff8fa 0%, #ffeef4 52%, #fff9fc 100%)', color: '#432d3f',
    }, [
      el('div', { position: 'absolute', right: '-120px', top: '-180px', width: '520px', height: '520px', borderRadius: '50%', background: 'rgba(244,63,94,0.12)' }),
      el('div', { position: 'absolute', left: '-180px', bottom: '-240px', width: '560px', height: '560px', borderRadius: '50%', background: 'rgba(168,85,247,0.10)' }),
      el('div', { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }, [
        el('div', { display: 'flex', alignItems: 'center', gap: '16px' }, [
          el('div', { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '58px', height: '58px', borderRadius: '50%', background: '#f43f5e', color: '#fff', fontSize: '32px', fontWeight: 700 }, 'L'),
          el('div', { display: 'flex', flexDirection: 'column' }, [
            el('div', { display: 'flex', fontSize: '30px', fontWeight: 800, color: '#432d3f' }, 'Loveons.com'),
            el('div', { display: 'flex', marginTop: '4px', fontSize: '14px', color: '#a16d86' }, 'Build authentic connections beyond the screen'),
          ]),
        ]),
        el('div', { display: 'flex', padding: '12px 20px', borderRadius: '999px', background: '#fff', color: '#c13e69', fontSize: '16px', fontWeight: 800, letterSpacing: '1.5px' }, 'LOVE CALCULATOR'),
      ]),
      el('div', { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, position: 'relative' }, [
        el('div', { display: 'flex', fontSize: '36px', fontWeight: 800, color: '#432d3f' }, `${firstName}  +  ${partnerName}`),
        el('div', { display: 'flex', alignItems: 'baseline', marginTop: '14px', color: '#e33f68' }, [
          el('div', { display: 'flex', fontSize: '112px', lineHeight: 1, fontWeight: 900, letterSpacing: '-5px' }, `${score}%`),
          el('div', { display: 'flex', marginLeft: '18px', fontSize: '22px', fontWeight: 800, letterSpacing: '2px' }, 'COMPATIBILITY'),
        ]),
        el('div', { display: 'flex', maxWidth: '820px', marginTop: '14px', textAlign: 'center', fontSize: '22px', lineHeight: 1.35, color: '#704b5c' }, summary),
      ]),
      el('div', { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(177,104,135,0.16)', paddingTop: '16px', fontSize: '15px', color: '#9b7184' }, [
        el('div', { display: 'flex', fontWeight: 700 }, 'A personalized Loveons result'),
        el('div', { display: 'flex' }, 'Discover your compatibility at Loveons.com'),
      ]),
    ]);

    return new ImageResponse(image, { width: 1200, height: 630, headers: { 'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400' } });
  },
};
