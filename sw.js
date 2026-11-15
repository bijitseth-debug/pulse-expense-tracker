/* PULSE service worker
 * - Precaches the app shell so PULSE opens with no internet.
 * - Page loads: network first (you get updates when online), cache as fallback.
 * - Other files (icons, manifest): cache first, refreshed quietly in the background.
 * - Never touches your transactions: those live in LocalStorage, not in this cache.
 *
 * When you change any file of the app, bump CACHE_NAME (pulse-v1 -> pulse-v2)
 * so old copies are cleaned up.
 */
const CACHE_NAME = "pulse-v1";
const INDEX_URL = new URL("./index.html", self.registration.scope).href;
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

async function networkFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  try {
    // give up after 4s so a weak connection doesn't leave a blank screen
    const res = await Promise.race([
      fetch(req),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 4000))
    ]);
    if (res && res.ok) cache.put(INDEX_URL, res.clone());
    return res;
  } catch (err) {
    return (await cache.match(INDEX_URL)) || Response.error();
  }
}

async function cacheFirst(event, req) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(req);
  const refresh = fetch(req)
    .then((res) => { if (res && res.ok) cache.put(req, res.clone()); return res; })
    .catch(() => null);
  if (cached) { event.waitUntil(refresh); return cached; }
  return (await refresh) || Response.error();
}
