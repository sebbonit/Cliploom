import { resolveTrimRange } from '../../../shared/trim';
import type { ConversionSettings, OutputFormat, VideoMetadata } from '../../../shared/types';

/**
 * A deliberately conservative preflight estimate. Animated image compression varies
 * heavily with motion and texture, so the UI presents this as a range rather than an
 * exact promise.
 */
export function estimateOutputBytes(
  video: VideoMetadata,
  settings: ConversionSettings,
  format: OutputFormat,
): { low: number; high: number } {
  const trim = resolveTrimRange(settings.startTime, settings.endTime, video.duration);
  const sourceAspect = video.width && video.height ? video.height / video.width : 9 / 16;
  const outputHeight = Math.max(1, Math.round(settings.width * sourceAspect));
  const pixelFrames = settings.width * outputHeight * settings.fps * trim.duration;

  if (format === 'gif') {
    const ditherFactor = 1.18 - settings.gifQuality * 0.07;
    const midpoint = pixelFrames * 0.075 * ditherFactor;
    return { low: midpoint * 0.58, high: midpoint * 1.55 };
  }

  const qualityFactor = 0.55 + (settings.webpQuality / 100) * 0.75;
  const midpoint = pixelFrames * 0.022 * qualityFactor;
  return { low: midpoint * 0.55, high: midpoint * 1.45 };
}
