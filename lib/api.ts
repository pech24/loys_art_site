import type { VerifiedArtwork } from '../types';

const API_BASE = '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`);
  }
  return data as T;
}

export interface AuthUser {
  email: string;
  name?: string;
  picture?: string;
  isAdmin: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const data = await request<{ user: AuthUser | null }>('/auth/me');
  return data.user;
}

export async function logout(): Promise<void> {
  await request('/auth/logout', { method: 'POST' });
}

export function loginWithGooglePopup(): Promise<void> {
  return new Promise((resolve, reject) => {
    const popup = window.open('/api/auth/google?popup=1', 'loys-google-auth', 'width=500,height=600');
    if (!popup) {
      reject(new Error('Popup blocked. Allow popups for this site.'));
      return;
    }

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'loys-auth-success') {
        cleanup();
        resolve();
      }
      if (event.data?.type === 'loys-auth-error') {
        cleanup();
        reject(new Error(event.data.message ?? 'Login failed'));
      }
    };

    const timer = window.setInterval(() => {
      if (popup.closed) {
        cleanup();
        reject(new Error('Login window closed'));
      }
    }, 500);

    const cleanup = () => {
      window.removeEventListener('message', onMessage);
      window.clearInterval(timer);
      try {
        popup.close();
      } catch {
        /* ignore */
      }
    };

    window.addEventListener('message', onMessage);
  });
}

export async function fetchGallery(params: {
  category?: string;
  limit?: number;
  cursor?: string | null;
}): Promise<{ items: GalleryItem[]; nextCursor: string | null; hasMore: boolean }> {
  const search = new URLSearchParams();
  if (params.category && params.category !== 'All') search.set('category', params.category);
  if (params.limit) search.set('limit', String(params.limit));
  if (params.cursor) search.set('cursor', params.cursor);
  const qs = search.toString();
  return request(`/gallery${qs ? `?${qs}` : ''}`);
}

export async function fetchGalleryAdmin(): Promise<GalleryItem[]> {
  const data = await fetchGallery({ category: 'All', limit: 500 });
  return data.items;
}

export async function createGalleryItem(item: Omit<GalleryItem, 'id' | 'order'> & { order?: number }): Promise<GalleryItem> {
  return request('/gallery', { method: 'POST', body: JSON.stringify(item) });
}

export async function updateGalleryItem(id: string, item: Partial<GalleryItem>): Promise<GalleryItem> {
  return request(`/gallery/${id}`, { method: 'PUT', body: JSON.stringify(item) });
}

export async function deleteGalleryItem(id: string): Promise<void> {
  await request(`/gallery/${id}`, { method: 'DELETE' });
}

export async function fetchVerifiedAdmin(): Promise<VerifiedArtwork[]> {
  return request('/verified');
}

export async function createVerifiedItem(item: VerifiedArtwork): Promise<VerifiedArtwork> {
  return request('/verified', { method: 'POST', body: JSON.stringify(item) });
}

export async function updateVerifiedItem(id: string, item: VerifiedArtwork): Promise<VerifiedArtwork> {
  return request(`/verified/${id}`, { method: 'PUT', body: JSON.stringify(item) });
}

export async function deleteVerifiedItem(id: string): Promise<void> {
  await request(`/verified/${id}`, { method: 'DELETE' });
}

export async function verifyArtwork(artworkId: string, turnstileToken: string): Promise<VerifiedArtwork | null> {
  const res = await fetch(`${API_BASE}/verify`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ artworkId, turnstileToken }),
  });
  const data = (await res.json().catch(() => ({}))) as { artwork?: VerifiedArtwork; error?: string };
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(data.error ?? `Verification failed (${res.status})`);
  return data.artwork ?? null;
}

export async function fetchVerifiedById(id: string): Promise<VerifiedArtwork | null> {
  try {
    return await request<VerifiedArtwork>(`/verified/${encodeURIComponent(id)}`);
  } catch {
    return null;
  }
}
