const CACHE_NAME = 'hypex-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/matrix.js',
  '/js/filesystem.js',
  '/js/editor.js',
  '/js/app.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
