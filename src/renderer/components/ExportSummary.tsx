import type { ConversionSettings, OutputFormat, VideoMetadata } from '../../../shared/types';
import { resolveTrimRange } from '../../../shared/trim';
import { estimateOutputBytes } from '../utils/estimate';
import { formatBytes, formatDuration } from '../utils/format';

interface ExportSummaryProps {
  video: VideoMetadata;
  settings: ConversionSettings;
}

function formatEstimate(video: VideoMetadata, settings: ConversionSettings, format: OutputFormat) {
  const estimate = estimateOutputBytes(video, settings, format);
  return `${formatBytes(estimate.low)}–${formatBytes(estimate.high)}`;
}

export function ExportSummary({ video, settings }: ExportSummaryProps) {
  const trim = resolveTrimRange(settings.startTime, settings.endTime, video.duration);

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
        {settings.formats.map((format) => (
          <div key={format} className="estimate-row">
            <span className={`format-dot ${format}`} />
            <span>{format.toUpperCase()}</span>
            <strong>~{formatEstimate(video, settings, format)}</strong>
          </div>
        ))}
      </div>
      <p className="estimate-note">Estimated range · motion and texture affect final size</p>
    </section>
  );
}
