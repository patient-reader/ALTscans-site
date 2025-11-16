const CACHE_NAME = 'chapter-images-cache-v1';

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          console.log(`Serving image from cache: ${url}`);
          return response;
        }
        return fetch(event.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            console.log(`Image cached: ${url}`);
            return networkResponse;
          });
        });
      })
    );
  }
});
