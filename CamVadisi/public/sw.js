/*
 * Cam Vadisi service worker.
 *
 * Masadaki QR'da menu misafirin TEK menusudur; zayif sebeke veya sunucu kesintisinde
 * bile bir sey gormeli. Ucuncu emniyet katmani (digerleri: menu-snapshot.json ve
 * boyut butcesi).
 *
 * Strateji:
 *  - /api/menu       -> stale-while-revalidate: aninda cache'ten ver, arkada tazele
 *  - /uploads, statik -> cache-first: gorsel ve font iki kez indirilmez
 *  - gezinme (HTML)   -> network-first, cache'e dus
 */

const VERSION = 'v1';
const STATIC_CACHE = `cv-static-${VERSION}`;
const MENU_CACHE = `cv-menu-${VERSION}`;
const IMAGE_CACHE = `cv-img-${VERSION}`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(['/', '/index.html'])).catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => ![STATIC_CACHE, MENU_CACHE, IMAGE_CACHE].includes(key))
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname === '/api/menu') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
  // Yonetim API'si asla onbelleklenmez.
  if (url.pathname.startsWith('/api/')) return;

  if (url.pathname.startsWith('/uploads/')) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }
  event.respondWith(cacheFirst(request, STATIC_CACHE));
});

async function staleWhileRevalidate(request) {
  const cache = await caches.open(MENU_CACHE);
  const cached = await cache.match(request);

  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  if (cached) {
    // Cevrimdisi oldugumuzu istemciye bildir: menuye __offline bayragi ekle.
    return cached.clone().json().then(
      (data) => new Response(JSON.stringify({ ...data, __offline: !navigator.onLine }), {
        headers: { 'content-type': 'application/json' },
      }),
      () => cached,
    );
  }
  const response = await network;
  if (response) return response;
  return new Response(JSON.stringify({ error: 'offline' }), {
    status: 503,
    headers: { 'content-type': 'application/json' },
  });
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return cached ?? Response.error();
  }
}

async function networkFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request)) ?? (await cache.match('/index.html')) ?? Response.error();
  }
}
