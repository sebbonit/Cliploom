import { app } from 'electron';
import path from 'path';

export function resolvePackedBinary(binaryPath: string): string {
  if (!app.isPackaged) return binaryPath;

  if (binaryPath.includes('app.asar')) {
    return binaryPath.replace('app.asar', 'app.asar.unpacked');
  }

  return binaryPath;
}

export function rendererHtmlPath(mainDirname: string): string {
  return path.join(mainDirname, '../../dist/renderer/index.html');
}
