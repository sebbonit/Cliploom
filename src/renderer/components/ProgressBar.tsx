import type { ConversionProgress } from '../../../shared/types';

interface ProgressBarProps {
  progress: ConversionProgress;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <section className="progress-panel">
      <div className="progress-header">
        <span>{progress.stage}</span>
        <strong>{Math.round(progress.percent)}%</strong>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress.percent}%` }} />
      </div>
    </section>
  );
}
