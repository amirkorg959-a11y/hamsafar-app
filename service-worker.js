/* هم‌سفر (HamSafar) — Service Worker برای PWA اندروید
   محل ذخیره: کنار index.html، در ریشه‌ی سایت (service-worker.js).
   قواعد:
   • فقط چند فایل ثابت (آیکون‌ها، manifest، صفحه‌ی آفلاین) کش می‌شود.
   • صفحه‌ها (index.html، admin.html) و config.js همیشه از اینترنت گرفته می‌شود و کش نمی‌شود.
   • هیچ درخواستی به Supabase (API، ورود، توابع سرور)، زرین‌پال یا هر دامنه‌ی دیگری کش نمی‌شود.
   • وقتی اینترنت قطع باشد و کاربر صفحه‌ای را باز کند، offline.html نمایش داده می‌شود. */
const CACHE = 'hamsafar-v1';
const OFFLINE_URL = './offline.html';
const PRECACHE = [
  OFFLINE_URL,
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))   // حذف همه‌ی نسخه‌های قدیمی
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

const STATIC = new Set(PRECACHE.map((u) => new URL(u, self.location).pathname));

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;                                   // POST و ... هرگز
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;                    // Supabase، زرین‌پال، فونت‌ها: مستقیم، بدون کش
  if (req.headers.has('authorization')) return;                       // درخواست‌های دارای توکن کاربر

  // صفحه‌ها: همیشه از اینترنت؛ اگر قطع بود، صفحه‌ی آفلاین
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req.url, { cache: 'no-store', credentials: 'same-origin' }).catch(() => caches.match(OFFLINE_URL).then((r) => r || new Response('آفلاین', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })))
    );
    return;
  }

  // فایل‌های ثابت فهرست‌شده: اول کش، همزمان تازه‌سازی
  if (STATIC.has(url.pathname)) {
    event.respondWith(
      caches.open(CACHE).then((cache) =>
        cache.match(req).then((hit) => {
          const net = fetch(req).then((res) => {
            if (res && res.ok && res.type === 'basic') cache.put(req, res.clone());
            return res;
          }).catch(() => hit);
          return hit || net;
        })
      )
    );
  }
  // هر چیز دیگر (config.js، ... ) بدون دخالت
});
