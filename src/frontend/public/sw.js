const CACHE_NAME = 'tcalculator-v4-networkfirst-html';

// Precache the app shell using paths relative to the service worker's own
// scope — this makes it work correctly whether hosted at a domain root or
// under a GitHub Pages subfolder like /T-calculator/.
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
];

// Install: pre-cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .catch(() => {
        // If a precache asset 404s (e.g. during local dev), don't block
        // install — the fetch handler will still cache things as they load.
      })
  );
});

// Let the page tell us when the user has confirmed the update prompt.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch strategy:
//  - HTML navigations (loading the page itself): network-first. This is
//    the actual fix for "old version still shows after a new deploy" —
//    the cached index.html used to win every time, and it points at the
//    OLD hashed JS/CSS bundle URLs from the previous build. Network-first
//    means a fresh deploy is visible immediately; falls back to cache only
//    when there's no connection (keeps offline support).
//  - Everything else (hashed JS/CSS/images, and the AI+ cross-origin API
//    call which is skipped entirely): unchanged stale-while-revalidate.
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  const isNavigation =
    request.mode === 'navigate' ||
    (request.headers.get('accept') || '').includes('text/html');

  if (isNavigation) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request)),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});
