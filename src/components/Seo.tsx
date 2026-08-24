
import { useEffect } from 'react';

import { BRAND } from '../lib/brand';

interface SeoProps {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  type?: 'website' | 'article';
}

function setMeta(
  attr: 'name' | 'property',
  key: string,
  content: string
) {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`
  );

  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }

  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(
    `link[rel="${rel}"]`
  );

  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }

  el.setAttribute('href', href);
}

export default function Seo({
  title,
  description,
  path,
  ogImage,
  type = 'website',
}: SeoProps) {
  useEffect(() => {
    const normalizedPath =
      path === '/'
        ? '/'
        : `/${path
            .replace(/^\/+/, '')
            .replace(/\/+$/, '')}`;

    const fullUrl = `${BRAND.domain}${normalizedPath}`;

    const image =
      ogImage ||
      `${BRAND.domain}/images/loveons-social-preview.png`;

    /*
     * Basic SEO
     */
    document.title = title;

    setMeta(
      'name',
      'description',
      description
    );

    setMeta(
      'name',
      'robots',
      'index, follow'
    );

    /*
     * Canonical URL
     */
    setLink(
      'canonical',
      fullUrl
    );

    /*
     * Open Graph
     */
    setMeta(
      'property',
      'og:title',
      title
    );

    setMeta(
      'property',
      'og:description',
      description
    );

    setMeta(
      'property',
      'og:url',
      fullUrl
    );

    setMeta(
      'property',
      'og:type',
      type
    );

    setMeta(
      'property',
      'og:site_name',
      BRAND.name
    );

    setMeta(
      'property',
      'og:image',
      image
    );

    setMeta(
      'property',
      'og:image:type',
      'image/png'
    );

    setMeta(
      'property',
      'og:image:width',
      '1200'
    );

    setMeta(
      'property',
      'og:image:height',
      '628'
    );

    /*
     * Twitter / X
     */
    setMeta(
      'name',
      'twitter:card',
      'summary_large_image'
    );

    setMeta(
      'name',
      'twitter:title',
      title
    );

    setMeta(
      'name',
      'twitter:description',
      description
    );

    setMeta(
      'name',
      'twitter:image',
      image
    );

    /*
     * Cleanup is intentionally not removing
     * metadata because the next page render
     * will update the same elements.
     */
  }, [
    title,
    description,
    path,
    ogImage,
    type,
  ]);

  return null;
}
