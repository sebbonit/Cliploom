import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import type { PresetConfig } from '../shared/presets.js';
import type { ResolvedTrimRange } from '../shared/trim.js';
import { applyTrimToCommand } from './trimOptions.js';
import { buildVideoFilter, hasRoundedCorners } from './videoFilters.js';

export type OutputFormat = 'gif' | 'webp';

export interface ConversionResult {
  format: OutputFormat;
  outputPath: string;
}

type ProgressCallback = (stage: string, percent: number) => void;

function runFfmpeg(
  command: ffmpeg.FfmpegCommand,
  stage: string,
  onProgress?: ProgressCallback,
): Promise<void> {
  return new Promise((resolve, reject) => {
    command
      .on('progress', (progress) => {
        if (onProgress && progress.percent) {
          onProgress(stage, Math.min(99, progress.percent));
        }
      })
      .on('end', () => resolve())
      .on('error', reject)
      .run();
  });
}

async function convertToGif(
  inputPath: string,
  outputPath: string,
  options: PresetConfig,
  trim: ResolvedTrimRange,
  videoDuration: number,
  onProgress?: ProgressCallback,
): Promise<void> {
  const videoFilter = buildVideoFilter(options.fps, options.width, options.cornerRadius);
  const paletteGen = `palettegen=max_colors=${options.gifMaxColors}:stats_mode=diff:reserve_transparent=1`;
  const paletteUse = `paletteuse=dither=bayer:bayer_scale=${options.gifQuality}:diff_mode=rectangle`;

  // Single-pass filter graph keeps seek/duration on the video input.
  // A two-pass palette file would make seekInput attach to the palette instead.
  onProgress?.('Encoding GIF', 10);

  await runFfmpeg(
    applyTrimToCommand(
      ffmpeg(inputPath)
        .outputOptions(['-y', '-loop', '0'])
        .complexFilter([
          `[0:v]${videoFilter}[v]`,
          `[v]split[v1][v2]`,
          `[v1]${paletteGen}[p]`,
          `[v2][p]${paletteUse}`,
        ])
        .output(outputPath),
      trim,
      videoDuration,
    ),
    'Encoding GIF',
    onProgress,
  );
}

async function convertToWebp(
  inputPath: string,
  outputPath: string,
  options: PresetConfig,
  trim: ResolvedTrimRange,
  videoDuration: number,
  onProgress?: ProgressCallback,
): Promise<void> {
  const videoFilter = buildVideoFilter(options.fps, options.width, options.cornerRadius);
  const rounded = hasRoundedCorners(options.cornerRadius);

  onProgress?.('Encoding WebP', 10);

  const outputOptions = [
    '-y',
    '-loop',
    '0',
    '-an',
    '-vsync',
    '0',
    '-c:v',
    'libwebp',
    '-q:v',
    String(options.webpQuality),
    '-preset',
    'picture',
    '-method',
    String(options.webpMethod),
    '-compression_level',
    String(options.webpCompressionLevel),
  ];

  if (rounded) {
    outputOptions.push('-pix_fmt', 'yuva420p');
  }

  await runFfmpeg(
    applyTrimToCommand(
      ffmpeg(inputPath)
        .outputOptions(outputOptions)
        .videoFilters(videoFilter)
        .output(outputPath),
      trim,
      videoDuration,
    ),
    'Encoding WebP',
    onProgress,
  );
}

export async function convertVideo(
  inputPath: string,
  outputDir: string,
  baseName: string,
  formats: OutputFormat[],
  options: PresetConfig,
  trim: ResolvedTrimRange,
  videoDuration: number,
  onProgress?: ProgressCallback,
): Promise<ConversionResult[]> {
  const results: ConversionResult[] = [];
  const stepSize = 100 / formats.length;

  for (let i = 0; i < formats.length; i++) {
    const format = formats[i];
    const outputPath = path.join(outputDir, `${baseName}.${format}`);
    const basePercent = i * stepSize;

    const reportProgress = (stage: string, percent: number) => {
      const overall = basePercent + (percent / 100) * stepSize;
      onProgress?.(stage, Math.min(99, overall));
    };

    if (format === 'gif') {
      await convertToGif(inputPath, outputPath, options, trim, videoDuration, reportProgress);
    } else {
      await convertToWebp(inputPath, outputPath, options, trim, videoDuration, reportProgress);
    }

    results.push({ format, outputPath });
  }

  onProgress?.('Done', 100);
  return results;
}
