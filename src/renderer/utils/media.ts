import type { MediaSrcPayload } from '../../../shared/types';

export function resolveMediaSrc(payload: MediaSrcPayload): string {
  if (payload.kind === 'url' && payload.url) {
    return payload.url;
  }

  if (payload.kind === 'blob' && payload.data && payload.mimeType) {
    const bytes =
      payload.data instanceof Uint8Array ? payload.data : new Uint8Array(payload.data);
    const blob = new Blob([bytes as BlobPart], { type: payload.mimeType });
    return URL.createObjectURL(blob);
  }

  throw new Error('Invalid media payload');
}

export function isObjectUrl(src: string): boolean {
  return src.startsWith('blob:');
}
