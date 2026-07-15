import { useEffect, useState } from 'react';
import { resolveTrimRange } from '../../../shared/trim';
import type { ConversionSettings, OutputFormat } from '../../../shared/types';
import { formatDuration } from '../utils/format';
import { isObjectUrl, resolveMediaSrc } from '../utils/media';
import { MaximizePreviewButton, PreviewLightbox } from './PreviewLightbox';

interface SettingsPreviewProps {
  videoPath: string;
  settings: ConversionSettings;
  videoDuration: number;
  disabled?: boolean;
}

export function SettingsPreview({ videoPath, settings, videoDuration, disabled }: SettingsPreviewProps) {
  const [format, setFormat] = useState<OutputFormat>(settings.formats[0] ?? 'gif');
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (settings.formats.includes(format)) return;
    setFormat(settings.formats[0] ?? 'gif');
  }, [format, settings.formats]);

  useEffect(() => {
    return () => {
      if (previewSrc && isObjectUrl(previewSrc)) {
        URL.revokeObjectURL(previewSrc);
      }
    };
  }, [previewSrc]);

  const generatePreview = async () => {
    if (!settings.formats.length) return;

    setLoading(true);
    setError(null);

    if (previewSrc && isObjectUrl(previewSrc)) {
      URL.revokeObjectURL(previewSrc);
    }

    try {
      const response = await window.api.generatePreview({
        inputPath: videoPath,
        settings,
        format,
        durationSeconds: 2.5,
      });
      const payload = await window.api.getMediaSrc(response.path);
      setPreviewSrc(resolveMediaSrc(payload));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Preview failed');
      setPreviewSrc(null);
    } finally {
      setLoading(false);
    }
  };

  if (!settings.formats.length) return null;

  const trim = resolveTrimRange(settings.startTime, settings.endTime, videoDuration);
  const previewMeta =
    trim.duration < videoDuration - 0.01
      ? `~2.5s from ${formatDuration(trim.start)} at current settings`
      : '~2.5s clip at current settings';

  return (
    <section className="preview-panel settings-preview">
      <div className="preview-header">
        <div>
          <h2>Output preview</h2>
          <p className="preview-meta">{previewMeta}</p>
        </div>
        <div className="preview-actions">
          {settings.formats.length > 1 && (
            <div className="preview-format-toggle">
              {settings.formats.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`preset-chip ${format === value ? 'active' : ''}`}
                  onClick={() => setFormat(value)}
                  disabled={disabled || loading}
                >
                  {value.toUpperCase()}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            className="btn-ghost"
            onClick={generatePreview}
            disabled={disabled || loading}
          >
            {loading ? 'Generating…' : previewSrc ? 'Refresh preview' : 'Preview settings'}
          </button>
        </div>
      </div>

      {error && <p className="error-banner">{error}</p>}

      {previewSrc ? (
        <div className="preview-media-wrap">
          <img className="preview-media output-preview" src={previewSrc} alt="Output preview" />
          <MaximizePreviewButton onClick={() => setIsMaximized(true)} />
        </div>
      ) : (
        <div className="preview-placeholder">
          {loading ? 'Rendering preview…' : 'Generate a short preview before converting'}
        </div>
      )}
      {isMaximized && previewSrc && (
        <PreviewLightbox
          src={previewSrc}
          alt="Output preview"
          label={`Output preview · ${format.toUpperCase()}`}
          onClose={() => setIsMaximized(false)}
        />
      )}
    </section>
  );
}
