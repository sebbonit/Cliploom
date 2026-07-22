import type { ConversionSettings, QualityPreset } from './types';
import { clampOutputWidth } from './videoQuality';

export type X264Preset =
  | 'ultrafast'
  | 'veryfast'
  | 'faster'
  | 'fast'
  | 'medium'
  | 'slow';

export interface PresetConfig {
  fps: number;
  width: number;
  gifQuality: number;
  webpQuality: number;
  videoCrf: number;
  cornerRadius: number;
  gifMaxColors: number;
  webpMethod: number;
  webpCompressionLevel: number;
  x264Preset: X264Preset;
  audioBitrate: number;
}

type PresetEncoding = Omit<PresetConfig, 'cornerRadius'>;

function x264PresetForCrf(crf: number): X264Preset {
  if (crf <= 16) return 'slow';
  if (crf <= 20) return 'medium';
  if (crf <= 26) return 'fast';
  if (crf <= 32) return 'veryfast';
  return 'ultrafast';
}

function audioBitrateForCrf(crf: number): number {
  if (crf <= 16) return 192_000;
  if (crf <= 20) return 160_000;
  if (crf <= 26) return 128_000;
  if (crf <= 32) return 96_000;
  return 64_000;
}

export const PRESET_CONFIGS: Record<Exclude<QualityPreset, 'custom'>, PresetEncoding> = {
  'low-size': {
    fps: 10,
    width: 480,
    gifQuality: 5,
    webpQuality: 65,
    videoCrf: 32,
    gifMaxColors: 128,
    webpMethod: 4,
    webpCompressionLevel: 6,
    x264Preset: 'veryfast',
    audioBitrate: 64_000,
  },
  balanced: {
    fps: 15,
    width: 800,
    gifQuality: 3,
    webpQuality: 80,
    videoCrf: 26,
    gifMaxColors: 256,
    webpMethod: 5,
    webpCompressionLevel: 5,
    x264Preset: 'fast',
    audioBitrate: 128_000,
  },
  'high-quality': {
    fps: 30,
    width: 1920,
    gifQuality: 1,
    webpQuality: 92,
    videoCrf: 17,
    gifMaxColors: 256,
    webpMethod: 6,
    webpCompressionLevel: 4,
    x264Preset: 'slow',
    audioBitrate: 192_000,
  },
};

export const PRESET_LABELS: Record<QualityPreset, string> = {
  'low-size': 'Low Size',
  balanced: 'Balanced',
  'high-quality': 'High Quality',
  custom: 'Custom',
};

export function applyPreset(
  preset: Exclude<QualityPreset, 'custom'>,
  current: ConversionSettings,
): ConversionSettings {
  const config = PRESET_CONFIGS[preset];
  return {
    ...current,
    preset,
    fps: config.fps,
    width: config.width,
    gifQuality: config.gifQuality,
    webpQuality: config.webpQuality,
    videoCrf: config.videoCrf,
  };
}

export function getEncodingOptions(
  settings: ConversionSettings,
  sourceWidth?: number,
): PresetConfig {
  const base: PresetEncoding =
    settings.preset !== 'custom'
      ? PRESET_CONFIGS[settings.preset]
      : {
          fps: settings.fps,
          width: settings.width,
          gifQuality: settings.gifQuality,
          webpQuality: settings.webpQuality,
          videoCrf: settings.videoCrf,
          gifMaxColors: 256,
          webpMethod: 5,
          webpCompressionLevel: 5,
          x264Preset: x264PresetForCrf(settings.videoCrf),
          audioBitrate: audioBitrateForCrf(settings.videoCrf),
        };

  const videoCrf = settings.videoCrf;
  const fromPreset = settings.preset !== 'custom';

  return {
    ...base,
    fps: settings.fps,
    width: clampOutputWidth(settings.width, sourceWidth),
    gifQuality: settings.gifQuality,
    webpQuality: settings.webpQuality,
    videoCrf,
    // Live CRF tweaks should also pick a matching encoder effort / audio budget.
    x264Preset: fromPreset ? base.x264Preset : x264PresetForCrf(videoCrf),
    audioBitrate: fromPreset ? base.audioBitrate : audioBitrateForCrf(videoCrf),
    cornerRadius: settings.cornerRadius,
  };
}
