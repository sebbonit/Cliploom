import { useRef } from 'react';
import type { VideoMetadata } from '../../../shared/types';
import { useMediaUrl } from '../hooks/useMediaUrl';
import { useVideoPlayhead } from '../hooks/useVideoPlayhead';
import { formatBytes, formatDuration } from '../utils/format';
import { Timeline } from './timeline/Timeline';

interface VideoPreviewProps {
  video: VideoMetadata;
  startTime: number;
  endTime: number | null;
  disabled?: boolean;
  onTrimChange: (start: number, end: number | null) => void;
}

export function VideoPreview({
  video,
  startTime,
  endTime,
  disabled,
  onTrimChange,
}: VideoPreviewProps) {
  const src = useMediaUrl(video.filePath);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { playhead, seek } = useVideoPlayhead(videoRef, {
    startTime,
    endTime,
    duration: video.duration,
    mediaKey: src,
  });

  return (
    <section className="preview-panel">
      <div className="preview-header">
        <div>
          <h2>Source preview</h2>
          <p className="preview-meta">
            {video.fileName} · {formatDuration(video.duration)} · {formatBytes(video.size)}
            {video.width && video.height && ` · ${video.width}×${video.height}`}
          </p>
        </div>
      </div>
      {src ? (
        <video
          ref={videoRef}
          className="preview-media"
          src={src}
          controls
          muted
          playsInline
        />
      ) : (
        <div className="preview-placeholder">Loading preview…</div>
      )}

      <Timeline
        duration={video.duration}
        startTime={startTime}
        endTime={endTime}
        playheadTime={src ? playhead : undefined}
        disabled={disabled}
        onChange={onTrimChange}
        onSeek={seek}
      />
    </section>
  );
}
