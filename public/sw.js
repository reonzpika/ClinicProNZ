const VERSION = 'thumb-sw-v1';
const CACHE_NAME = VERSION;

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  // Only cache GET requests to the thumbnail proxy
  if (req.method !== 'GET') return;
  if (url.pathname !== '/api/images/thumb') return;

  event.respondWith(staleWhileRevalidate(req));
});

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      // Only cache successful responses
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached || new Response(null, { status: 504 }));

  // Return cached immediately if available; otherwise network
  return cached || fetchPromise;
}
