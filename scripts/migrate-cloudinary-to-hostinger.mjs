import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const applyChanges = process.argv.includes('--apply');
const apiBase = process.env.HOSTINGER_API_BASE?.replace(/\/+$/, '');
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryKey = process.env.CLOUDINARY_API_KEY;
const cloudinarySecret = process.env.CLOUDINARY_API_SECRET;
const adminEmail = process.env.HOSTINGER_ADMIN_EMAIL;
const adminPassword = process.env.HOSTINGER_ADMIN_PASSWORD;
const manifestPath = path.resolve(
  process.env.CLOUDINARY_MIGRATION_MAP || '.cloudinary-hostinger-migration.json',
);
const uploadLimit = 10 * 1024 * 1024;

if (!apiBase || !cloudName || !cloudinaryKey || !cloudinarySecret) {
  throw new Error(
    'Set HOSTINGER_API_BASE and CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
  );
}
if (new URL(apiBase).protocol !== 'https:') {
  throw new Error('HOSTINGER_API_BASE must use HTTPS.');
}
if (applyChanges && (!adminEmail || !adminPassword)) {
  throw new Error(
    'HOSTINGER_ADMIN_EMAIL and HOSTINGER_ADMIN_PASSWORD are required with --apply.',
  );
}

const manifest = await readManifest();
const cookie = applyChanges ? await loginToHostinger() : '';
const apiRequest = (resourcePath, options = {}) =>
  hostingerRequest(resourcePath, options, cookie);

const sourceData = await readImageReferences();
const cloudinaryAssets = await listCloudinaryImages();

const bytesToCopy = cloudinaryAssets.reduce((total, asset) => total + asset.bytes, 0);
console.log(`Cloudinary image assets: ${cloudinaryAssets.length}`);
console.log(`Unique image URLs referenced by Hostinger content: ${sourceData.imageUrls.size}`);
console.log(`Total Cloudinary asset size: ${formatBytes(bytesToCopy)}`);
console.log(`Image fields/records to update: ${sourceData.recordCount}`);
console.log(applyChanges ? 'Mode: COPY AND UPDATE' : 'Mode: PREVIEW ONLY (no files or database rows will change)');

if (!applyChanges) {
  console.log(`\nAfter reviewing this plan, re-run with --apply. Mapping file: ${manifestPath}`);
  process.exit(0);
}

const urlMap = new Map(Object.entries(manifest.urls));
let copiedCount = 0;
let alreadyCopied = 0;

for (const asset of cloudinaryAssets) {
  if (!asset.secure_url) {
    throw new Error(`Cloudinary asset ${asset.public_id} has no secure URL.`);
  }
  if (urlMap.has(asset.secure_url)) {
    alreadyCopied++;
    continue;
  }
  const mappedUrl = await uploadUrl(asset.secure_url, asset.public_id);
  urlMap.set(asset.secure_url, mappedUrl);
  manifest.assets[asset.asset_id] = {
    publicId: asset.public_id,
    sourceUrl: asset.secure_url,
    targetUrl: mappedUrl,
  };
  manifest.urls[asset.secure_url] = mappedUrl;
  await saveManifest();
  copiedCount++;
  console.log(`Copied ${copiedCount}/${cloudinaryAssets.length}: ${asset.public_id}`);
}

for (const sourceUrl of sourceData.imageUrls) {
  if (urlMap.has(sourceUrl)) continue;
  const mappedUrl = await uploadUrl(sourceUrl, 'referenced-cloudinary-image');
  urlMap.set(sourceUrl, mappedUrl);
  manifest.urls[sourceUrl] = mappedUrl;
  await saveManifest();
  copiedCount++;
  console.log(`Copied referenced image ${copiedCount}: ${new URL(sourceUrl).pathname.split('/').pop()}`);
}

let updatedRecords = 0;
for (const record of sourceData.records) {
  const changes = {};
  for (const field of record.urlFields) {
    const replacement = urlMap.get(record.row[field]);
    if (replacement) changes[field] = replacement;
  }
  for (const field of record.galleryFields) {
    const gallery = record.row[field];
    if (!Array.isArray(gallery)) continue;
    const replacement = gallery.map((item) => urlMap.get(item) || item);
    if (replacement.some((item, index) => item !== gallery[index])) {
      changes[field] = replacement;
    }
  }
  if (Object.keys(changes).length === 0) continue;
  await apiRequest(record.patchPath, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changes),
  });
  updatedRecords++;
  console.log(`Updated ${record.label}`);
}

