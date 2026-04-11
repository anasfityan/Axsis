// موادي Service Worker - Network First Strategy
const CACHE_NAME = 'mawadi-cache';

// On install: skip waiting so new SW activates immediately
self.addEventListener('install', () => {
  self.skipWaiting();
});

// On activate: delete ALL old caches so stale content is gone
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
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
        .catch(() => caches.match(e.request))
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
        }).catch(() => new Response('', { status: 404 }));
      })
    );
  }
});
