/** Lower CRF = higher visual quality. */
export const MP4_CRF_BEST = 14;
export const MP4_CRF_WORST = 36;

export function crfToQualityPercent(crf: number): number {
  const clamped = Math.min(MP4_CRF_WORST, Math.max(MP4_CRF_BEST, crf));
  return Math.round(((MP4_CRF_WORST - clamped) / (MP4_CRF_WORST - MP4_CRF_BEST)) * 100);
}

export function qualityPercentToCrf(percent: number): number {
  const p = Math.min(100, Math.max(0, percent));
  return Math.round(MP4_CRF_WORST - (p / 100) * (MP4_CRF_WORST - MP4_CRF_BEST));
}

export function clampOutputWidth(requested: number, sourceWidth?: number): number {
  const even = (value: number) => (value % 2 === 0 ? value : value - 1);
  const safeRequested = Math.max(2, even(Math.round(requested)));
  if (!sourceWidth || sourceWidth <= 0) return safeRequested;
  return Math.min(safeRequested, even(sourceWidth));
}
