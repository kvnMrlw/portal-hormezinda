import { api } from '../services/api';

export function getAssetUrl(url?: string): string | undefined {
  if (!url || url.startsWith('http') || url.startsWith('blob:')) {
    return url;
  }

  const baseUrl = String(api.defaults.baseURL ?? '').replace(/\/api\/?$/, '');

  return `${baseUrl}${url}`;
}
