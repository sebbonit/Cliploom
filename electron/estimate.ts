import { randomUUID } from 'crypto';
import { stat, unlink } from 'fs/promises';
import { getEncodingOptions } from '../shared/presets.js';
import { resolveTrimRange } from '../shared/trim.js';
import type { ConversionSettings, OutputFormat } from '../shared/types.js';
import { convertVideo } from './converter.js';
import { fileExists, probeVideo } from './ffmpeg.js';

export interface SizeEstimate {
  format: OutputFormat;
  bytes: number;
}

async function removeQuietly(filePath: string): Promise<void> {
  if (await fileExists(filePath)) {
    await unlink(filePath);
  }
}

/**
 * Encode a short sample with the real pipeline, then extrapolate to the full trim.
 * This tracks actual GIF/WebP/MP4 compression much better than a pure heuristic.
 */
export async function estimateConversionSizes(
  inputPath: string,
  tempDir: string,
  settings: ConversionSettings,
  sampleSeconds = 1.25,
): Promise<SizeEstimate[]> {
  const formats = settings.formats;
  if (!formats.length) return [];

  const metadata = await probeVideo(inputPath);
  const videoStream = metadata.streams.find((stream) => stream.codec_type === 'video');
  const encoding = getEncodingOptions(settings, videoStream?.width);
  const videoDuration = metadata.format.duration ?? 0;
  const trim = resolveTrimRange(settings.startTime, settings.endTime, videoDuration);
  const sampleDuration = Math.min(sampleSeconds, Math.max(0.25, trim.duration));
  const sampleTrim = {
    start: trim.start,
    end: trim.start + sampleDuration,
    duration: sampleDuration,
  };
  const id = randomUUID();
  const outputs: string[] = [];

  try {
    const results = await convertVideo(
      inputPath,
      tempDir,
      `estimate-${id}`,
      formats,
      encoding,
      sampleTrim,
      videoDuration,
    );

    const scale = trim.duration / sampleDuration;
    const estimates: SizeEstimate[] = [];

    for (const result of results) {
      outputs.push(result.outputPath);
      const fileStat = await stat(result.outputPath);
      estimates.push({
        format: result.format,
        bytes: Math.max(1, Math.round(fileStat.size * scale)),
      });
    }

    return estimates;
  } finally {
    await Promise.all(outputs.map((filePath) => removeQuietly(filePath)));
  }
}
