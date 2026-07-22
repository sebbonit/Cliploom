import { useEffect, useState } from 'react';
import type { ConversionSettings, OutputFormat, VideoMetadata } from '../../../shared/types';
import { estimateOutputBytes } from '../utils/estimate';

export type EstimateSource = 'heuristic' | 'sample';

export interface FormatEstimate {
  low: number;
  high: number;
  source: EstimateSource;
}

type EstimatesMap = Partial<Record<OutputFormat, FormatEstimate>>;

function heuristicEstimates(
  video: VideoMetadata,
  settings: ConversionSettings,
): EstimatesMap {
  const next: EstimatesMap = {};
  for (const format of settings.formats) {
    const range = estimateOutputBytes(video, settings, format);
    next[format] = { ...range, source: 'heuristic' };
  }
  return next;
}

function sampleEstimates(
  samples: { format: OutputFormat; bytes: number }[],
): EstimatesMap {
  const next: EstimatesMap = {};
  for (const sample of samples) {
    // Real encode sample — keep a tight band for motion variance across the clip.
    next[sample.format] = {
      low: Math.round(sample.bytes * 0.88),
      high: Math.round(sample.bytes * 1.18),
      source: 'sample',
    };
  }
  return next;
}

export function useSizeEstimates(
  video: VideoMetadata | null,
  settings: ConversionSettings,
  enabled = true,
): { estimates: EstimatesMap; sampling: boolean } {
  const [estimates, setEstimates] = useState<EstimatesMap>({});
  const [sampling, setSampling] = useState(false);

  useEffect(() => {
    if (!video || !enabled || settings.formats.length === 0) {
      setEstimates({});
      setSampling(false);
      return;
    }

    setEstimates(heuristicEstimates(video, settings));

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setSampling(true);
      try {
        const response = await window.api.estimateSizes({
          inputPath: video.filePath,
          settings,
        });
        if (!cancelled) {
          setEstimates(sampleEstimates(response.estimates));
        }
      } catch {
        // Keep the heuristic fallback when sampling fails.
      } finally {
        if (!cancelled) setSampling(false);
      }
    }, 650);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    video,
    enabled,
    settings.formats,
    settings.preset,
    settings.fps,
    settings.width,
    settings.gifQuality,
    settings.webpQuality,
    settings.videoCrf,
    settings.cornerRadius,
    settings.startTime,
    settings.endTime,
  ]);

  return { estimates, sampling };
}
