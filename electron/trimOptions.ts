import type ffmpeg from 'fluent-ffmpeg';
import type { ResolvedTrimRange } from '../shared/trim.js';
import { isFullVideoTrim } from '../shared/trim.js';

export function applyTrimToCommand(
  command: ffmpeg.FfmpegCommand,
  trim: ResolvedTrimRange,
  videoDuration: number,
): ffmpeg.FfmpegCommand {
  if (isFullVideoTrim(trim.start, trim.end, videoDuration)) {
    return command;
  }

  let next = command;
  if (trim.start > 0) {
    next = next.seekInput(trim.start);
  }
  if (trim.duration > 0) {
    next = next.duration(trim.duration);
  }
  return next;
}
