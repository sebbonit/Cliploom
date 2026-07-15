import ffmpegPath from 'ffmpeg-static';
import ffprobeInstaller from 'ffprobe-installer';
import ffmpeg from 'fluent-ffmpeg';
import { access } from 'fs/promises';
import { resolvePackedBinary } from './paths.js';

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(resolvePackedBinary(ffmpegPath));
}
ffmpeg.setFfprobePath(resolvePackedBinary(ffprobeInstaller.path));

export function probeVideo(filePath: string): Promise<ffmpeg.FfprobeData> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}
