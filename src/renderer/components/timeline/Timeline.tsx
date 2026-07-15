import { toStoredEndTime } from '../../../shared/trim';
import { useTimelineDrag } from '../../hooks/useTimelineDrag';
import { TimelineLabels } from './TimelineLabels';
import { TimelineTrack } from './TimelineTrack';

interface TimelineProps {
  duration: number;
  startTime: number;
  endTime: number | null;
  playheadTime?: number;
  disabled?: boolean;
  onChange: (start: number, end: number | null) => void;
  onSeek?: (time: number) => void;
}

export function Timeline({
  duration,
  startTime,
  endTime,
  playheadTime,
  disabled,
  onChange,
  onSeek,
}: TimelineProps) {
  const handleChange = (start: number, end: number | null) => {
    onChange(start, end);
  };

  const { trackRef, dragging, effectiveEnd, beginDrag, seekTo, toPercent } =
    useTimelineDrag({
      duration,
      startTime,
      endTime,
      disabled,
      onChange: handleChange,
      onSeek,
    });

  const handleTrackSeek = (clientX: number) => {
    const time = seekTo(clientX);
    if (time === null) return;
    onSeek?.(time);
  };

  const handleReset = () => {
    onChange(0, null);
  };

  if (duration <= 0) {
    return (
      <div className="timeline-panel">
        <p className="timeline-empty">Duration unavailable</p>
      </div>
    );
  }

  const playheadPercent =
    playheadTime !== undefined ? toPercent(playheadTime) : null;
  const isTrimmed = startTime > 0 || (endTime !== null && endTime < duration - 0.01);

  return (
    <div className="timeline-panel">
      <div className="timeline-header">
        <h3>Trim range</h3>
        {isTrimmed && (
          <button
            type="button"
            className="btn-ghost timeline-reset"
            onClick={handleReset}
            disabled={disabled}
          >
            Reset
          </button>
        )}
      </div>

      <TimelineLabels
        startTime={startTime}
        endTime={effectiveEnd}
        duration={duration}
        playheadTime={playheadTime ?? 0}
      />

      <TimelineTrack
        trackRef={trackRef}
        startPercent={toPercent(startTime)}
        endPercent={toPercent(effectiveEnd)}
        playheadPercent={playheadPercent}
        dragging={dragging}
        disabled={disabled}
        onStartDrag={beginDrag}
        onTrackSeek={handleTrackSeek}
        onPlayheadNudge={(delta) => onSeek?.(Math.max(0, Math.min(duration, (playheadTime ?? 0) + delta)))}
      />
    </div>
  );
}
