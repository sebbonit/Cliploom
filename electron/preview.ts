import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { randomUUID } from 'crypto';
import { getEncodingOptions } from '../shared/presets.js';
import { resolveTrimRange } from '../shared/trim.js';
import type { ConversionSettings, OutputFormat } from '../shared/types.js';
import { convertVideo } from './converter.js';
import { probeVideo } from './ffmpeg.js';

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
      .videoFilters(`scale=${width}:-1:flags=lanczos+accurate_rnd+full_chroma_int`)
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
  const metadata = await probeVideo(inputPath);
  const videoStream = metadata.streams.find((stream) => stream.codec_type === 'video');
  const encoding = getEncodingOptions(settings, videoStream?.width);
  const videoDuration = metadata.format.duration ?? 0;
  const trim = resolveTrimRange(settings.startTime, settings.endTime, videoDuration);
  const previewDuration = Math.min(durationSeconds, trim.duration);
  const previewTrim = {
    start: trim.start,
    end: trim.start + previewDuration,
    duration: previewDuration,
  };

  // Encode straight from the source trim — avoids a soft intermediate re-encode.
  const results = await convertVideo(
    inputPath,
    tempDir,
    baseName,
    [format],
    encoding,
    previewTrim,
    videoDuration,
  );

  return results[0].outputPath;
}
