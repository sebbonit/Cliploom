import { useCallback, useEffect, useState } from 'react';
import type {
  ConversionProgress,
  ConversionResponse,
  ConversionSettings,
  VideoMetadata,
} from '../../../shared/types';

type AppPhase = 'idle' | 'converting' | 'done' | 'error';

interface UseConverterState {
  video: VideoMetadata | null;
  settings: ConversionSettings;
  phase: AppPhase;
  progress: ConversionProgress | null;
  result: ConversionResponse | null;
  error: string | null;
  loadVideo: (filePath: string) => Promise<void>;
  pickVideo: () => Promise<void>;
  pickOutputDir: () => Promise<void>;
  updateSettings: (patch: Partial<ConversionSettings>) => void;
  convert: () => Promise<void>;
  resetSettings: () => void;
  reset: () => void;
}

const SETTINGS_STORAGE_KEY = 'cliploom.settings.v1';
const LEGACY_SETTINGS_STORAGE_KEY = 'video-converter.settings.v1';

function getInitialSettings(fallback: ConversionSettings): ConversionSettings {
  try {
    const stored =
      window.localStorage.getItem(SETTINGS_STORAGE_KEY) ??
      window.localStorage.getItem(LEGACY_SETTINGS_STORAGE_KEY);
    if (!stored) return fallback;

    const parsed = JSON.parse(stored) as Partial<ConversionSettings>;
    return {
      ...fallback,
      ...parsed,
      formats: Array.isArray(parsed.formats) && parsed.formats.length
        ? parsed.formats
        : fallback.formats,
      startTime: 0,
      endTime: null,
    };
  } catch {
    return fallback;
  }
}

export function useConverter(initialSettings: ConversionSettings): UseConverterState {
  const [video, setVideo] = useState<VideoMetadata | null>(null);
  const [settings, setSettings] = useState<ConversionSettings>(() =>
    getInitialSettings(initialSettings),
  );
  const [phase, setPhase] = useState<AppPhase>('idle');
  const [progress, setProgress] = useState<ConversionProgress | null>(null);
  const [result, setResult] = useState<ConversionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!window.api?.onProgress) return;
    const unsubscribe = window.api.onProgress(setProgress);
    return unsubscribe;
  }, []);

  useEffect(() => {
    const persisted = { ...settings, startTime: 0, endTime: null };
    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      // Conversion remains fully usable when storage is unavailable.
    }
  }, [settings]);

  const loadVideo = useCallback(async (filePath: string) => {
    setError(null);
    setResult(null);
    setPhase('idle');
    const metadata = await window.api.probeVideo(filePath);
    setVideo(metadata);
    setSettings((prev) => ({
      ...prev,
      outputDir: prev.outputDir || filePath.slice(0, filePath.lastIndexOf('/')),
      startTime: 0,
      endTime: null,
    }));
  }, []);

  const pickVideo = useCallback(async () => {
    const filePath = await window.api.selectVideo();
    if (filePath) await loadVideo(filePath);
  }, [loadVideo]);

  const pickOutputDir = useCallback(async () => {
    const dir = await window.api.selectOutputDir();
    if (dir) setSettings((prev) => ({ ...prev, outputDir: dir }));
  }, []);

  const updateSettings = useCallback((patch: Partial<ConversionSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const convert = useCallback(async () => {
    if (!video) return;

    setPhase('converting');
    setError(null);
    setResult(null);
    setProgress({ stage: 'Starting', percent: 0 });

    try {
      const response = await window.api.convert({
        inputPath: video.filePath,
        settings,
      });
      setResult(response);
      setPhase('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
      setPhase('error');
    }
  }, [video, settings]);

  const resetSettings = useCallback(() => {
    setSettings((current) => ({
      ...initialSettings,
      outputDir: current.outputDir,
      startTime: current.startTime,
      endTime: current.endTime,
    }));
  }, [initialSettings]);

  const reset = useCallback(() => {
    setVideo(null);
    setResult(null);
    setError(null);
    setProgress(null);
    setPhase('idle');
  }, []);

  return {
    video,
    settings,
    phase,
    progress,
    result,
    error,
    loadVideo,
    pickVideo,
    pickOutputDir,
    updateSettings,
    convert,
    resetSettings,
    reset,
  };
}
