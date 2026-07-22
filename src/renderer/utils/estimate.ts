import { getEncodingOptions } from '../../../shared/presets';
import { resolveTrimRange } from '../../../shared/trim';
import type { ConversionSettings, OutputFormat, VideoMetadata } from '../../../shared/types';

function evenDimension(value: number): number {
  const rounded = Math.max(2, Math.round(value));
  return rounded % 2 === 0 ? rounded : rounded + 1;
}

function outputDimensions(
  video: VideoMetadata,
  width: number,
): { width: number; height: number } {
  const sourceAspect =
    video.width && video.height && video.width > 0
      ? video.height / video.width
      : 9 / 16;
  return {
    width,
    height: evenDimension(width * sourceAspect),
  };
}

function rangeAround(midpoint: number, lowFactor: number, highFactor: number) {
  const mid = Math.max(0, midpoint);
  return {
    low: Math.round(mid * lowFactor),
    high: Math.round(mid * highFactor),
  };
}

/**
 * Instant fallback estimate shown while a short real encode sample is prepared.
 * Biased toward screen-recording content (Cliploom's primary use case).
 */
export function estimateOutputBytes(
  video: VideoMetadata,
  settings: ConversionSettings,
  format: OutputFormat,
): { low: number; high: number } {
  const encoding = getEncodingOptions(settings);
  const trim = resolveTrimRange(settings.startTime, settings.endTime, video.duration);
  const { width, height } = outputDimensions(video, encoding.width);
  const pixelFrames = width * height * encoding.fps * trim.duration;

  if (format === 'gif') {
    const colorFactor = encoding.gifMaxColors <= 128 ? 0.7 : 1;
    const ditherFactor = 1.2 - encoding.gifQuality * 0.08;
    // Screen UI is often tiny; high-motion clips sit near the top of the band.
    const midpoint = pixelFrames * 0.01 * colorFactor * ditherFactor;
    return rangeAround(midpoint, 0.25, 4.5);
  }

  if (format === 'webp') {
    const qualityFactor = 0.5 + (encoding.webpQuality / 100) * 0.7;
    const midpoint = pixelFrames * 0.008 * qualityFactor;
    return rangeAround(midpoint, 0.35, 2.8);
  }

  const bitsPerPixel = 0.05 * Math.pow(0.84, encoding.videoCrf - 18);
  const videoBytes = (pixelFrames * bitsPerPixel) / 8;
  const audioBytes = (encoding.audioBitrate / 8) * trim.duration;
  const midpoint = videoBytes + audioBytes + 4096;
  return rangeAround(midpoint, 0.45, 2.2);
}
