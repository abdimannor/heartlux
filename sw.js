const CACHE_NAME = 'heartlux-v1';
const APP_SHELL = [
  './',
  './index.html',
  './404.html',
  './css/style.css',
  './js/main.js',
  './manifest.webmanifest',
  './robots.txt',
  './sitemap.xml',
  './images/icon.svg',
  './images/maskable-icon.svg',
  './images/heartlux-preview.svg',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
      .catch(() => {
        if (event.request.mode === 'navigate') return caches.match('./index.html');
        return caches.match(event.request);
      })
  );
});
