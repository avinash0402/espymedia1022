import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useGetSeoPages, useGetSettings } from '@workspace/api-client-react';

export function SeoHead() {
  const [location] = useLocation();
  const { data: settings } = useGetSettings();
  const { data: pages } = useGetSeoPages();

  // Inject / update Google Tag Manager
  useEffect(() => {
    const gtmId = settings?.gtmId?.trim();
    const GTM_SCRIPT_ID = 'gtm-head-script';
    const GTM_NOSCRIPT_ID = 'gtm-noscript';

    // Remove existing scripts first (in case GTM ID changed)
    document.getElementById(GTM_SCRIPT_ID)?.remove();
    document.getElementById(GTM_NOSCRIPT_ID)?.remove();
    // Also clean up any window.dataLayer / GTM globals to allow re-initialisation
    (window as any).__gtmInjected = undefined;

    if (gtmId) {
      // Head script
      const script = document.createElement('script');
      script.id = GTM_SCRIPT_ID;
      script.async = true;
      script.textContent = `
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`;
      document.head.appendChild(script);

      // Noscript fallback in body
      const ns = document.createElement('noscript');
      ns.id = GTM_NOSCRIPT_ID;
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
      iframe.height = '0';
      iframe.width = '0';
      iframe.style.display = 'none';
      iframe.style.visibility = 'hidden';
      ns.appendChild(iframe);
      document.body.prepend(ns);
    }
  }, [settings?.gtmId]);

  // Update page-level SEO meta tags
  useEffect(() => {
    const normalizedLocation = normalizePath(location);
    const page = pages?.find((item) => normalizePath(item.path) === normalizedLocation);
    const defaultPage = pages?.find((item) => item.path === '/');
    const pageMetadata = page || defaultPage;
    const title = pageMetadata?.metaTitle || settings?.defaultMetaTitle || settings?.siteName || 'Espy Media';
    const description = pageMetadata?.metaDescription || settings?.defaultMetaDescription || settings?.siteDescription || '';
    const rawOgImage = pageMetadata?.ogImage || settings?.defaultOgImage || '';
    let ogImage = '';
    if (rawOgImage) {
      try {
        const uploadPath = /^\/?uploads\//i.test(rawOgImage);
        const apiOrigin = import.meta.env.VITE_API_BASE_URL
          ? new URL(import.meta.env.VITE_API_BASE_URL).origin
          : window.location.origin;
        const imageUrl = new URL(rawOgImage, uploadPath ? apiOrigin : window.location.origin);
        if (imageUrl.protocol === 'http:' || imageUrl.protocol === 'https:') ogImage = imageUrl.href;
      } catch {
        ogImage = '';
      }
    }
    document.title = title;
    setMeta('description', description);
    setMeta('keywords', pageMetadata?.metaKeywords || settings?.defaultMetaKeywords || '');
    setMeta('og:title', pageMetadata?.ogTitle || title, 'property');
    setMeta('og:description', pageMetadata?.ogDescription || description, 'property');
    setMeta('og:image', ogImage, 'property');
    setMeta('og:image:alt', pageMetadata?.ogTitle || title, 'property');
    setMeta('twitter:card', 'summary_large_image', 'name');
    setMeta('twitter:title', pageMetadata?.twitterTitle || title, 'name');
    setMeta('twitter:description', pageMetadata?.twitterDescription || description, 'name');
    setMeta('twitter:image', ogImage, 'name');
    setMeta('robots', pageMetadata?.noindex ? 'noindex, nofollow' : 'index, follow');

    const configuredCanonical = page?.canonicalUrl?.trim();
    const homepageCanonical = defaultPage?.canonicalUrl?.trim();
    const canonicalOrigin = homepageCanonical
      ? new URL(homepageCanonical, window.location.origin).origin
      : window.location.origin;
    const canonicalPath = location === '/'
      ? '/'
      : `/${location.split(/[?#]/, 1)[0].split('/').filter(Boolean).join('/')}`;
    const canonicalUrl = configuredCanonical || new URL(canonicalPath, canonicalOrigin).href;
    setMeta('og:url', canonicalUrl, 'property');
    let canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrl;

    const structuredDataId = 'cms-structured-data';
    document.getElementById(structuredDataId)?.remove();
    if (pageMetadata?.structuredData && Object.keys(pageMetadata.structuredData).length > 0) {
      const script = document.createElement('script');
      script.id = structuredDataId;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(pageMetadata.structuredData);
      document.head.appendChild(script);
    }
    // Update favicon dynamically
    if (settings?.faviconUrl) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.faviconUrl;
    }
  }, [location, pages, settings]);

  return null;
}

function setMeta(name: string, content: string, attribute = 'name') {
  let meta = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, name);
    document.head.appendChild(meta);
  }
  meta.content = content;
}

function normalizePath(path: string) {
  const pathname = `/${path.split(/[?#]/, 1)[0].split('/').filter(Boolean).join('/')}`;
  return pathname === '/' ? pathname : pathname.replace(/\/+$/, '');
}
