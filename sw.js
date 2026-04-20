const CACHE_NAME = 'biblia-arc-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/app.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Cache first, depois network
      return response || fetch(event.request).then(fetchResponse => {
        // Cacheia capítulos lidos para offline
        if (event.request.url.includes('.html')) {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        }
        return fetchResponse;
      });
    })
  );
});