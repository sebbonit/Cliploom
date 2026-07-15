import type { QualityPreset } from '../../../shared/types';
import { PRESET_LABELS } from '../../../shared/presets';

interface PresetSelectorProps {
  preset: QualityPreset;
  disabled?: boolean;
  onSelect: (preset: Exclude<QualityPreset, 'custom'>) => void;
}

const PRESETS: Exclude<QualityPreset, 'custom'>[] = [
  'low-size',
  'balanced',
  'high-quality',
];

export function PresetSelector({ preset, disabled, onSelect }: PresetSelectorProps) {
  const activePreset = preset === 'custom' ? null : preset;

  return (
    <div className="preset-selector">
      {PRESETS.map((value) => (
        <button
          key={value}
          type="button"
          className={`preset-chip ${activePreset === value ? 'active' : ''}`}
          onClick={() => onSelect(value)}
          disabled={disabled}
        >
          {PRESET_LABELS[value]}
        </button>
      ))}
      {preset === 'custom' && (
        <span className="preset-custom-badge">{PRESET_LABELS.custom}</span>
      )}
    </div>
  );
}