manifest.completedAt = new Date().toISOString();
manifest.databaseRecordsUpdated = updatedRecords;
await saveManifest();
console.log(
  `\nMigration finished. New images copied: ${copiedCount}; already copied: ${alreadyCopied}; database records updated: ${updatedRecords}.`,
);
console.log(`Keep Cloudinary active until you verify the site. Local mapping: ${manifestPath}`);

async function readManifest() {
  try {
    const parsed = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
    if (parsed.cloudName !== cloudName) {
      throw new Error('Mapping file belongs to a different Cloudinary account. Set CLOUDINARY_MIGRATION_MAP to a new file.');
    }
    if (parsed.apiBase && parsed.apiBase !== apiBase) {
      throw new Error('Mapping file belongs to a different Hostinger API. Set CLOUDINARY_MIGRATION_MAP to a new file.');
    }
    return {
      cloudName,
      apiBase,
      assets: parsed.assets || {},
      urls: parsed.urls || {},
    };
  } catch (error) {
    if (error.code === 'ENOENT') return { cloudName, apiBase, assets: {}, urls: {} };
    throw error;
  }
}

async function saveManifest() {
  const temporaryPath = `${manifestPath}.tmp`;
  await fs.writeFile(temporaryPath, `${JSON.stringify(manifest, null, 2)}\n`, {
    mode: 0o600,
  });
  await fs.rename(temporaryPath, manifestPath);
}

