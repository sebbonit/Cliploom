import type { VideoMetadata } from '../../../shared/types';
import { formatBytes, formatDuration } from '../utils/format';

interface VideoDropZoneProps {
  video: VideoMetadata | null;
  disabled?: boolean;
  compact?: boolean;
  onBrowse: () => void;
  onFileDrop: (path: string) => void;
}

export function VideoDropZone({
  video,
  disabled,
  compact,
  onBrowse,
  onFileDrop,
}: VideoDropZoneProps) {
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    if (disabled) return;

    const file = event.dataTransfer.files[0] as File & { path?: string };
    if (file?.path) onFileDrop(file.path);
  };

  return (
    <button
      type="button"
      className={`drop-zone ${video ? 'has-video' : ''} ${compact ? 'compact' : ''}`}
      onClick={onBrowse}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      disabled={disabled}
    >
      {compact && video ? (
        <div className="drop-zone-compact">
          <div className="drop-file-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="drop-file-info">
            <p className="drop-title">{video.fileName}</p>
            <p className="drop-meta">
              {formatDuration(video.duration)} · {formatBytes(video.size)}
            </p>
          </div>
          <span className="drop-swap">Replace</span>
        </div>
      ) : (
        <div className="drop-zone-inner">
          <div className="drop-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 16V4m0 0L8 8m4-4 4 4M4 14v4a2 2 0 002 2h12a2 2 0 002-2v-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="drop-title">Drop your video here</p>
          <p className="drop-meta">or click to browse · MOV, MP4, M4V, MKV, AVI, WEBM</p>
        </div>
      )}
    </button>
  );
}
