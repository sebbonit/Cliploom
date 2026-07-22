export type OutputFormat = 'gif' | 'webp' | 'mp4';

export type QualityPreset = 'low-size' | 'balanced' | 'high-quality' | 'custom';

export interface ConversionSettings {
  formats: OutputFormat[];
  preset: QualityPreset;
  fps: number;
  width: number;
  gifQuality: number;
  webpQuality: number;
  videoCrf: number;
  cornerRadius: number;
  outputDir: string;
  startTime: number;
  endTime: number | null;
}

export interface VideoMetadata {
  fileName: string;
  filePath: string;
  duration: number;
  width?: number;
  height?: number;
  size: number;
}

export interface ConvertedFile {
  format: OutputFormat;
  path: string;
  size: number;
}

export interface ConversionProgress {
  stage: string;
  percent: number;
}

export interface ConversionRequest {
  inputPath: string;
  settings: ConversionSettings;
}

export interface ConversionResponse {
  outputs: ConvertedFile[];
}

export interface PreviewRequest {
  inputPath: string;
  settings: ConversionSettings;
  format: OutputFormat;
  durationSeconds?: number;
}

export interface PreviewResponse {
  path: string;
  format: OutputFormat;
}

export interface SizeEstimateRequest {
  inputPath: string;
  settings: ConversionSettings;
}

export interface SizeEstimateResult {
  format: OutputFormat;
  bytes: number;
}

export interface SizeEstimateResponse {
  estimates: SizeEstimateResult[];
}

export interface MediaSrcPayload {
  kind: 'url' | 'blob';
  url?: string;
  mimeType?: string;
  data?: Uint8Array | ArrayBuffer;
}

export const DEFAULT_SETTINGS: ConversionSettings = {
  formats: ['gif', 'webp', 'mp4'],
  preset: 'balanced',
  fps: 15,
  width: 800,
  gifQuality: 3,
  webpQuality: 80,
  videoCrf: 26,
  cornerRadius: 0,
  outputDir: '',
  startTime: 0,
  endTime: null,
};

export function isVideoOutput(format: OutputFormat): boolean {
  return format === 'mp4';
}

export function supportsCornerRadius(format: OutputFormat): boolean {
  return format === 'gif' || format === 'webp';
}

export interface DesktopApi {
  selectVideo: () => Promise<string | null>;
  selectOutputDir: () => Promise<string | null>;
  probeVideo: (filePath: string) => Promise<VideoMetadata>;
  convert: (request: ConversionRequest) => Promise<ConversionResponse>;
  getMediaSrc: (filePath: string) => Promise<MediaSrcPayload>;
  getThumbnail: (filePath: string, width?: number) => Promise<MediaSrcPayload>;
  generatePreview: (request: PreviewRequest) => Promise<PreviewResponse>;
  estimateSizes: (request: SizeEstimateRequest) => Promise<SizeEstimateResponse>;
  showInFolder: (filePath: string) => Promise<void>;
  onProgress: (callback: (progress: ConversionProgress) => void) => () => void;
}

declare global {
  interface Window {
    api: DesktopApi;
  }
}
