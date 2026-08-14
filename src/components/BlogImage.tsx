import { useState, useEffect } from 'react';

const DEFAULT_BLOG_IMAGE = '/images/blogs/default.webp';

interface BlogImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

export default function BlogImage({
  src,
  alt,
  className = '',
  loading = 'lazy',
}: BlogImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setErrored(false);
  }, [src]);

  const resolvedSrc = !src || errored ? DEFAULT_BLOG_IMAGE : src;

  return (
    <div className={`relative overflow-hidden bg-rose-50 ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-rose-100 animate-pulse" />
      )}
      <img
        src={resolvedSrc}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!errored) {
            setErrored(true);
            setLoaded(true);
          } else {
            setLoaded(true);
          }
        }}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
