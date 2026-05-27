import { getDirectMediaUrl, isYoutubeUrl } from '../../mediaUtils';

function extFromContentType(contentType: string | null): string {
  const ct = (contentType ?? '').toLowerCase();
  if (ct.includes('image/jpeg')) return '.jpg';
  if (ct.includes('image/png')) return '.png';
  if (ct.includes('image/webp')) return '.webp';
  if (ct.includes('image/gif')) return '.gif';
  if (ct.includes('video/mp4')) return '.mp4';
  if (ct.includes('video/webm')) return '.webm';
  return '';
}

function extFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname.toLowerCase();
    const m = path.match(/\.(jpg|jpeg|png|webp|gif|mp4|webm)$/);
    if (!m) return '';
    return m[0] === '.jpeg' ? '.jpg' : m[0];
  } catch {
    return '';
  }
}

export function isAlreadyOnCdn(url: string, cdnBase: string): boolean {
  return url.startsWith(cdnBase.replace(/\/$/, '') + '/');
}

export async function copyUrlToR2(params: {
  srcUrl: string;
  keyBase: string; // without extension
  cdnBase: string;
  bucket: R2Bucket;
}): Promise<{ url: string; key: string; skipped: boolean }> {
  const src = params.srcUrl.trim();
  if (!src) return { url: src, key: '', skipped: true };
  if (isYoutubeUrl(src)) return { url: src, key: '', skipped: true };
  if (isAlreadyOnCdn(src, params.cdnBase)) return { url: src, key: '', skipped: true };

  const direct = getDirectMediaUrl(src);
  const res = await fetch(direct, { redirect: 'follow' });
  if (!res.ok || !res.body) {
    throw new Error(`Failed to fetch: ${src} (${res.status})`);
  }

  const ct = res.headers.get('content-type');
  const ext = extFromUrl(direct) || extFromContentType(ct) || '.bin';
  const key = `${params.keyBase}${ext}`;

  await params.bucket.put(key, res.body, {
    httpMetadata: {
      contentType: ct ?? undefined,
      cacheControl: 'public, max-age=31536000, immutable',
    },
  });

  const cdnBase = params.cdnBase.replace(/\/$/, '');
  return { url: `${cdnBase}/${key}`, key, skipped: false };
}

