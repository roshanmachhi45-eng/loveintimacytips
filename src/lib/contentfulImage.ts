const CONTENTFUL_IMAGE_HOSTS = [
  'images.ctfassets.net',
  'downloads.ctfassets.net',
];

export const RESPONSIVE_IMAGE_WIDTHS = [480, 750, 1080, 1440];

export function isContentfulImageUrl(src: string | null | undefined): boolean {
  if (!src) return false;

  try {
    const url = new URL(src);
    return CONTENTFUL_IMAGE_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}

export function getContentfulImageUrl(
  src: string,
  width: number,
  quality = 80
): string {
  const url = new URL(src);

  url.searchParams.set('w', String(width));
  url.searchParams.set('fm', 'webp');
  url.searchParams.set('q', String(quality));

  return url.toString();
}

export function getContentfulSrcSet(
  src: string | null | undefined,
  quality = 80
): string | undefined {
  if (!src || !isContentfulImageUrl(src)) return undefined;

  return RESPONSIVE_IMAGE_WIDTHS.map(
    (width) => `${getContentfulImageUrl(src, width, quality)} ${width}w`
  ).join(', ');
}
