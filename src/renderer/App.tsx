import { DEFAULT_SETTINGS } from '../../shared/types';
import { ExportSummary } from './components/ExportSummary';
import { LandingExperience } from './components/LandingExperience';
import { LiquidGlassPanel } from './components/LiquidGlassPanel';
import { FormatPicker, QualityPanel } from './components/SettingsPanels';
import { SettingsPreview } from './components/SettingsPreview';
import { TitleBar } from './components/TitleBar';
import { OutputPathPicker } from './components/OutputPathPicker';
import { ProgressBar } from './components/ProgressBar';
import { ResultPanel } from './components/ResultPanel';
import { VideoDropZone } from './components/VideoDropZone';
import { VideoPreview } from './components/VideoPreview';
import { useConverter } from './hooks/useConverter';
import cliploomMark from './assets/cliploom-mark.svg';

export function App() {
  const {
    video,
    settings,
    phase,
    progress,
    result,
    error,
    loadVideo,
    pickVideo,
    pickOutputDir,
    updateSettings,
    convert,
    resetSettings,
    reset,
  } = useConverter(DEFAULT_SETTINGS);

  const isConverting = phase === 'converting';
  const canConvert = Boolean(video) && settings.formats.length > 0 && !isConverting;

  return (
    <div className="app">
      <TitleBar />

      <main className="workspace">
        {phase === 'done' && result ? (
          <ResultPanel
            outputs={result.outputs}
            onShowInFolder={(path) => window.api.showInFolder(path)}
            onReset={reset}
          />
        ) : !video ? (
          <LandingExperience>
            <LiquidGlassPanel className="welcome-panel">
              <div className="welcome-copy">
                <div className="welcome-brand" aria-label="Cliploom">
                  <img className="welcome-logo" src={cliploomMark} alt="" aria-hidden="true" />
                  <span>Cliploom</span>
                </div>
                <span className="eyebrow">Animated media, made simple</span>
                <h1>Turn any recording into a polished, shareable animation.</h1>
                <p>
                  Trim, preview, and export lightweight GIF or WebP files with precise
                  control over quality.
                </p>
              </div>
              <VideoDropZone
                video={video}
                disabled={isConverting}
                onBrowse={pickVideo}
                onFileDrop={loadVideo}
              />
              <div className="feature-row" aria-label="Supported features">
                <span><i className="feature-check">✓</i> Private &amp; local</span>
                <span><i className="feature-check">✓</i> Precise trimming</span>
                <span><i className="feature-check">✓</i> GIF &amp; WebP</span>
              </div>
            </LiquidGlassPanel>
          </LandingExperience>
        ) : (
          <div className="workspace-split">
            <section className="stage">
              <div className="stage-heading">
                <div>
                  <span className="eyebrow">Workspace</span>
                  <h1>Prepare your animation</h1>
                </div>
                <VideoDropZone
                  video={video}
                  disabled={isConverting}
                  onBrowse={pickVideo}
                  onFileDrop={loadVideo}
                  compact
                />
              </div>
              <VideoPreview
                video={video}
                startTime={settings.startTime}
                endTime={settings.endTime}
                disabled={isConverting}
                onTrimChange={(start, end) => updateSettings({ startTime: start, endTime: end })}
              />
              <SettingsPreview
                videoPath={video.filePath}
                settings={settings}
                videoDuration={video.duration}
                disabled={isConverting}
              />
            </section>

            <aside className="sidebar">
              <div className="sidebar-heading">
                <div>
                  <span className="eyebrow">Output</span>
                  <h2>Export settings</h2>
                </div>
                <button
                  type="button"
                  className="btn-text"
                  onClick={resetSettings}
                  disabled={isConverting}
                  title="Restore recommended settings"
                >
                  Reset
                </button>
              </div>

              <div className="sidebar-scroll">
                <FormatPicker
                  formats={settings.formats}
                  disabled={isConverting}
                  onChange={(formats) => updateSettings({ formats })}
                />

                <QualityPanel
                  settings={settings}
                  disabled={isConverting}
                  onChange={updateSettings}
                />

                <OutputPathPicker
                  outputDir={settings.outputDir}
                  disabled={isConverting}
                  onPick={pickOutputDir}
                />

                <ExportSummary video={video} settings={settings} />
              </div>

              <div className="export-actions">
                {isConverting && progress && <ProgressBar progress={progress} />}
                {error && <p className="error-banner">{error}</p>}

                <button
                  type="button"
                  className="btn-primary btn-convert"
                  onClick={convert}
                  disabled={!canConvert}
                >
                  <span>{isConverting ? 'Converting…' : `Export ${settings.formats.map((f) => f.toUpperCase()).join(' + ')}`}</span>
                  {!isConverting && <span aria-hidden="true">→</span>}
                </button>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
