import { formatTimelineTime } from '../../utils/format';

interface TimelineLabelsProps {
  startTime: number;
  endTime: number;
  duration: number;
  playheadTime: number;
}

export function TimelineLabels({ startTime, endTime, duration, playheadTime }: TimelineLabelsProps) {
  const selectionDuration = Math.max(0, endTime - startTime);

  return (
    <div className="timeline-labels">
      <span>
        Current <strong>{formatTimelineTime(playheadTime)}</strong>
      </span>
      <span>
        In <strong>{formatTimelineTime(startTime)}</strong>
      </span>
      <span>
        Out <strong>{formatTimelineTime(endTime)}</strong>
      </span>
      <span>
        Duration <strong>{formatTimelineTime(selectionDuration)}</strong>
      </span>
      <span className="timeline-label-muted">of {formatTimelineTime(duration)}</span>
    </div>
  );
}
