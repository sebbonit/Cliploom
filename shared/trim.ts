export const MIN_TRIM_GAP = 0.1;

export interface ResolvedTrimRange {
  start: number;
  end: number;
  duration: number;
}

export function resolveTrimRange(
  startTime: number,
  endTime: number | null,
  videoDuration: number,
): ResolvedTrimRange {
  const safeDuration = Math.max(0, videoDuration);
  const start = clamp(startTime, 0, safeDuration);
  const end = clamp(endTime ?? safeDuration, 0, safeDuration);

  if (end - start < MIN_TRIM_GAP) {
    const expandedEnd = Math.min(safeDuration, start + MIN_TRIM_GAP);
    const expandedStart = Math.max(0, expandedEnd - MIN_TRIM_GAP);
    return {
      start: expandedStart,
      end: expandedEnd,
      duration: expandedEnd - expandedStart,
    };
  }

  return { start, end, duration: end - start };
}

export function isFullVideoTrim(
  start: number,
  end: number,
  videoDuration: number,
): boolean {
  return start <= 0.01 && end >= videoDuration - 0.01;
}

export function toStoredEndTime(
  end: number,
  videoDuration: number,
): number | null {
  return end >= videoDuration - 0.01 ? null : end;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}
