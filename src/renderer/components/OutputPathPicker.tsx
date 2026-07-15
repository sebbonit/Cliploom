import { shortenPath } from '../utils/format';

interface OutputPathPickerProps {
  outputDir: string;
  disabled?: boolean;
  onPick: () => void;
}

export function OutputPathPicker({ outputDir, disabled, onPick }: OutputPathPickerProps) {
  return (
    <section className="panel output-path-panel">
      <h2>Save to</h2>
      <button
        type="button"
        className="path-picker"
        onClick={onPick}
        disabled={disabled}
      >
        <span className="path-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3.5 7.5h6l2-2h9v13h-17v-11z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="path-value">
          {outputDir ? shortenPath(outputDir) : 'Same folder as source'}
        </span>
        <span className="path-change">Choose</span>
      </button>
    </section>
  );
}
