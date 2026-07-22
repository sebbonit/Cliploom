export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  const value = Math.round(bytes);
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatTimelineTime(seconds: number): string {
  const safeSeconds = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds - mins * 60;
  return `${mins}:${secs.toFixed(2).padStart(5, '0')}`;
}

export function shortenPath(filePath: string, max = 48): string {
  if (filePath.length <= max) return filePath;
  const parts = filePath.split('/');
  const file = parts.pop() ?? '';
  const folder = parts.join('/');
  const available = max - file.length - 4;
  if (available <= 0) return `.../${file}`;
  return `...${folder.slice(-available)}/${file}`;
}
