// Service worker for weather.html: opens instantly and works offline.
// The page itself is fetched network-first (so updates show up right away);
// icons, fonts and the map library are cache-first (map tiles are not kept). Live data (weather, news)
// is not cached here: the page keeps its own copy of the last data.
const VERSION = "kg-info-v2";
const SHELL = ["weather.html", "weather-manifest.webmanifest", "weather-icon-180.png", "weather-icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const isPage = url.origin === location.origin && url.pathname.endsWith("/weather.html");
  if (isPage) {
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone(); caches.open(VERSION).then(c => c.put("weather.html", copy)); return res;
    }).catch(() => caches.match("weather.html")));
    return;
  }
  const staticAsset = url.origin === location.origin ||
    /fonts\.(googleapis|gstatic)\.com$|cdnjs\.cloudflare\.com$/.test(url.hostname);
  if (staticAsset) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      // only keep real successes: an opaque response could be a hidden error
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    })));
  }
});
