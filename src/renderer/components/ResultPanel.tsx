import type { ConvertedFile } from '../../../shared/types';
import { useMediaUrl } from '../hooks/useMediaUrl';
import { formatBytes } from '../utils/format';
import { OutputMedia } from './OutputMedia';

interface ResultPanelProps {
  outputs: ConvertedFile[];
  onShowInFolder: (path: string) => void;
  onReset: () => void;
}

function OutputPreview({ file }: { file: ConvertedFile }) {
  const src = useMediaUrl(file.path);

  if (!src) return null;

  return (
    <OutputMedia
      className="output-preview-image"
      src={src}
      format={file.format}
      alt={`${file.format} output`}
    />
  );
}

export function ResultPanel({ outputs, onShowInFolder, onReset }: ResultPanelProps) {
  return (
    <section className="result-panel">
      <div className="result-header">
        <div className="result-title-wrap">
          <span className="result-check" aria-hidden="true">✓</span>
          <div>
            <span className="eyebrow">Export complete</span>
            <h2>Your files are ready</h2>
            <p>{outputs.length} {outputs.length === 1 ? 'file' : 'files'} saved successfully.</p>
          </div>
        </div>
        <button type="button" className="btn-ghost" onClick={onReset}>
          Convert another video
        </button>
      </div>

      <div className="output-list">
        {outputs.map((file) => (
          <article key={file.path} className="output-result">
            <OutputPreview file={file} />
            <button
              type="button"
              className="output-card"
              onClick={() => onShowInFolder(file.path)}
            >
              <span className={`output-badge ${file.format}`}>{file.format}</span>
              <span className="output-name">{file.path.split('/').pop()}</span>
              <span className="output-size">{formatBytes(file.size)}</span>
              <span className="output-action">Show in Finder →</span>
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
