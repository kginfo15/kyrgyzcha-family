/*
 * DeafBridge KG Service Worker
 * - アプリ本体と定型文音声をキャッシュし、電波が弱くても返答ボタンが使えるようにする
 * - /api/* は絶対にキャッシュしない（音声データ・認識結果を端末に残さない）
 */
const VERSION = "v1";
const CACHE = `deafbridge-${VERSION}`;
const PRECACHE = ["/", "/manifest.webmanifest", "/audio/manifest.json", "/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(PRECACHE))
      .then(async () => {
        // 事前生成された定型文音声もまとめてキャッシュ
        try {
          const res = await fetch("/audio/manifest.json", { cache: "no-cache" });
          const m = await res.json();
          const urls = [];
          for (const lang of Object.keys(m)) for (const id of m[lang]) urls.push(`/audio/${lang}/${id}.mp3`);
          const c = await caches.open(CACHE);
          await c.addAll(urls);
        } catch {
          /* 音声がなくても動作する */
        }
      })
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  // ページ本体: ネットワーク優先、失敗したらキャッシュ
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put("/", copy));
          return res;
        })
        .catch(() => caches.match("/").then((r) => r || Response.error())),
    );
    return;
  }

  // ビルド成果物・音声・アイコン: キャッシュ優先
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/audio/") ||
    /\.(png|svg|ico|webmanifest)$/.test(url.pathname)
  ) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
          }),
      ),
    );
  }
});
