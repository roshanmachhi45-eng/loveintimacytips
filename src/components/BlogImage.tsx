
import { useEffect, useState } from 'react';

const DEFAULT_BLOG_IMAGE = '/images/blogs/default.webp';

interface BlogImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

/**
 * Converts a blog image reference into a usable browser URL.
 *
 * Supported:
 * - /images/blogs/example.webp
 * - images/blogs/example.webp
 * - example.webp
 * - https://.../example.webp
 * - Supabase public image URLs
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

  // Already an absolute local path
  if (value.startsWith('/')) {
    return value;
  }

  // Full external URL
  if (
    value.startsWith('http://') ||
    value.startsWith('https://')
  ) {
    return value;
  }

  // Relative local path
  if (
    value.startsWith('images/') ||
    value.startsWith('./images/')
  ) {
    return `/${value.replace(/^\.?\//, '')}`;
  }

  // Filename only
  return `/images/blogs/${value}`;
}

/**
 * Gets the filename from an external image URL
 * so we can try the same image from public/images/blogs/.
 */
function getLocalFallback(
  src: string | null | undefined
): string | null {
  if (!src) {
    return null;
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
      /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(filename)
    ) {
      return `/images/blogs/${filename}`;
    }
  } catch {
    // Not a full URL, continue below.
  }

  const filename = src
    .split('/')
    .filter(Boolean)
    .pop();

  if (
    filename &&
    /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(filename)
  ) {
    return `/images/blogs/${filename}`;
  }

  return null;
}

/**
 * Builds the image candidates in the order we want to try them.
 *
 * 1. Original image
 * 2. Local image with the same filename
 * 3. Default blog image
 */
function buildImageCandidates(
  src: string | null | undefined
): string[] {
  const original = resolveBlogImage(src);

  const candidates: string[] = [original];

  const localFallback = getLocalFallback(src);

  if (
    localFallback &&
    localFallback !== original
  ) {
    candidates.push(localFallback);
  }

  if (!candidates.includes(DEFAULT_BLOG_IMAGE)) {
    candidates.push(DEFAULT_BLOG_IMAGE);
  }

  return candidates;
}

export default function BlogImage({
  src,
  alt,
  className = '',
  loading = 'lazy',
}: BlogImageProps) {
  const [candidates, setCandidates] = useState<string[]>(() =>
    buildImageCandidates(src)
  );

  const [candidateIndex, setCandidateIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  /**
   * Reset image state whenever a different blog image is supplied.
   */
  useEffect(() => {
    setCandidates(buildImageCandidates(src));
    setCandidateIndex(0);
    setLoaded(false);
    setFailed(false);
  }, [src]);

  const currentSrc =
    candidates[candidateIndex] || DEFAULT_BLOG_IMAGE;

  const handleLoad = () => {
    setLoaded(true);
    setFailed(false);
  };

  const handleError = () => {
    /**
     * Try the next available image:
     *
     * Original URL
     * ↓
     * Local filename
     * ↓
     * Default image
     */
    if (candidateIndex < candidates.length - 1) {
      setLoaded(false);
      setCandidateIndex((index) => index + 1);
      return;
    }

    // Even the fallback failed.
    setLoaded(true);
    setFailed(true);
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
      {/* Loading background */}
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
        key={currentSrc}
        src={currentSrc}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className="
          relative
          z-10
          h-full
          w-full
          object-cover
          opacity-100
        "
      />

      {/* Extremely rare case:
          even default image cannot be loaded */}
      {failed && (
        <div
          className="
            absolute
            inset-0
            z-20
            flex
            items-center
            justify-center
            bg-rose-50
            text-xs
            text-rose-300
          "
          aria-hidden="true"
        >
          Loveons
        </div>
      )}
    </div>
  );
}
