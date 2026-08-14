interface LogoProps {
  className?: string;
  alt?: string;
}

export default function Logo({ className = 'w-8 h-8', alt = 'Loveons logo' }: LogoProps) {
  return (
    <img
      src="/images/logo.svg"
      alt={alt}
      className={`object-contain flex-shrink-0 ${className}`}
      loading="eager"
      decoding="async"
    />
  );
}
