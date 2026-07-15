import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

interface VideoPlayheadOptions {
  startTime: number;
  endTime: number | null;
  duration: number;
  mediaKey: string | null;
}

export function useVideoPlayhead(
  videoRef: RefObject<HTMLVideoElement | null>,
  { startTime, endTime, duration, mediaKey }: VideoPlayheadOptions,
) {
  const [playhead, setPlayhead] = useState(0);
  const rangeRef = useRef({ start: startTime, end: endTime ?? duration });

  // Keep playback bounds current without tearing down the media listeners while dragging.
  rangeRef.current = { start: startTime, end: endTime ?? duration };

  useEffect(() => {
    const element = videoRef.current;
    if (!element || !mediaKey) return;

    let animationFrame: number | null = null;

    const update = () => setPlayhead(element.currentTime);
    const moveToRangeStart = () => {
      const { start } = rangeRef.current;
      element.currentTime = start;
      setPlayhead(start);
    };
    const tick = () => {
      const { start, end } = rangeRef.current;

      if (
        !element.paused &&
        (element.currentTime < start - 0.05 || element.currentTime >= end - 0.02)
      ) {
        element.currentTime = start;
      }

      update();
      if (!element.paused) animationFrame = requestAnimationFrame(tick);
    };
    const startTracking = () => {
      const { start, end } = rangeRef.current;
      if (element.currentTime < start - 0.05 || element.currentTime >= end - 0.02) {
        moveToRangeStart();
      }
      if (animationFrame === null) animationFrame = requestAnimationFrame(tick);
    };
    const stopTracking = () => {
      if (animationFrame !== null) cancelAnimationFrame(animationFrame);
      animationFrame = null;
      update();
    };
    const restartSelection = () => {
      moveToRangeStart();
      void element.play().catch(() => undefined);
    };

    element.addEventListener('play', startTracking);
    element.addEventListener('pause', stopTracking);
    element.addEventListener('timeupdate', update);
    element.addEventListener('seeking', update);
    element.addEventListener('seeked', update);
    element.addEventListener('loadedmetadata', update);
    element.addEventListener('ended', restartSelection);

    update();

    return () => {
      if (animationFrame !== null) cancelAnimationFrame(animationFrame);
      element.removeEventListener('play', startTracking);
      element.removeEventListener('pause', stopTracking);
      element.removeEventListener('timeupdate', update);
      element.removeEventListener('seeking', update);
      element.removeEventListener('seeked', update);
      element.removeEventListener('loadedmetadata', update);
      element.removeEventListener('ended', restartSelection);
    };
  }, [mediaKey, videoRef]);

  const seek = useCallback(
    (time: number) => {
      const element = videoRef.current;
      if (!element) return;

      const mediaDuration = Number.isFinite(element.duration) ? element.duration : duration;
      const safeTime = Math.max(0, Math.min(time, mediaDuration));
      element.currentTime = safeTime;
      setPlayhead(safeTime);
    },
    [duration, videoRef],
  );

  return { playhead, seek };
}
