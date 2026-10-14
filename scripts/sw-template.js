/* NorthlineGoods service worker — generated into public/sw.js by
 * scripts/generate-sw.mjs at build time (BUILD_ID changes every deploy,
 * which is what makes browsers detect a new version).
 *
 * Strategies:
 *   navigations      network-first (3s timeout when a cached copy exists),
 *                    falls back to the cached page, then /offline
 *   /_next/static/*  cache-first (content-hashed, immutable)
 *   /images, /icons  stale-while-revalidate
 *   GET /api/products|categories  network-first with cache fallback
 *   everything else  untouched (POSTs, cross-origin, Next RSC requests)
 *
 * New versions install in the background and WAIT; the page shows an
 * "update available" prompt and only then sends SKIP_WAITING.
 */
const BUILD_ID = "__BUILD_ID__";
const PREFIX = "northline";
const CACHES = {
  pages: `${PREFIX}-pages-${BUILD_ID}`,
  static: `${PREFIX}-static-${BUILD_ID}`,
  images: `${PREFIX}-images-${BUILD_ID}`,
  api: `${PREFIX}-api-${BUILD_ID}`,
};
const SHELL_URLS = ["/", "/offline", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];
const NAVIGATION_TIMEOUT_MS = 3000;

self.addEventListener("install", (event) => {
  event.waitUntil(precache());
});

async function precache() {
  const pages = await caches.open(CACHES.pages);
  await pages.addAll(SHELL_URLS);

  // Warm the hashed JS/CSS of the app shell pages (parsed from their cached
  // HTML) so they work offline right after the first visit, not only after a
  // second one. Both pages matter: "/" is the catalog, and "/offline" is what
  // an unvisited page falls back to — without its own script cached it would
  // load and then crash. Failures here must never block installation.
  try {
    const staticCache = await caches.open(CACHES.static);
    for (const route of ["/", "/offline"]) {
      const cached = await pages.match(route);
      const html = cached ? await cached.text() : "";
      const assets = Array.from(new Set(html.match(/\/_next\/static\/[^"'\s)\\]+/g) || []));
      await Promise.all(assets.map((a) => staticCache.add(a).catch(() => undefined)));
    }
  } catch (_) {}

  // Card images for the whole catalog (one small SVG per product).
  try {
    const res = await fetch("/api/products");
    const { products } = await res.json();
    const images = await caches.open(CACHES.images);
    await Promise.all(
      products.map((p) => p.images && p.images[0] ? images.add(p.images[0]).catch(() => undefined) : undefined)
    );
  } catch (_) {}
}

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set(Object.values(CACHES));
      const names = await caches.keys();
      await Promise.all(
        names.filter((n) => n.startsWith(`${PREFIX}-`) && !keep.has(n)).map((n) => caches.delete(n))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
  if (event.data && event.data.type === "GET_VERSION" && event.source) {
    event.source.postMessage({ type: "VERSION", buildId: BUILD_ID });
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.headers.get("RSC") || url.searchParams.has("_rsc")) return;

  if (request.mode === "navigate") {
    event.respondWith(navigation(request));
  } else if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, CACHES.static));
  } else if (url.pathname.startsWith("/images/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(staleWhileRevalidate(event, CACHES.images));
  } else if (url.pathname === "/api/products" || url.pathname === "/api/categories") {
    event.respondWith(networkFirst(request, CACHES.api));
  }
});

async function put(cacheName, request, response) {
  if (!response || !response.ok) return;
  const cache = await caches.open(cacheName);
  await cache.put(request, response);
}

async function navigation(request) {
  const cached = await caches.match(request, { ignoreSearch: true });
  const network = fetch(request).then((response) => {
    if (response.ok) put(CACHES.pages, request, response.clone());
    return response;
  });

  if (!cached) {
    return network.catch(async () => (await caches.match("/offline")) || Response.error());
  }
  const timeout = new Promise((resolve) => setTimeout(() => resolve(cached), NAVIGATION_TIMEOUT_MS));
  return Promise.race([network.catch(() => cached), timeout]);
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  await put(cacheName, request, response.clone());
  return response;
}

async function staleWhileRevalidate(event, cacheName) {
  const cached = await caches.match(event.request);
  const refresh = fetch(event.request)
    .then(async (response) => {
      await put(cacheName, event.request, response.clone());
      return response;
    })
    .catch(() => undefined);
  if (cached) {
    event.waitUntil(refresh);
    return cached;
  }
  return (await refresh) || Response.error();
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    await put(cacheName, request, response.clone());
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw error;
  }
}
