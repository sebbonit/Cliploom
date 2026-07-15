import { applyPreset } from '../../../shared/presets';
import type { ConversionSettings, OutputFormat, QualityPreset } from '../../../shared/types';
import { PresetSelector } from './PresetSelector';

interface FormatPickerProps {
  formats: OutputFormat[];
  disabled?: boolean;
  onChange: (formats: OutputFormat[]) => void;
}

const OPTIONS: { value: OutputFormat; label: string; hint: string; meta: string }[] = [
  { value: 'gif', label: 'GIF', hint: 'Universal', meta: 'Best compatibility' },
  { value: 'webp', label: 'WebP', hint: 'Efficient', meta: 'Smaller, sharper' },
];

export function FormatPicker({ formats, disabled, onChange }: FormatPickerProps) {
  const toggle = (format: OutputFormat) => {
    if (disabled) return;
    if (formats.includes(format)) {
      const next = formats.filter((f) => f !== format);
      if (next.length > 0) onChange(next);
    } else {
      onChange([...formats, format]);
    }
  };

  return (
    <section className="panel">
      <h2>Output</h2>
      <p className="panel-description">Choose one or both formats.</p>
      <div className="format-grid">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`format-card ${formats.includes(option.value) ? 'active' : ''}`}
            onClick={() => toggle(option.value)}
            disabled={disabled}
          >
            <span className="format-card-top">
              <span className={`format-icon ${option.value}`}>{option.label.slice(0, 1)}</span>
              <span className="format-check" aria-hidden="true">✓</span>
            </span>
            <span className="format-label">{option.label}</span>
            <span className="format-hint">{option.hint} · {option.meta}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

interface QualityPanelProps {
  settings: ConversionSettings;
  disabled?: boolean;
  onChange: (patch: Partial<ConversionSettings>) => void;
}

function markCustom(
  patch: Partial<ConversionSettings>,
): Partial<ConversionSettings> {
  return { ...patch, preset: 'custom' as const };
}

export function QualityPanel({
  settings,
  disabled,
  onChange,
}: QualityPanelProps) {
  const handlePreset = (preset: Exclude<QualityPreset, 'custom'>) => {
    onChange(applyPreset(preset, settings));
  };

  return (
    <section className="panel">
      <h2>Quality</h2>
      <p className="panel-description">Start with a preset, then fine-tune.</p>

      <PresetSelector
        preset={settings.preset}
        disabled={disabled}
        onSelect={handlePreset}
      />

      <label className="slider-field">
        <div className="slider-header">
          <span>Frame rate</span>
          <strong>{settings.fps} fps</strong>
        </div>
        <input
          type="range"
          min={5}
          max={30}
          value={settings.fps}
          onChange={(e) => onChange(markCustom({ fps: Number(e.target.value) }))}
          disabled={disabled}
        />
      </label>

      <label className="slider-field">
        <div className="slider-header">
          <span>Width</span>
          <strong>{settings.width}px</strong>
        </div>
        <input
          type="range"
          min={320}
          max={1280}
          step={40}
          value={settings.width}
          onChange={(e) => onChange(markCustom({ width: Number(e.target.value) }))}
          disabled={disabled}
        />
      </label>

      {settings.formats.includes('gif') && (
        <label className="slider-field">
          <div className="slider-header">
            <span>GIF dithering</span>
            <strong>{settings.gifQuality}</strong>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            value={settings.gifQuality}
            onChange={(e) =>
              onChange(markCustom({ gifQuality: Number(e.target.value) }))
            }
            disabled={disabled}
          />
          <span className="slider-hint">Lower = sharper, higher = smaller file</span>
        </label>
      )}

      {settings.formats.includes('webp') && (
        <label className="slider-field">
          <div className="slider-header">
            <span>WebP quality</span>
            <strong>{settings.webpQuality}</strong>
          </div>
          <input
            type="range"
            min={50}
            max={100}
            value={settings.webpQuality}
            onChange={(e) =>
              onChange(markCustom({ webpQuality: Number(e.target.value) }))
            }
            disabled={disabled}
          />
        </label>
      )}

      <label className="slider-field">
        <div className="slider-header">
          <span>Corner radius</span>
          <strong>{settings.cornerRadius === 0 ? 'Off' : `${settings.cornerRadius}px`}</strong>
        </div>
        <input
          type="range"
          min={0}
          max={48}
          step={4}
          value={settings.cornerRadius}
          onChange={(e) =>
            onChange(markCustom({ cornerRadius: Number(e.target.value) }))
          }
          disabled={disabled}
        />
        <span className="slider-hint">Rounds GIF/WebP corners with transparency</span>
      </label>
    </section>
  );
}
