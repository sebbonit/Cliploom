import { useCallback, useEffect, useRef, useState } from 'react';
import { MIN_TRIM_GAP, toStoredEndTime } from '../../../shared/trim';

export type TrimHandle = 'start' | 'end';
export type TimelineDragTarget = TrimHandle | 'playhead';

interface UseTimelineDragOptions {
  duration: number;
  startTime: number;
  endTime: number | null;
  disabled?: boolean;
  onChange: (start: number, end: number | null) => void;
  onSeek?: (time: number) => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

export function useTimelineDrag({
  duration,
  startTime,
  endTime,
  disabled,
  onChange,
  onSeek,
}: UseTimelineDragOptions) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<TimelineDragTarget | null>(null);

  const effectiveEnd = endTime ?? duration;

  const timeFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track || duration <= 0) return 0;
      const rect = track.getBoundingClientRect();
      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
      return ratio * duration;
    },
    [duration],
  );

  const beginDrag = useCallback(
    (handle: TimelineDragTarget) => {
      if (disabled || duration <= 0) return;
      if (handle === 'start') onSeek?.(startTime);
      if (handle === 'end') onSeek?.(effectiveEnd);
      setDragging(handle);
    },
    [disabled, duration, effectiveEnd, onSeek, startTime],
  );

  const seekTo = useCallback(
    (clientX: number) => {
      if (disabled || duration <= 0) return null;
      return timeFromClientX(clientX);
    },
    [disabled, duration, timeFromClientX],
  );

  useEffect(() => {
    if (!dragging) return;

    const onMove = (event: MouseEvent) => {
      const time = timeFromClientX(event.clientX);

      if (dragging === 'playhead') {
        onSeek?.(time);
        return;
      }

      if (dragging === 'start') {
        const nextStart = clamp(time, 0, effectiveEnd - MIN_TRIM_GAP);
        onSeek?.(nextStart);
        onChange(nextStart, endTime);
        return;
      }

      const nextEnd = clamp(time, startTime + MIN_TRIM_GAP, duration);
      onSeek?.(nextEnd);
      onChange(startTime, toStoredEndTime(nextEnd, duration));
    };

    const onUp = () => setDragging(null);

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [
    dragging,
    duration,
    effectiveEnd,
    endTime,
    onChange,
    onSeek,
    startTime,
    timeFromClientX,
  ]);

  const toPercent = useCallback(
    (time: number) => (duration > 0 ? (time / duration) * 100 : 0),
    [duration],
  );

  return {
    trackRef,
    dragging,
    effectiveEnd,
    beginDrag,
    seekTo,
    toPercent,
  };
}