async function loginToHostinger() {
  const response = await fetch(`${apiBase}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  });
  const data = await readJsonResponse(response, 'Hostinger login');
  const cookies = response.headers.getSetCookie?.() || [response.headers.get('set-cookie') || ''];
  const sessionCookie = cookies
    .flatMap((header) => header.split(/,(?=\s*PHPSESSID=)/))
    .map((header) => header.match(/(?:^|;\s*)PHPSESSID=([^;]+)/)?.[1])
    .find(Boolean);
  if (!sessionCookie) {
    throw new Error('Hostinger login succeeded but the API did not return a PHP session cookie.');
  }
  console.log(`Authenticated to Hostinger as ${data.user?.email || adminEmail}.`);
  return `PHPSESSID=${sessionCookie}`;
}

async function hostingerRequest(resourcePath, options = {}, sessionCookie = '') {
  const headers = new Headers(options.headers);
  if (sessionCookie) headers.set('Cookie', sessionCookie);
  const response = await fetch(`${apiBase}${resourcePath}`, {
    ...options,
    headers,
  });
  return readJsonResponse(response, `Hostinger ${options.method || 'GET'} ${resourcePath}`);
}

async function readJsonResponse(response, label) {
  const body = await response.text();
  let data;
  try {
    data = body ? JSON.parse(body) : null;
  } catch {
    throw new Error(`${label} returned HTTP ${response.status} with a non-JSON response.`);
  }
  if (!response.ok) {
    const detail = typeof data?.error === 'string' ? data.error : response.statusText;
    throw new Error(`${label} failed (HTTP ${response.status}): ${detail}`);
  }
  return data;
}

async function listCloudinaryImages() {
  const assets = [];
  let cursor;
  do {
    const query = new URLSearchParams({ max_results: '500' });
    if (cursor) query.set('next_cursor', cursor);
    const url = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/resources/image/upload?${query}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${cloudinaryKey}:${cloudinarySecret}`).toString('base64')}`,
      },
    });
    const page = await readJsonResponse(response, 'Cloudinary asset listing');
    assets.push(...(page.resources || []));
    cursor = page.next_cursor;
  } while (cursor);
  return assets;
}

async function readImageReferences() {
  const records = [];
  const settings = await apiRequest('/settings');
  records.push({
    label: 'site settings',
    row: settings,
    patchPath: '/settings',
    urlFields: ['logoUrl', 'footerLogoUrl', 'faviconUrl', 'defaultOgImage', 'chatbotAvatarUrl'],
    galleryFields: [],
  });

  const collections = [
    { path: '/projects', label: 'project', urlFields: ['imageUrl'], galleryFields: ['galleryUrls'] },
    { path: '/testimonials', label: 'testimonial', urlFields: ['avatarUrl'], galleryFields: [] },
    { path: '/blog-posts', label: 'blog post', urlFields: ['coverImageUrl'], galleryFields: [] },
    { path: '/cms/platforms', label: 'platform', urlFields: ['logoUrl'], galleryFields: [] },
    { path: '/cms/graphic-works', label: 'graphic work', urlFields: ['imageUrl'], galleryFields: ['galleryUrls'] },
    { path: '/cms/seo', label: 'SEO page', urlFields: ['ogImage'], galleryFields: [] },
  ];
  for (const collection of collections) {
    const rows = await apiRequest(collection.path);
    for (const row of rows) {
      if (row.id === undefined && !row.path) continue;
      records.push({
        ...collection,
        row,
        patchPath: `${collection.path}/${encodeURIComponent(row.id ?? row.path)}`,
      });
    }
  }

  const imageUrls = new Set();
  for (const record of records) {
    for (const field of record.urlFields) {
      if (isCloudinaryUrl(record.row[field])) imageUrls.add(record.row[field]);
    }
    for (const field of record.galleryFields) {
      for (const url of record.row[field] || []) {
        if (isCloudinaryUrl(url)) imageUrls.add(url);
      }
    }
  }
  const recordsWithImages = records.filter((record) =>
    record.urlFields.some((field) => imageUrls.has(record.row[field]))
    || record.galleryFields.some((field) =>
      (record.row[field] || []).some((url) => imageUrls.has(url)),
    ),
  );
  return { records, imageUrls, recordCount: recordsWithImages.length };
}

async function uploadUrl(sourceUrl, publicId) {
  const parsedUrl = new URL(sourceUrl);
  if (!['https:', 'http:'].includes(parsedUrl.protocol) || !isCloudinaryUrl(sourceUrl)) {
    throw new Error(`Refusing to download an image from an untrusted URL: ${parsedUrl.origin}`);
  }
  parsedUrl.protocol = 'https:';
  const response = await fetch(parsedUrl);
  if (!response.ok) {
    throw new Error(`Could not download Cloudinary image ${publicId} (HTTP ${response.status}).`);
  }
  const finalUrl = new URL(response.url);
  if (!isCloudinaryUrl(finalUrl.href)) {
    throw new Error(`Cloudinary redirected ${publicId} to an untrusted host.`);
  }
  const contentType = response.headers.get('content-type')?.split(';')[0].toLowerCase() || '';
  const extension = extensionFor(contentType, parsedUrl.pathname);
  if (!extension) {
    throw new Error(`Unsupported image type "${contentType}" for ${publicId}; no database URLs have been changed yet.`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > uploadLimit) {
    throw new Error(
      `Image ${publicId} is ${formatBytes(bytes.length)}, above Hostinger's current 10 MB upload limit. No database URLs have been changed yet.`,
    );
  }
  const form = new FormData();
  form.append('file', new Blob([bytes], { type: contentType }), `cloudinary-${safeName(publicId)}.${extension}`);
  const result = await hostingerRequest('/upload', {
    method: 'POST',
    body: form,
  }, cookie);
  if (typeof result?.url !== 'string') {
    throw new Error(`Hostinger upload for ${publicId} did not return a file URL.`);
  }
  return result.url;
}

function isCloudinaryUrl(value) {
  if (typeof value !== 'string' || !value) return false;
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol)
      && (url.hostname === 'cloudinary.com' || url.hostname.endsWith('.cloudinary.com'))
      && url.pathname.split('/')[1] === cloudName;
  } catch {
    return false;
  }
}

function extensionFor(contentType, pathname) {
  const byType = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'image/x-icon': 'ico',
    'image/vnd.microsoft.icon': 'ico',
    'image/avif': 'avif',
  };
  if (byType[contentType]) return byType[contentType];
  const fromPath = path.extname(pathname).slice(1).toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico', 'avif'].includes(fromPath)
    ? fromPath
    : '';
}

function safeName(value) {
  return value.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(-48) || 'image';
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
