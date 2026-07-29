// موادي Service Worker - Network First Strategy
const CACHE_NAME = 'mawadi-cache-v2';

// On install: skip waiting so new SW activates immediately
self.addEventListener('install', () => {
  self.skipWaiting();
});

// On activate: delete ALL old caches so stale content is gone
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => {
        // Keep the current cache and avoid deleting unrelated caches.
        if (k === CACHE_NAME) return Promise.resolve();
        // Delete caches that belong to this app by prefix (safe cleanup).
        if (k && (k.startsWith('mawadi') || k.startsWith('mawadi-cache'))) return caches.delete(k);
        return Promise.resolve();
      }))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Skip non-GET and external API calls
  if (e.request.method !== 'GET') return;
  if (url.hostname.includes('googleapis.com') ||
      url.hostname.includes('accounts.google.com') ||
      url.hostname.includes('fonts.gstatic') ||
      url.hostname.includes('aksis')) return;

  // HTML, JS, JSON: always network first (no-store to bypass browser cache too)
  const isAppFile = url.pathname.endsWith('.html') ||
                    url.pathname.endsWith('.js') ||
                    url.pathname.endsWith('.json') ||
                    url.pathname === '/' ||
                    url.pathname.endsWith('/');

  if (isAppFile) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() =>
          caches.match(e.request).then(cached =>
            cached || caches.match('/').then(fallback => fallback || new Response('<h1>Offline</h1>', { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 503 }))
          )
        )
    );
  } else {
    // Fonts/images: cache first
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          }
          return res;
        }).catch(() => {
          // For images, return a tiny SVG placeholder instead of an empty 404 response.
          const accept = e.request.headers.get('accept') || '';
          if (e.request.destination === 'image' || accept.indexOf('image') !== -1) {
            const svg = '<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>';
            return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' }, status: 200 });
          }
          return caches.match('/');
        });
      })
    );
  }
});
