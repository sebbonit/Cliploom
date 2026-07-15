import { useEffect, useState } from 'react';
import { isObjectUrl, resolveMediaSrc } from '../utils/media';

export function useMediaUrl(filePath: string | null): string | null {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!filePath || !window.api?.getMediaSrc) {
      setSrc(null);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    window.api
      .getMediaSrc(filePath)
      .then((payload) => {
        if (cancelled) return;
        const resolved = resolveMediaSrc(payload);
        if (isObjectUrl(resolved)) objectUrl = resolved;
        setSrc(resolved);
      })
      .catch(() => {
        if (!cancelled) setSrc(null);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [filePath]);

  return src;
}
