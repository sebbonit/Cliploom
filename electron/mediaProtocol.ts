import { net, protocol } from 'electron';
import { pathToFileURL } from 'url';

const MEDIA_SCHEME = 'media';

export function registerMediaScheme(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: MEDIA_SCHEME,
      privileges: {
        standard: true,
        secure: true,
        bypassCSP: true,
        supportFetchAPI: true,
        corsEnabled: true,
        stream: true,
      },
    },
  ]);
}

export function registerMediaProtocol(): void {
  protocol.handle(MEDIA_SCHEME, (request) => {
    const fileUrl = request.url.replace(/^media:/, 'file:');
    return net.fetch(fileUrl);
  });
}

export function toMediaUrl(filePath: string): string {
  return pathToFileURL(filePath).href.replace(/^file:/, 'media:');
}
