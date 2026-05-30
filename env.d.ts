interface ImportMetaEnv {
  readonly VITE_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Env {
  DB: D1Database;
  CDN: R2Bucket;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI?: string;
  AUTH_SECRET: string;
  ADMIN_EMAILS: string;
  TURNSTILE_SECRET_KEY: string;
  CDN_BASE: string;
}
