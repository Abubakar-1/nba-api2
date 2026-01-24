// Service worker for caching API responses
const CACHE_NAME = "nba-portal-cache-v1";
const API_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response) {
            const cachedTime = new Date(response.headers.get("cached-time"));
            if (Date.now() - cachedTime.getTime() < API_CACHE_DURATION) {
              return response;
            }
          }

          return fetch(event.request).then((networkResponse) => {
            const responseToCache = networkResponse.clone();
            const headers = new Headers(responseToCache.headers);
            headers.append("cached-time", new Date().toISOString());

            const cachedResponse = new Response(responseToCache.body, {
              status: responseToCache.status,
              statusText: responseToCache.statusText,
              headers: headers,
            });

            cache.put(event.request, cachedResponse);
            return networkResponse;
          });
        });
      })
    );
  }
});
