import { useEffect } from 'react';
import type { OutputFormat } from '../../../shared/types';
import { OutputMedia } from './OutputMedia';

interface PreviewLightboxProps {
  src: string;
  alt: string;
  format: OutputFormat;
  label?: string;
  onClose: () => void;
}

export function PreviewLightbox({ src, alt, format, label, onClose }: PreviewLightboxProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="preview-lightbox" onClick={onClose} role="presentation">
      <div
        className="preview-lightbox-content"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={label ?? alt}
      >
        <div className="preview-lightbox-toolbar">
          {label && <span className="preview-lightbox-label">{label}</span>}
          <button type="button" className="btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
        <OutputMedia
          className="preview-lightbox-media"
          src={src}
          format={format}
          alt={alt}
        />
      </div>
    </div>
  );
}

interface MaximizePreviewButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function MaximizePreviewButton({ onClick, disabled }: MaximizePreviewButtonProps) {
  return (
    <button
      type="button"
      className="preview-maximize-btn"
      onClick={onClick}
      disabled={disabled}
      aria-label="Maximize preview"
      title="Maximize preview"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M8 3H5a2 2 0 00-2 2v3M16 3h3a2 2 0 012 2v3M8 21H5a2 2 0 01-2-2v-3M16 21h3a2 2 0 002-2v-3"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
