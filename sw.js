/* PULSE service worker
 * - Precaches the app shell so PULSE opens with no internet.
 * - Page loads: network first (you get updates when online), cache as fallback.
 *   The network request is cancelled after 4 seconds so a weak connection
 *   doesn't leave a blank screen.
 * - Other files (icons, manifest): cache first, refreshed quietly in the background.
 * - Only successful, same-origin responses are ever saved to the cache.
 * - Never touches your transactions: those live in LocalStorage, not in this cache.
 *
 * When you change any file of the app, bump CACHE_NAME (pulse-v1 -> pulse-v2)
 * so old copies are cleaned up.
 */
const CACHE_NAME = "pulse-v2";
const INDEX_URL = new URL("./index.html", self.registration.scope).href;
const NETWORK_TIMEOUT_MS = 4000;
const PRECACHE = [
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith("pulse-") && k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // only handle our own files

  if (req.mode === "navigate") {
    event.respondWith(networkFirst(req));
  } else {
    event.respondWith(cacheFirst(event, req));
  }
});

// Network request that is really cancelled (not just ignored) after the timeout.
function fetchWithTimeout(req) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), NETWORK_TIMEOUT_MS);
  return fetch(req, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

// Cache only a normal, successful (200), same-origin, non-redirected response.
function isCacheable(res) {
  return !!res && res.ok && res.status === 200 && res.type === "basic" && !res.redirected;
}

async function networkFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const res = await fetchWithTimeout(req);
    if (isCacheable(res)) cache.put(INDEX_URL, res.clone()).catch(() => {});
    return res;
  } catch (err) {
    return (await cache.match(INDEX_URL)) || Response.error();
  }
}

async function cacheFirst(event, req) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(req);
  const refresh = fetchWithTimeout(req)
    .then((res) => { if (isCacheable(res)) cache.put(req, res.clone()).catch(() => {}); return res; })
    .catch(() => null);
  if (cached) { event.waitUntil(refresh); return cached; }
  return (await refresh) || Response.error();
}
