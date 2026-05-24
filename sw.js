const CACHE = 'groceryai-v3';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('api.groq.com')) return;
  if (e.request.url.includes('cdn.tailwindcss')) return;
  e.respondWith(
    caches.open(CACHE).then(c =>
      c.match(e.request).then(cached => {
        const net = fetch(e.request).then(r => {
          if (r && r.status === 200) c.put(e.request, r.clone());
          return r;
        }).catch(() => cached);
        return cached || net;
      })
    )
  );
});
