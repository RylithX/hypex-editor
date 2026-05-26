const CACHE_NAME = 'hypex-offline-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/matrix.js',
  '/js/filesystem.js',
  '/js/editor.js',
  '/js/app.js',
  '/js/three.min.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.log('Cache install failed:', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request)
          .then(resp => {
            // Cache new requests dynamically
            if (!resp || resp.status !== 200 || resp.type !== 'basic') return resp;
            const respClone = resp.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, respClone));
            return resp;
          })
          .catch(() => {
            // Offline fallback for HTML pages
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
      })
  );
});
