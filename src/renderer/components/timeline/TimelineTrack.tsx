import type { RefObject } from 'react';
import type { TimelineDragTarget } from '../../hooks/useTimelineDrag';

interface TimelineTrackProps {
  startPercent: number;
  endPercent: number;
  playheadPercent: number | null;
  dragging: TimelineDragTarget | null;
  disabled?: boolean;
  onStartDrag: (handle: TimelineDragTarget) => void;
  onTrackSeek: (clientX: number) => void;
  onPlayheadNudge: (delta: number) => void;
  trackRef: RefObject<HTMLDivElement | null>;
}

export function TimelineTrack({
  startPercent,
  endPercent,
  playheadPercent,
  dragging,
  disabled,
  onStartDrag,
  onTrackSeek,
  onPlayheadNudge,
  trackRef,
}: TimelineTrackProps) {
  const handleTrackClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || dragging) return;
    if ((event.target as HTMLElement).closest('.timeline-handle, .timeline-playhead')) return;
    onTrackSeek(event.clientX);
  };

  return (
    <div
      ref={trackRef}
      className={`timeline-track ${disabled ? 'disabled' : ''}`}
      onClick={handleTrackClick}
      role="group"
      aria-label="Trim timeline"
    >
      <div className="timeline-rail" />
      <div
        className="timeline-selection"
        style={{ left: `${startPercent}%`, width: `${endPercent - startPercent}%` }}
      />
      {playheadPercent !== null && (
        <button
          type="button"
          className={`timeline-playhead ${dragging === 'playhead' ? 'active' : ''}`}
          style={{ left: `${playheadPercent}%` }}
          onPointerDown={(event) => {
            event.currentTarget.focus();
            event.preventDefault();
            event.stopPropagation();
            onStartDrag('playhead');
          }}
          onKeyDown={(event) => {
            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
            event.preventDefault();
            const step = event.shiftKey ? 1 : 0.1;
            onPlayheadNudge(event.key === 'ArrowLeft' ? -step : step);
          }}
          disabled={disabled}
          aria-label="Playhead"
          title="Drag to scrub · Arrow keys for precise movement"
        />
      )}
      <button
        type="button"
        className={`timeline-handle timeline-handle-start ${dragging === 'start' ? 'active' : ''}`}
        style={{ left: `${startPercent}%` }}
        onPointerDown={(event) => {
          event.currentTarget.focus();
          event.preventDefault();
          event.stopPropagation();
          onStartDrag('start');
        }}
        disabled={disabled}
        aria-label="Trim start"
      />
      <button
        type="button"
        className={`timeline-handle timeline-handle-end ${dragging === 'end' ? 'active' : ''}`}
        style={{ left: `${endPercent}%` }}
        onPointerDown={(event) => {
          event.currentTarget.focus();
          event.preventDefault();
          event.stopPropagation();
          onStartDrag('end');
        }}
        disabled={disabled}
        aria-label="Trim end"
      />
    </div>
  );
}
