const CACHE_NAME = 'heartlux-v7';
const APP_SHELL = [
  './',
  './index.html',
  './404.html',
  './css/style.css',
  './css/features.css',
  './js/app.js',
  './js/avatars.js',
  './js/dom.js',
  './js/i18n.js',
  './js/profiles.js',
  './js/pwa.js',
  './js/state.js',
  './js/timers.js',
  './js/ui/chat.js',
  './js/ui/demo.js',
  './js/ui/discover.js',
  './js/ui/language.js',
  './js/ui/matches-list.js',
  './js/ui/match-burst.js',
  './js/ui/matches.js',
  './js/ui/navigation.js',
  './js/ui/profile.js',
  './js/ui/register.js',
  './js/ui/swipe.js',
  './js/ui/theme.js',
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
