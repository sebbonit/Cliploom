import type { ConversionSettings, OutputFormat, VideoMetadata } from '../../../shared/types';
import { resolveTrimRange } from '../../../shared/trim';
import { useSizeEstimates } from '../hooks/useSizeEstimates';
import { formatBytes, formatDuration } from '../utils/format';

interface ExportSummaryProps {
  video: VideoMetadata;
  settings: ConversionSettings;
  enabled?: boolean;
}

function formatEstimateRange(low: number, high: number): string {
  if (low <= 0 && high <= 0) return '—';
  if (low === high || formatBytes(low) === formatBytes(high)) return formatBytes(high);
  return `${formatBytes(low)} – ${formatBytes(high)}`;
}

export function ExportSummary({ video, settings, enabled = true }: ExportSummaryProps) {
  const trim = resolveTrimRange(settings.startTime, settings.endTime, video.duration);
  const { estimates, sampling } = useSizeEstimates(video, settings, enabled);

  return (
    <section className="export-summary" aria-label="Export summary">
      <div className="summary-heading">
        <span>Export summary</span>
        <span className="summary-saved">
          <span className="saved-dot" /> Settings saved
        </span>
      </div>
      <div className="summary-stats">
        <div>
          <span>Duration</span>
          <strong>{formatDuration(trim.duration)}</strong>
        </div>
        <div>
          <span>Output</span>
          <strong>{settings.width}px · {settings.fps} fps</strong>
        </div>
      </div>
      <div className="estimate-list">
        {settings.formats.map((format: OutputFormat) => {
          const estimate = estimates[format];
          return (
            <div key={format} className="estimate-row">
              <span className={`format-dot ${format}`} />
              <span>{format.toUpperCase()}</span>
              <strong>
                {estimate
                  ? `~${formatEstimateRange(estimate.low, estimate.high)}`
                  : '…'}
              </strong>
            </div>
          );
        })}
      </div>
      <p className="estimate-note">
        {sampling
          ? 'Measuring with a short encode sample…'
          : Object.values(estimates).some((item) => item?.source === 'sample')
            ? 'Based on a short encode sample · motion can still shift the final size'
            : 'Estimated range · motion and texture affect final size'}
      </p>
    </section>
  );
}
