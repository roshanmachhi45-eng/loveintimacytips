
import { useEffect, useState } from 'react';

const DEFAULT_BLOG_IMAGE =
  '/images/blogs/default.webp';

interface BlogImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

/**
 * Converts all supported image references
 * into a usable browser URL.
 */
function resolveBlogImage(
  src: string | null | undefined
): string {
  if (!src) {
    return DEFAULT_BLOG_IMAGE;
  }

  const value = src.trim();

  if (!value) {
    return DEFAULT_BLOG_IMAGE;
  }

  /*
   * Already a local absolute path.
   * Example:
   * /images/blogs/couple.webp
   */
  if (value.startsWith('/')) {
    return value;
  }

  /*
   * Full external URL.
   *
   * We first try the original URL.
   * If it fails, BlogImage's fallback logic
   * will try the local filename.
   */
  if (
    value.startsWith('http://') ||
    value.startsWith('https://')
  ) {
    return value;
  }

  /*
   * Relative paths.
   *
   * images/blogs/couple.webp
   * ↓
   * /images/blogs/couple.webp
   */
  if (
    value.startsWith('images/') ||
    value.startsWith('./images/')
  ) {
    return `/${value.replace(/^\.?\//, '')}`;
  }

  /*
   * If database contains only:
   *
   * couple.webp
   *
   * use:
   *
   * /images/blogs/couple.webp
   */
  return `/images/blogs/${value}`;
}

/**
 * Extract the filename from an external URL.
 *
 * Example:
 * https://xyz.supabase.co/storage/v1/object/public/blog_images/couple.webp
 *
 * becomes:
 * couple.webp
 */
function getLocalFallback(
  src: string | null | undefined
): string {
  if (!src) {
    return DEFAULT_BLOG_IMAGE;
  }

  try {
    const url = new URL(src);

    const pathname = url.pathname;

    const filename = pathname
      .split('/')
      .filter(Boolean)
      .pop();

    if (
      filename &&
      /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(
        filename
      )
    ) {
      return `/images/blogs/${filename}`;
    }
  } catch {
    /*
     * Not a valid URL.
     * We simply use the normal local resolver.
     */
  }

  const filename = src
    .split('/')
    .filter(Boolean)
    .pop();

  if (
    filename &&
    /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(
      filename
    )
  ) {
    return `/images/blogs/${filename}`;
  }

  return DEFAULT_BLOG_IMAGE;
}

export default function BlogImage({
  src,
  alt,
  className = '',
  loading = 'lazy',
}: BlogImageProps) {
  const [loaded, setLoaded] =
    useState(false);

  const [currentSrc, setCurrentSrc] =
    useState(() =>
      resolveBlogImage(src)
    );

  const [triedLocalFallback, setTriedLocalFallback] =
    useState(false);

  /*
   * Reset whenever the blog post/image changes.
   */
  useEffect(() => {
    setLoaded(false);
    setTriedLocalFallback(false);
    setCurrentSrc(resolveBlogImage(src));
  }, [src]);

  const handleError = () => {
    /*
     * If the original image was an external
     * Supabase URL, try the same filename
     * from public/images/blogs/.
     */
    if (
      !triedLocalFallback &&
      currentSrc !== DEFAULT_BLOG_IMAGE
    ) {
      const localFallback =
        getLocalFallback(src);

      if (
        localFallback !== currentSrc &&
        localFallback !== DEFAULT_BLOG_IMAGE
      ) {
        setTriedLocalFallback(true);
        setLoaded(false);
        setCurrentSrc(localFallback);
        return;
      }
    }

    /*
     * Nothing worked.
     * Use the default blog image.
     */
    if (currentSrc !== DEFAULT_BLOG_IMAGE) {
      setTriedLocalFallback(true);
      setCurrentSrc(DEFAULT_BLOG_IMAGE);
      setLoaded(false);
      return;
    }

    setLoaded(true);
  };

  return (
    <div
      className={`
        relative
        overflow-hidden
        bg-rose-50
        ${className}
      `}
    >
      {!loaded && (
        <div
          aria-hidden="true"
          className="
            absolute
            inset-0
            animate-pulse
            bg-gradient-to-br
            from-rose-50
            to-rose-100
          "
        />
      )}

      <img
        src={currentSrc}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={handleError}
        className={`
          h-full
          w-full
          object-cover
          transition-opacity
          duration-300
          ${
            loaded
              ? 'opacity-100'
              : 'opacity-0'
          }
        `}
      />
    </div>
  );
}

