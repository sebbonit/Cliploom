import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import path from 'path';
import { readFile, stat } from 'fs/promises';
import { getEncodingOptions } from '../shared/presets.js';
import { resolveTrimRange } from '../shared/trim.js';
import type { ConversionRequest, MediaSrcPayload, PreviewRequest } from '../shared/types.js';
import { convertVideo } from './converter.js';
import { probeVideo } from './ffmpeg.js';
import {
  getMimeType,
  isVideoFile,
  MAX_BLOB_VIDEO_BYTES,
} from './mediaFile.js';
import { registerMediaProtocol, registerMediaScheme, toMediaUrl } from './mediaProtocol.js';
import { extractThumbnail, generatePreviewClip } from './preview.js';
import { rendererHtmlPath } from './paths.js';

registerMediaScheme();

async function buildMediaSrc(filePath: string): Promise<MediaSrcPayload> {
  const fileStat = await stat(filePath);
  const useStreamingUrl = isVideoFile(filePath) && fileStat.size > MAX_BLOB_VIDEO_BYTES;

  if (useStreamingUrl) {
    return { kind: 'url', url: toMediaUrl(filePath) };
  }

  const data = await readFile(filePath);
  return {
    kind: 'blob',
    mimeType: getMimeType(filePath),
    data: new Uint8Array(data),
  };
}

const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 980,
    height: 680,
    minWidth: 800,
    minHeight: 560,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 14, y: 12 },
    backgroundColor: '#090a0f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(rendererHtmlPath(__dirname));
  }
}

ipcMain.handle('file:select-video', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Video', extensions: ['mov', 'mp4', 'm4v', 'mkv', 'avi', 'webm'] },
    ],
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('file:select-output-dir', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory'],
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('video:probe', async (_event, filePath: string) => {
  const [metadata, fileStat] = await Promise.all([
    probeVideo(filePath),
    stat(filePath),
  ]);
  const videoStream = metadata.streams.find((s) => s.codec_type === 'video');

  return {
    fileName: path.basename(filePath),
    filePath,
    duration: metadata.format.duration ?? 0,
    width: videoStream?.width,
    height: videoStream?.height,
    size: fileStat.size,
  };
});

ipcMain.handle('media:src', async (_event, filePath: string) => {
  return buildMediaSrc(filePath);
});

ipcMain.handle('video:thumbnail', async (_event, filePath: string, width?: number) => {
  const thumbPath = await extractThumbnail(filePath, app.getPath('temp'), width);
  return buildMediaSrc(thumbPath);
});

ipcMain.handle('video:preview', async (_event, request: PreviewRequest) => {
  const previewPath = await generatePreviewClip(
    request.inputPath,
    app.getPath('temp'),
    request.settings,
    request.format,
    request.durationSeconds ?? 2.5,
  );
  return {
    path: previewPath,
    format: request.format,
  };
});

ipcMain.handle('video:convert', async (event, request: ConversionRequest) => {
  const { inputPath, settings } = request;
  const outputDir = settings.outputDir || path.dirname(inputPath);
  const baseName = path.parse(inputPath).name;
  const encoding = getEncodingOptions(settings);
  const metadata = await probeVideo(inputPath);
  const videoDuration = metadata.format.duration ?? 0;
  const trim = resolveTrimRange(settings.startTime, settings.endTime, videoDuration);

  const sendProgress = (stage: string, percent: number) => {
    event.sender.send('conversion:progress', { stage, percent });
  };

  const results = await convertVideo(
    inputPath,
    outputDir,
    baseName,
    settings.formats,
    encoding,
    trim,
    videoDuration,
    sendProgress,
  );

  const outputs = await Promise.all(
    results.map(async (result) => {
      const fileStat = await stat(result.outputPath);
      return {
        format: result.format,
        path: result.outputPath,
        size: fileStat.size,
      };
    }),
  );

  return { outputs };
});

ipcMain.handle('shell:show-in-folder', async (_event, filePath: string) => {
  shell.showItemInFolder(filePath);
});

app.whenReady().then(() => {
  registerMediaProtocol();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
