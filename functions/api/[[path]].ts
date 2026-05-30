import { json, error, corsHeaders } from '../_shared/response';
import {
  clearSessionCookie,
  createSessionCookie,
  exchangeGoogleCode,
  getGoogleRedirectUri,
  getSession,
  googleAuthUrl,
  isAdminEmail,
  requireAdmin,
} from '../_shared/auth';
import { checkRateLimit, getClientIp } from '../_shared/rateLimit';
import { verifyTurnstile } from '../_shared/turnstile';
import { findVerified, galleryToApi, verifiedToApi, type GalleryRow, type VerifiedRow } from '../_shared/db';
import { copyUrlToR2, isAlreadyOnCdn } from '../_shared/cdnMigrate';

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const origin = request.headers.get('Origin') ?? url.origin;
  const path = url.pathname.replace(/^\/api\/?/, '').replace(/\/$/, '');
  const segments = path ? path.split('/') : [];

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  try {
    const response = await route(request, env, url, segments);
    const headers = new Headers(response.headers);
    Object.entries(corsHeaders(origin)).forEach(([k, v]) => headers.set(k, v));
    return new Response(response.body, { status: response.status, headers });
  } catch (e) {
    console.error(e);
    return error('Internal server error', 500);
  }
};

async function route(request: Request, env: Env, url: URL, segments: string[]): Promise<Response> {
  const method = request.method;

  // Auth
  if (segments[0] === 'auth') {
    if (segments[1] === 'google' && method === 'GET') {
      const popup = url.searchParams.get('popup') === '1';
      const mode = url.searchParams.get('mode');
      const authUrl = googleAuthUrl(env, url.origin, popup);
      if (mode === 'url') {
        return json({ authUrl }, 200, { 'Content-Type': 'application/json' });
      }
      if (popup) {
        return new Response(googlePopupRedirectHtml(authUrl), {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }
      return Response.redirect(authUrl, 302);
    }
    if (segments[1] === 'callback' && method === 'GET') {
      return handleAuthCallback(request, env, url);
    }
    if (segments[1] === 'logout' && method === 'POST') {
      return json({ ok: true }, 200, { 'Set-Cookie': clearSessionCookie() });
    }
    if (segments[1] === 'me' && method === 'GET') {
      const session = await getSession(request, env);
      if (!session) return json({ user: null });
      return json({
        user: {
          email: session.email,
          name: session.name,
          picture: session.picture,
          isAdmin: isAdminEmail(session.email, env),
        },
      });
    }
  }

  // Gallery (public read)
  if (segments[0] === 'gallery') {
    if (segments.length === 1 && method === 'GET') {
      return listGallery(env, url);
    }
    if (segments.length === 2 && method === 'GET') {
      const row = await env.DB.prepare('SELECT * FROM gallery WHERE id = ?').bind(segments[1]).first<GalleryRow>();
      if (!row) return error('Not found', 404);
      return json(galleryToApi(row));
    }
    const admin = await requireAdmin(request, env);
    if (admin instanceof Response) return admin;
    if (segments.length === 1 && method === 'POST') {
      return createGallery(request, env);
    }
    if (segments.length === 2 && method === 'PUT') {
      return updateGallery(request, env, segments[1]);
    }
    if (segments.length === 2 && method === 'DELETE') {
      await env.DB.prepare('DELETE FROM gallery WHERE id = ?').bind(segments[1]).run();
      return json({ ok: true });
    }
  }

  // Verify (public, rate limited + turnstile)
  if (segments[0] === 'verify' && method === 'POST') {
    return verifyArtwork(request, env);
  }

  // Verified artworks (public read with rate limit)
  if (segments[0] === 'verified') {
    if (segments.length === 2 && method === 'GET') {
      const ip = getClientIp(request);
      const limit = await checkRateLimit(env.DB, ip, 'verified-read');
      if (!limit.allowed) {
        return error(`Too many requests. Retry in ${limit.retryAfter}s`, 429);
      }
      const row = await findVerified(env.DB, segments[1]);
      if (!row) return error('Not found', 404);
      return json(verifiedToApi(row));
    }
    const admin = await requireAdmin(request, env);
    if (admin instanceof Response) return admin;
    if (segments.length === 1 && method === 'GET') {
      const rows = await env.DB.prepare('SELECT * FROM verified_artworks ORDER BY updated_at DESC').all<VerifiedRow>();
      return json((rows.results ?? []).map(verifiedToApi));
    }
    if (segments.length === 1 && method === 'POST') {
      return createVerified(request, env);
    }
    if (segments.length === 2 && method === 'PUT') {
      return updateVerified(request, env, segments[1]);
    }
    if (segments.length === 2 && method === 'DELETE') {
      await env.DB.prepare('DELETE FROM verified_artworks WHERE id = ?').bind(segments[1]).run();
      return json({ ok: true });
    }
  }

  // Admin utilities
  if (segments[0] === 'admin') {
    const admin = await requireAdmin(request, env);
    if (admin instanceof Response) return admin;
    if (segments[1] === 'migrate-media' && method === 'POST') {
      return migrateMedia(request, env);
    }
  }

  return error('Not found', 404);
}

async function migrateMedia(request: Request, env: Env): Promise<Response> {
  const body = (await request.json().catch(() => ({}))) as {
    scope?: 'gallery' | 'verified';
    cursor?: string | null;
    limit?: number;
  };

  const scope = body.scope ?? 'gallery';
  const limit = Math.min(Math.max(body.limit ?? 10, 1), 25);
  const cursor = body.cursor ?? null;
  const cdnBase = (env.CDN_BASE ?? 'https://cdn.loys.art').replace(/\/$/, '');

  const results: Array<{ id: string; field: string; from: string; to?: string; error?: string; skipped?: boolean }> = [];
  let nextCursor: string | null = null;

  if (scope === 'gallery') {
    const rows = await env.DB.prepare(
      `SELECT id, image_url FROM gallery WHERE id > ? ORDER BY id ASC LIMIT ?`
    )
      .bind(cursor ?? '', limit)
      .all<{ id: string; image_url: string }>();

    for (const row of rows.results ?? []) {
      try {
        const from = row.image_url ?? '';
        if (!from || isAlreadyOnCdn(from, cdnBase)) {
          results.push({ id: row.id, field: 'imageUrl', from, skipped: true });
          nextCursor = row.id;
          continue;
        }
        const uploaded = await copyUrlToR2({
          srcUrl: from,
          keyBase: `gallery/${row.id}`,
          cdnBase,
          bucket: env.CDN,
        });
        if (!uploaded.skipped) {
          await env.DB.prepare('UPDATE gallery SET image_url = ?, updated_at = ? WHERE id = ?')
            .bind(uploaded.url, new Date().toISOString(), row.id)
            .run();
        }
        results.push({ id: row.id, field: 'imageUrl', from, to: uploaded.url, skipped: uploaded.skipped });
      } catch (e) {
        results.push({ id: row.id, field: 'imageUrl', from: row.image_url, error: e instanceof Error ? e.message : String(e) });
      } finally {
        nextCursor = row.id;
      }
    }
  } else {
    const rows = await env.DB.prepare(
      `SELECT id, artwork_id, image_url, reference_url, timelapse_url, process_images FROM verified_artworks WHERE artwork_id > ? ORDER BY artwork_id ASC LIMIT ?`
    )
      .bind(cursor ?? '', limit)
      .all<{
        id: string;
        artwork_id: string;
        image_url: string;
        reference_url: string | null;
        timelapse_url: string | null;
        process_images: string | null;
      }>();

    for (const row of rows.results ?? []) {
      const artworkId = row.artwork_id;
      const now = new Date().toISOString();

      const handleField = async (field: string, current: string | null, keyBase: string, updateSql: string) => {
        const from = current ?? '';
        if (!from || isAlreadyOnCdn(from, cdnBase)) {
          results.push({ id: artworkId, field, from, skipped: true });
          return from;
        }
        const uploaded = await copyUrlToR2({ srcUrl: from, keyBase, cdnBase, bucket: env.CDN });
        if (!uploaded.skipped) {
          await env.DB.prepare(updateSql).bind(uploaded.url, now, row.id).run();
        }
        results.push({ id: artworkId, field, from, to: uploaded.url, skipped: uploaded.skipped });
        return uploaded.url;
      };

      try {
        await handleField(
          'imageUrl',
          row.image_url,
          `certificate/Main Images/${artworkId}`,
          'UPDATE verified_artworks SET image_url = ?, updated_at = ? WHERE id = ?'
        );
      } catch (e) {
        results.push({ id: artworkId, field: 'imageUrl', from: row.image_url, error: e instanceof Error ? e.message : String(e) });
      }

      try {
        if (row.reference_url) {
          await handleField(
            'referenceUrl',
            row.reference_url,
            `certificate/References/${artworkId}`,
            'UPDATE verified_artworks SET reference_url = ?, updated_at = ? WHERE id = ?'
          );
        }
      } catch (e) {
        results.push({ id: artworkId, field: 'referenceUrl', from: row.reference_url ?? '', error: e instanceof Error ? e.message : String(e) });
      }

      try {
        if (row.timelapse_url) {
          // Keep YouTube as-is; only migrate direct video URLs
          await handleField(
            'timelapseUrl',
            row.timelapse_url,
            `certificate/Videos/${artworkId}`,
            'UPDATE verified_artworks SET timelapse_url = ?, updated_at = ? WHERE id = ?'
          );
        }
      } catch (e) {
        results.push({ id: artworkId, field: 'timelapseUrl', from: row.timelapse_url ?? '', error: e instanceof Error ? e.message : String(e) });
      }

      try {
        if (row.process_images) {
          const parts = row.process_images.split(';').map((s) => s.trim()).filter(Boolean);
          const migrated: string[] = [];
          for (let i = 0; i < parts.length; i++) {
            const from = parts[i];
            if (isAlreadyOnCdn(from, cdnBase)) {
              migrated.push(from);
              results.push({ id: artworkId, field: `processImages[${i}]`, from, skipped: true });
              continue;
            }
            const uploaded = await copyUrlToR2({
              srcUrl: from,
              keyBase: `certificate/Main Images/Process/${artworkId}-${String(i + 1).padStart(2, '0')}`,
              cdnBase,
              bucket: env.CDN,
            });
            migrated.push(uploaded.url);
            results.push({ id: artworkId, field: `processImages[${i}]`, from, to: uploaded.url, skipped: uploaded.skipped });
          }
          const joined = migrated.join(';');
          if (joined !== row.process_images) {
            await env.DB.prepare('UPDATE verified_artworks SET process_images = ?, updated_at = ? WHERE id = ?')
              .bind(joined, now, row.id)
              .run();
          }
        }
      } catch (e) {
        results.push({ id: artworkId, field: 'processImages', from: row.process_images ?? '', error: e instanceof Error ? e.message : String(e) });
      } finally {
        nextCursor = artworkId;
      }
    }
  }

  return json({ ok: true, scope, nextCursor, results });
}

async function handleAuthCallback(request: Request, env: Env, url: URL): Promise<Response> {
  const code = url.searchParams.get('code');
  const stateRaw = url.searchParams.get('state');
  if (!code || !stateRaw) return error('Missing OAuth parameters', 400);

  let popup = false;
  let redirectUri = getGoogleRedirectUri(env, url.origin);
  try {
    const state = JSON.parse(atob(stateRaw)) as { popup?: boolean; redirectUri?: string };
    popup = !!state.popup;
    if (state.redirectUri) redirectUri = state.redirectUri;
  } catch {
    /* use defaults */
  }

  const profile = await exchangeGoogleCode(code, redirectUri, env);
  if (!isAdminEmail(profile.email, env)) {
    const html = popup
      ? authPopupHtml('error', 'This Google account is not authorized for admin access.')
      : authRedirectHtml('/admin?error=unauthorized');
    return new Response(html, { status: 403, headers: { 'Content-Type': 'text/html' } });
  }

  const cookie = await createSessionCookie(profile, env, request);
  if (popup) {
    return new Response(authPopupHtml('success'), {
      headers: { 'Content-Type': 'text/html', 'Set-Cookie': cookie },
    });
  }
  return new Response(null, {
    status: 302,
    headers: {
      Location: `${url.origin}/admin`,
      'Set-Cookie': cookie,
    },
  });
}

function authPopupHtml(status: 'success' | 'error', message?: string): string {
  const payload = status === 'success' ? { type: 'loys-auth-success' } : { type: 'loys-auth-error', message };
  return `<!DOCTYPE html><html><body><script>
    if (window.opener) window.opener.postMessage(${JSON.stringify(payload)}, window.location.origin);
    window.close();
  </script><p>${message ?? 'Signed in. You can close this window.'}</p></body></html>`;
}

function authRedirectHtml(path: string): string {
  return `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${path}"></head><body><a href="${path}">Continue</a></body></html>`;
}

function googlePopupRedirectHtml(url: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Signing in with Google...</title></head><body>
    <p style="font-family: sans-serif; color:#444; text-align:center; margin-top:3rem;">Redirecting to Google sign-in…</p>
    <script>window.location.href = ${JSON.stringify(url)};</script>
    <p style="font-family: sans-serif; color:#888; text-align:center; margin-top:1rem;">If you are not redirected, <a href=${JSON.stringify(url)}>click here</a>.</p>
  </body></html>`;
}

async function listGallery(env: Env, url: URL): Promise<Response> {
  const category = url.searchParams.get('category');
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '12', 10), 50);
  const cursor = url.searchParams.get('cursor');

  let sql = 'SELECT * FROM gallery';
  const binds: (string | number)[] = [];

  if (category && category !== 'All') {
    sql += ' WHERE category = ?';
    binds.push(category);
  }

  if (cursor) {
    const [orderStr, id] = cursor.split(':');
    const order = parseInt(orderStr, 10);
    if (category && category !== 'All') {
      sql += ' AND (display_order > ? OR (display_order = ? AND id > ?))';
      binds.push(order, order, id);
    } else {
      sql += (sql.includes('WHERE') ? ' AND' : ' WHERE') + ' (display_order > ? OR (display_order = ? AND id > ?))';
      binds.push(order, order, id);
    }
  }

  sql += ' ORDER BY display_order ASC, id ASC LIMIT ?';
  binds.push(limit + 1);

  const rows = await env.DB.prepare(sql).bind(...binds).all<GalleryRow>();
  const results = rows.results ?? [];
  const hasMore = results.length > limit;
  const items = (hasMore ? results.slice(0, limit) : results).map(galleryToApi);
  const last = items[items.length - 1];
  const nextCursor = hasMore && last ? `${last.order}:${last.id}` : null;

  return json({ items, nextCursor, hasMore });
}

async function createGallery(request: Request, env: Env): Promise<Response> {
  const body = (await request.json()) as Record<string, unknown>;
  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 20);
  const now = new Date().toISOString();
  const maxOrder = await env.DB.prepare('SELECT MAX(display_order) as m FROM gallery').first<{ m: number }>();
  const order = typeof body.order === 'number' ? body.order : (maxOrder?.m ?? 0) + 1;

  await env.DB.prepare(
    `INSERT INTO gallery (id, title, category, image_url, display_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(id, body.title, body.category, body.imageUrl, order, now, now)
    .run();

  const row = await env.DB.prepare('SELECT * FROM gallery WHERE id = ?').bind(id).first<GalleryRow>();
  return json(galleryToApi(row!), 201);
}

async function updateGallery(request: Request, env: Env, id: string): Promise<Response> {
  const body = (await request.json()) as Record<string, unknown>;
  const now = new Date().toISOString();
  await env.DB.prepare(
    `UPDATE gallery SET title = ?, category = ?, image_url = ?, display_order = COALESCE(?, display_order), updated_at = ? WHERE id = ?`
  )
    .bind(body.title, body.category, body.imageUrl, body.order ?? null, now, id)
    .run();
  const row = await env.DB.prepare('SELECT * FROM gallery WHERE id = ?').bind(id).first<GalleryRow>();
  if (!row) return error('Not found', 404);
  return json(galleryToApi(row));
}

async function verifyArtwork(request: Request, env: Env): Promise<Response> {
  const ip = getClientIp(request);
  const limit = await checkRateLimit(env.DB, ip, 'verify');
  if (!limit.allowed) {
    return error(`Too many requests. Retry in ${limit.retryAfter}s`, 429);
  }

  const body = (await request.json()) as { artworkId?: string; turnstileToken?: string };
  if (!body.artworkId?.trim()) return error('artworkId is required', 400);

  const turnstileOk = await verifyTurnstile(body.turnstileToken ?? '', env.TURNSTILE_SECRET_KEY, ip);
  if (!turnstileOk) return error('Turnstile verification failed', 403);

  const row = await findVerified(env.DB, body.artworkId.trim());
  if (!row) return json({ found: false }, 404);
  return json({ found: true, artwork: verifiedToApi(row) });
}

async function createVerified(request: Request, env: Env): Promise<Response> {
  const body = (await request.json()) as Record<string, string>;
  const id = body.artworkId;
  if (!id) return error('artworkId is required', 400);
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO verified_artworks (
      id, artwork_id, title, image_url, artist, creation_date, commissioner, status,
      character_name, commission_type, medium, resolution, aspect_ratio,
      unique_commission, one_of_one, commercial_rights, reproduction_limit,
      original_owner, transferable, process_images, timelapse_url, reference_url, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id, id, body.title, body.imageUrl, body.artist ?? 'Loys', body.creationDate, body.commissioner, body.status,
      body.characterName ?? null, body.commissionType ?? null, body.medium ?? null, body.resolution ?? null, body.aspectRatio ?? null,
      body.uniqueCommission ?? null, body.oneOfOne ?? null, body.commercialRights ?? null, body.reproductionLimit ?? null,
      body.originalOwner ?? body.commissioner, body.transferable ?? null, body.processImages ?? '', body.timelapseUrl ?? null, body.referenceUrl ?? null, now
    )
    .run();
  const row = await findVerified(env.DB, id);
  return json(verifiedToApi(row!), 201);
}

async function updateVerified(request: Request, env: Env, id: string): Promise<Response> {
  const body = (await request.json()) as Record<string, string>;
  const now = new Date().toISOString();
  await env.DB.prepare(
    `UPDATE verified_artworks SET
      title = ?, image_url = ?, artist = ?, creation_date = ?, commissioner = ?, status = ?,
      character_name = ?, commission_type = ?, medium = ?, resolution = ?, aspect_ratio = ?,
      unique_commission = ?, one_of_one = ?, commercial_rights = ?, reproduction_limit = ?,
      original_owner = ?, transferable = ?, process_images = ?, timelapse_url = ?, reference_url = ?, updated_at = ?
     WHERE id = ?`
  )
    .bind(
      body.title, body.imageUrl, body.artist ?? 'Loys', body.creationDate, body.commissioner, body.status,
      body.characterName ?? null, body.commissionType ?? null, body.medium ?? null, body.resolution ?? null, body.aspectRatio ?? null,
      body.uniqueCommission ?? null, body.oneOfOne ?? null, body.commercialRights ?? null, body.reproductionLimit ?? null,
      body.originalOwner ?? null, body.transferable ?? null, body.processImages ?? '', body.timelapseUrl ?? null, body.referenceUrl ?? null, now, id
    )
    .run();
  const row = await findVerified(env.DB, id);
  if (!row) return error('Not found', 404);
  return json(verifiedToApi(row));
}
