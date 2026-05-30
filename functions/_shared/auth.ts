import { signSession, verifySession, type SessionPayload } from './jwt';

const SESSION_COOKIE = 'loys_session';

export function getAdminEmails(env: Env): string[] {
  return env.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
}

export function isAdminEmail(email: string, env: Env): boolean {
  return getAdminEmails(env).includes(email.toLowerCase());
}

export async function getSession(request: Request, env: Env): Promise<SessionPayload | null> {
  const cookie = request.headers.get('Cookie') ?? '';
  const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  if (!match) return null;
  return verifySession(decodeURIComponent(match[1]), env.AUTH_SECRET);
}

export function sessionCookie(token: string, request: Request): string {
  const url = new URL(request.url);
  const secure = url.protocol === 'https:';
  const parts = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=604800',
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export async function createSessionCookie(
  profile: { email: string; name?: string; picture?: string },
  env: Env,
  request: Request
): Promise<string> {
  const token = await signSession(profile, env.AUTH_SECRET);
  return sessionCookie(token, request);
}

export async function requireAdmin(request: Request, env: Env): Promise<SessionPayload | Response> {
  const session = await getSession(request, env);
  if (!session?.email) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }
  if (!isAdminEmail(session.email, env)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
  }
  return session;
}

export function getGoogleRedirectUri(env: Env, origin: string): string {
  return env.GOOGLE_REDIRECT_URI?.replace(/\/$/, '') ?? `${origin}/api/auth/callback`;
}

export function googleAuthUrl(env: Env, origin: string, popup: boolean): string {
  const redirectUri = getGoogleRedirectUri(env, origin);
  const state = btoa(JSON.stringify({ popup, redirectUri }));
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    prompt: 'select_account',
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string, redirectUri: string, env: Env): Promise<{ email: string; name?: string; picture?: string }> {
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  if (!tokenRes.ok) throw new Error('Failed to exchange Google code');
  const tokens = (await tokenRes.json()) as { access_token: string };
  const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!profileRes.ok) throw new Error('Failed to fetch Google profile');
  const profile = (await profileRes.json()) as { email: string; name?: string; picture?: string };
  if (!profile.email) throw new Error('Google account has no email');
  return profile;
}
