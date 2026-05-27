const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 30;

export async function checkRateLimit(
  db: D1Database,
  ip: string,
  endpoint: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - (now % WINDOW_SECONDS);

  const row = await db
    .prepare('SELECT request_count FROM rate_limits WHERE ip = ? AND endpoint = ? AND window_start = ?')
    .bind(ip, endpoint, windowStart)
    .first<{ request_count: number }>();

  if (!row) {
    await db
      .prepare('INSERT INTO rate_limits (ip, endpoint, window_start, request_count) VALUES (?, ?, ?, 1)')
      .bind(ip, endpoint, windowStart)
      .run();
    return { allowed: true };
  }

  if (row.request_count >= MAX_REQUESTS) {
    return { allowed: false, retryAfter: WINDOW_SECONDS - (now - windowStart) };
  }

  await db
    .prepare('UPDATE rate_limits SET request_count = request_count + 1 WHERE ip = ? AND endpoint = ? AND window_start = ?')
    .bind(ip, endpoint, windowStart)
    .run();

  return { allowed: true };
}

export function getClientIp(request: Request): string {
  return request.headers.get('CF-Connecting-IP') ?? request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ?? 'unknown';
}
