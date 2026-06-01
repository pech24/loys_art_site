const CACHE_NAME = 'loys-portfolio-v5';
const STATIC_ASSETS = [
    '/',
    '/index.html'
];

const PRE_CACHE_CDN = [
    'https://ik.imagekit.io/pcd7jjipb/Home%20Files/Profile%20Pic.png',
    'https://ik.imagekit.io/pcd7jjipb/Home%20Files/Signature.png',
    'https://cdn.loys.art/common/steps/Step1.png',
    'https://cdn.loys.art/common/steps/Step2.png',
    'https://cdn.loys.art/common/steps/Step3.png',
    'https://cdn.loys.art/common/steps/Step4.png',
    'https://cdn.loys.art/common/Webm/Cover.webm',
    'https://cdn.loys.art/common/Webm/HeadPortrait.webm',
    'https://cdn.loys.art/common/Webm/Full.webm',
    'https://cdn.loys.art/common/Webm/30days.webm'
];

// Media extensions to cache
const MEDIA_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.mp4', '.webm'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('SW: Pre-caching static assets');
            const precacheLocal = cache.addAll(STATIC_ASSETS);
            const precacheExternal = Promise.all(
                PRE_CACHE_CDN.map((url) => cache.add(new Request(url, { mode: 'no-cors' })))
            );
            return Promise.all([precacheLocal, precacheExternal]);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        console.log('SW: Clearing old cache', name);
                        return caches.delete(name);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    // 1. Navigation strategy: Network-First for HTML/Links
    // This ensures your routes (/gallery, /orders, etc.) work offline using index.html
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match('/index.html') || caches.match('/');
            })
        );
        return;
    }

    // 2. Strategy: Cache-First for local static assets
    if (STATIC_ASSETS.includes(url.pathname)) {
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request);
            })
        );
        return;
    }

    // 3. Strategy: Cache-First for images and videos (including external)
    const isMedia = MEDIA_EXTENSIONS.some(ext => url.pathname.toLowerCase().endsWith(ext)) ||
        url.hostname.includes('imgur.com') ||
        url.hostname.includes('youtube.com') ||
        url.hostname.includes('ytimg.com');

    if (isMedia) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) return cachedResponse;

                return fetch(event.request).then((networkResponse) => {
                    if (!networkResponse || networkResponse.status !== 200) {
                        if (networkResponse.type === 'opaque') {
                            const responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
                        }
                        return networkResponse;
                    }

                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    return networkResponse;
                }).catch(() => {
                    return cachedResponse;
                });
            })
        );
        return;
    }

    // 4. Strategy: Network-First for everything else (App logic, API)
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
