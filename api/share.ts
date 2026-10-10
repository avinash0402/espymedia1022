import type { IncomingMessage, ServerResponse } from 'node:http';

interface SeoPage {
  path: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  canonicalUrl?: string;
  noindex?: boolean;
}

interface SiteSettings {
  siteName?: string;
  siteDescription?: string;
  defaultMetaTitle?: string;
  defaultMetaDescription?: string;
  defaultOgImage?: string;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    res.statusCode = 405;
    res.end('Method not allowed');
    return;
  }

  const apiBase = process.env.VITE_API_BASE_URL?.replace(/\/+$/, '');
  if (!apiBase) {
    res.statusCode = 503;
    res.end('SEO metadata API is not configured');
    return;
  }

  try {
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const origin = `${req.headers['x-forwarded-proto'] || 'https'}://${host || 'espymediaagency.in'}`;
    const requestUrl = new URL(req.url || '/', origin);
    const path = normalizePath(requestUrl.searchParams.get('path') || '/');
    const [settingsResponse, pagesResponse] = await Promise.all([
      fetch(`${apiBase}/settings`, { cache: 'no-store' }),
      fetch(`${apiBase}/cms/seo`, { cache: 'no-store' }),
    ]);

    if (!settingsResponse.ok || !pagesResponse.ok) {
      throw new Error(`Metadata API returned ${settingsResponse.status}/${pagesResponse.status}`);
    }

    const [settings, pages] = await Promise.all([
      settingsResponse.json() as Promise<SiteSettings>,
      pagesResponse.json() as Promise<SeoPage[]>,
    ]);
    const page = pages.find((entry) => normalizePath(entry.path) === path);
    const defaultPage = pages.find((entry) => normalizePath(entry.path) === '/');
    const pageMetadata = page || defaultPage;
    const title = pageMetadata?.metaTitle || settings.defaultMetaTitle || settings.siteName || 'Espy Media';
    const description = pageMetadata?.metaDescription || settings.defaultMetaDescription || settings.siteDescription || '';
    const ogTitle = pageMetadata?.ogTitle || title;
    const ogDescription = pageMetadata?.ogDescription || description;
    const imageOrigin = new URL(apiBase).origin;
    const rawImage = pageMetadata?.ogImage || settings.defaultOgImage || '';
    const imageBase = /^\/?uploads\//i.test(rawImage) ? imageOrigin : origin;
    const ogImage = absoluteHttpUrl(rawImage, imageBase);
    const canonicalPath = path === '/' ? '/' : path;
    const canonicalUrl = pageMetadata?.canonicalUrl
      ? absoluteHttpUrl(pageMetadata.canonicalUrl, origin)
      : new URL(canonicalPath, origin).href;
    const twitterTitle = pageMetadata?.twitterTitle || ogTitle;
    const twitterDescription = pageMetadata?.twitterDescription || ogDescription;
    const robots = pageMetadata?.noindex ? 'noindex, nofollow' : 'index, follow';

    const metadata = [
      `<title>${escapeHtml(title)}</title>`,
      `<meta name="description" content="${escapeHtml(description)}">`,
      `<meta name="robots" content="${robots}">`,
      `<meta name="keywords" content="${escapeHtml(pageMetadata?.metaKeywords || '')}">`,
      '<meta property="og:type" content="website">',
      `<meta property="og:title" content="${escapeHtml(ogTitle)}">`,
      `<meta property="og:description" content="${escapeHtml(ogDescription)}">`,
      `<meta property="og:url" content="${escapeHtml(canonicalUrl)}">`,
      ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}">` : '',
      ogImage ? `<meta property="og:image:alt" content="${escapeHtml(ogTitle)}">` : '',
      '<meta name="twitter:card" content="summary_large_image">',
      `<meta name="twitter:title" content="${escapeHtml(twitterTitle)}">`,
      `<meta name="twitter:description" content="${escapeHtml(twitterDescription)}">`,
      ogImage ? `<meta name="twitter:image" content="${escapeHtml(ogImage)}">` : '',
      `<link rel="canonical" href="${escapeHtml(canonicalUrl)}">`,
    ].filter(Boolean).join('\n    ');

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">${metadata}</head><body><a href="${escapeHtml(canonicalUrl)}">${escapeHtml(title)}</a></body></html>`;
    res.end(req.method === 'HEAD' ? undefined : html);
  } catch (error) {
    console.error('[share-metadata]', error);
    res.statusCode = 502;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Could not load social sharing metadata');
  }
}

function normalizePath(path: string) {
  const pathname = `/${path.split(/[?#]/, 1)[0].split('/').filter(Boolean).join('/')}`;
  return pathname === '/' ? pathname : pathname.replace(/\/+$/, '');
}

function absoluteHttpUrl(value: string, base: string) {
  if (!value) return '';
  try {
    const url = new URL(value, base);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] || character);
}
