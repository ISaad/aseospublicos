/* Sin cobertura: la web, los datos y la lista de cercanos siguen funcionando. */
const CACHE = 'aseos-v3';
const CORE = ['/', '/style.css', '/site.js', '/map.js', '/data/aseos.json',
  '/fonts/overpass.woff2', '/fonts/atkinson.woff2', '/aseos-emergencia-espana.html', '/icons/icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  /* HTML y datos: primero la red, para no mostrar puntos caducados. */
  const fresh = e.request.mode === 'navigate' || url.pathname.endsWith('.json');
  const save = r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; };
  if (fresh) {
    e.respondWith(fetch(e.request).then(save).catch(() => caches.match(e.request).then(r => r || caches.match('/'))));
  } else {
    e.respondWith(caches.match(e.request).then(hit => {
      const net = fetch(e.request).then(save);
      return hit ? (net.catch(() => {}), hit) : net;
    }));
  }
});
