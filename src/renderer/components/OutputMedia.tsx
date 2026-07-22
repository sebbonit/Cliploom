import { isVideoOutput, type OutputFormat } from '../../../shared/types';

interface OutputMediaProps {
  src: string;
  format: OutputFormat;
  alt: string;
  className?: string;
}

export function OutputMedia({ src, format, alt, className }: OutputMediaProps) {
  if (isVideoOutput(format)) {
    return (
      <video
        className={className}
        src={src}
        muted
        loop
        autoPlay
        playsInline
        controls
        aria-label={alt}
      />
    );
  }

  return <img className={className} src={src} alt={alt} />;
}
