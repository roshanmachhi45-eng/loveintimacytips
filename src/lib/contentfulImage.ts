const CONTENTFUL_IMAGE_HOSTS = [
  'images.ctfassets.net',
  'downloads.ctfassets.net',
];

interface ContentfulImagePreset {
  widths: number[];
  quality: number;
}

export const ARTICLE_IMAGE_PRESET: ContentfulImagePreset = {
  widths: [480, 750, 1000],
  quality: 75,
};

export const HERO_IMAGE_PRESET: ContentfulImagePreset = {
  widths: [750, 1000, 1400],
  quality: 80,
};

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
  preset: ContentfulImagePreset
): string | undefined {
  if (!src || !isContentfulImageUrl(src)) return undefined;

  return preset.widths
    .map(
      (width) =>
        `${getContentfulImageUrl(src, width, preset.quality)} ${width}w`
    )
    .join(', ');
}
