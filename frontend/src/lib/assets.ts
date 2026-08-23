import { api } from '../services/api';

export function getAssetUrl(url?: string): string | undefined {
  if (!url) {
    return undefined;
  }

  if (/^(https?:|blob:|data:)/i.test(url)) {
    return url;
  }

  const normalizedUrl = url.replace(/\\/g, '/').trim();
  const configuredBase = String(api.defaults.baseURL ?? '');
  const backendBase = configuredBase.replace(/\/api\/?$/, '').replace(/\/$/, '');

  if (normalizedUrl.startsWith('/')) {
    return `${backendBase}${normalizedUrl}` || normalizedUrl;
  }

  if (normalizedUrl.startsWith('uploads/')) {
    const path = `/${normalizedUrl}`;
    return `${backendBase}${path}` || path;
  }

  const uploadPath = `/uploads/${normalizedUrl}`;
  return `${backendBase}${uploadPath}` || uploadPath;
}
