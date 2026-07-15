import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { randomUUID } from 'crypto';
import { getEncodingOptions } from '../shared/presets.js';
import { resolveTrimRange } from '../shared/trim.js';
import type { ConversionSettings, OutputFormat } from '../shared/types.js';
import { convertVideo } from './converter.js';
import { fileExists, probeVideo } from './ffmpeg.js';
import { applyTrimToCommand } from './trimOptions.js';
import { buildVideoFilter } from './videoFilters.js';

function runFfmpeg(command: ffmpeg.FfmpegCommand): Promise<void> {
  return new Promise((resolve, reject) => {
    command.on('end', () => resolve()).on('error', reject).run();
  });
}

export async function extractThumbnail(
  inputPath: string,
  tempDir: string,
  width = 640,
): Promise<string> {
  const outputPath = path.join(tempDir, `thumb-${randomUUID()}.jpg`);

  await runFfmpeg(
    ffmpeg(inputPath)
      .outputOptions(['-y', '-frames:v', '1', '-q:v', '2'])
      .videoFilters(`scale=${width}:-1:flags=lanczos`)
      .output(outputPath),
  );

  return outputPath;
}

export async function generatePreviewClip(
  inputPath: string,
  tempDir: string,
  settings: ConversionSettings,
  format: OutputFormat,
  durationSeconds = 2.5,
): Promise<string> {
  const baseName = `preview-${randomUUID()}`;
  const trimmedInput = path.join(tempDir, `${baseName}-trim.mp4`);
  const encoding = getEncodingOptions(settings);
  const metadata = await probeVideo(inputPath);
  const videoDuration = metadata.format.duration ?? 0;
  const trim = resolveTrimRange(settings.startTime, settings.endTime, videoDuration);
  const previewDuration = Math.min(durationSeconds, trim.duration);

  await runFfmpeg(
    applyTrimToCommand(
      ffmpeg(inputPath)
        .outputOptions(['-y', '-an'])
        .videoFilters(buildVideoFilter(encoding.fps, encoding.width, 0))
        .output(trimmedInput),
      { ...trim, duration: previewDuration },
      videoDuration,
    ),
  );

  const results = await convertVideo(
    trimmedInput,
    tempDir,
    baseName,
    [format],
    encoding,
    { start: 0, end: previewDuration, duration: previewDuration },
    previewDuration,
  );

  if (await fileExists(trimmedInput)) {
    const { unlink } = await import('fs/promises');
    await unlink(trimmedInput);
  }

  return results[0].outputPath;
}
