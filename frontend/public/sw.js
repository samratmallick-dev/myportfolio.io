const CACHE_NAME = "portfolio-shell-v5";
const OFFLINE_URL = "/offline.html";

const DEV_PREFIXES = ["/@vite", "/@react-refresh", "/@fs", "/node_modules/", "/src/"];
const isDevDocument = (html) => html.includes("/src/main.jsx") || html.includes("/@vite/client");

self.addEventListener("install", (event) => {
      event.waitUntil(
            (async () => {
                  const cache = await caches.open(CACHE_NAME);
                  await cache.add(OFFLINE_URL);

                  try {
                        const response = await fetch("/", { cache: "no-store" });
                        if (!response.ok) return;
                        const clone = response.clone();
                        const html = await response.text();
                        if (isDevDocument(html)) return;

                        await cache.put("/", clone);
                        const assets = [...new Set(html.match(/\/assets\/[^"'\s()]+?\.(?:js|css)/g) ?? [])];
                        try {
                              const manifest = await (await fetch("/sw-manifest.json", { cache: "no-store" })).json();
                              assets.push(...manifest);
                        } catch {
                        }
                        await Promise.all(
                              [...new Set(assets)].map((asset) => cache.add(asset.startsWith("assets/") ? `/${asset}` : asset))
                        );
                  } catch {
                        
                  }
            })()
      );
      self.skipWaiting();
});

self.addEventListener("activate", (event) => {
      event.waitUntil(
            (async () => {
                  const keys = await caches.keys();
                  await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
                  await self.clients.claim();
            })()
      );
});

self.addEventListener("fetch", (event) => {
      const { request } = event;
      if (request.method !== "GET") return;

      const url = new URL(request.url);
      if (url.origin !== self.location.origin) return;
      if (DEV_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) return;

      if (url.pathname.startsWith("/api/")) return;

      if (request.mode === "navigate") {
            event.respondWith(
                  (async () => {
                        try {
                              const response = await fetch(request);
                              if (response.ok) {
                                    const text = await response.clone().text();
                                    if (!isDevDocument(text)) {
                                          const cache = await caches.open(CACHE_NAME);
                                          cache.put(request, response.clone());
                                    }
                              }
                              return response;
                        } catch {
                              const cache = await caches.open(CACHE_NAME);
                              return (
                                    (await cache.match(request, { ignoreVary: true })) ??
                                    (await cache.match("/", { ignoreVary: true })) ??
                                    (await cache.match(OFFLINE_URL, { ignoreVary: true })) ??
                                    new Response("Offline", { status: 503, statusText: "Offline" })
                              );
                        }
                  })()
            );
            return;
      }

      if (!url.pathname.startsWith("/assets/")) return;

      event.respondWith(
            (async () => {
                  const cache = await caches.open(CACHE_NAME);
                  const cached = await cache.match(request, { ignoreVary: true });
                  const network = fetch(request)
                        .then((response) => {
                              if (response.ok && response.type === "basic") {
                                    cache.put(request, response.clone());
                              }
                              return response;
                        })
                        .catch(() => undefined);
                  return cached ?? (await network) ?? Response.error();
            })()
      );
});
