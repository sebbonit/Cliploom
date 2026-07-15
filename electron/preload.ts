import { contextBridge, ipcRenderer } from 'electron';
import type {
  ConversionProgress,
  ConversionRequest,
  ConversionResponse,
  MediaSrcPayload,
  PreviewRequest,
  PreviewResponse,
  VideoMetadata,
} from '../shared/types.js';

contextBridge.exposeInMainWorld('api', {
  selectVideo: (): Promise<string | null> => ipcRenderer.invoke('file:select-video'),
  selectOutputDir: (): Promise<string | null> => ipcRenderer.invoke('file:select-output-dir'),
  probeVideo: (filePath: string): Promise<VideoMetadata> =>
    ipcRenderer.invoke('video:probe', filePath),
  convert: (request: ConversionRequest): Promise<ConversionResponse> =>
    ipcRenderer.invoke('video:convert', request),
  getMediaSrc: (filePath: string): Promise<MediaSrcPayload> =>
    ipcRenderer.invoke('media:src', filePath),
  getThumbnail: (filePath: string, width?: number): Promise<MediaSrcPayload> =>
    ipcRenderer.invoke('video:thumbnail', filePath, width),
  generatePreview: (request: PreviewRequest): Promise<PreviewResponse> =>
    ipcRenderer.invoke('video:preview', request),
  showInFolder: (filePath: string): Promise<void> =>
    ipcRenderer.invoke('shell:show-in-folder', filePath),
  onProgress: (callback: (progress: ConversionProgress) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, progress: ConversionProgress) => {
      callback(progress);
    };
    ipcRenderer.on('conversion:progress', handler);
    return () => ipcRenderer.removeListener('conversion:progress', handler);
  },
});
