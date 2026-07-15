import type { ConversionSettings, QualityPreset } from './types';

export interface PresetConfig {
  fps: number;
  width: number;
  gifQuality: number;
  webpQuality: number;
  cornerRadius: number;
  gifMaxColors: number;
  webpMethod: number;
  webpCompressionLevel: number;
}

type PresetEncoding = Omit<PresetConfig, 'cornerRadius'>;

export const PRESET_CONFIGS: Record<Exclude<QualityPreset, 'custom'>, PresetEncoding> = {
  'low-size': {
    fps: 10,
    width: 480,
    gifQuality: 5,
    webpQuality: 65,
    gifMaxColors: 128,
    webpMethod: 4,
    webpCompressionLevel: 6,
  },
  balanced: {
    fps: 15,
    width: 800,
    gifQuality: 3,
    webpQuality: 80,
    gifMaxColors: 256,
    webpMethod: 5,
    webpCompressionLevel: 5,
  },
  'high-quality': {
    fps: 24,
    width: 1280,
    gifQuality: 1,
    webpQuality: 92,
    gifMaxColors: 256,
    webpMethod: 6,
    webpCompressionLevel: 4,
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
  };
}

export function getEncodingOptions(settings: ConversionSettings): PresetConfig {
  const base: PresetEncoding =
    settings.preset !== 'custom'
      ? PRESET_CONFIGS[settings.preset]
      : {
          fps: settings.fps,
          width: settings.width,
          gifQuality: settings.gifQuality,
          webpQuality: settings.webpQuality,
          gifMaxColors: 256,
          webpMethod: 5,
          webpCompressionLevel: 5,
        };

  return {
    ...base,
    cornerRadius: settings.cornerRadius,
  };
}
