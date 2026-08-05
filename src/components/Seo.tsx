import { useEffect } from 'react';

interface SeoProps {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
}

const SITE_URL = 'https://loveintimacytips.com';

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export default function Seo({ title, description, path, ogImage }: SeoProps) {
  useEffect(() => {
    const fullUrl = `${SITE_URL}${path}`;
    const image = ogImage || `${SITE_URL}/og-image.png`;

    document.title = title;
    setMeta('name', 'description', description);
    setLink('canonical', fullUrl);

    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', fullUrl);
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:type', 'website');

    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', image);
  }, [title, description, path, ogImage]);

  return null;
}
