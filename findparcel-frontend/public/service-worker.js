/* =====================================================
   FINDPARCEL SERVICE WORKER
   ===================================================== */

const CACHE_NAME = "findparcel-v2";

const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json",

  // FindParcel PWA icons
  "/findparcel-icon-192.png",
  "/findparcel-icon-512.png",

  // FindParcel browser favicon
  "/favicon.ico",
];


/* =====================================================
   INSTALL
   ===================================================== */

self.addEventListener("install", (event) => {
  console.log(
    "FindParcel service worker installing..."
  );

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );

  /*
   * Activate the new service worker
   * immediately.
   */
  self.skipWaiting();
});


/* =====================================================
   ACTIVATE
   ===================================================== */

self.addEventListener("activate", (event) => {
  console.log(
    "FindParcel service worker activated..."
  );

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(
            (cacheName) =>
              cacheName !== CACHE_NAME
          )
          .map((cacheName) => {
            console.log(
              "Deleting old cache:",
              cacheName
            );

            return caches.delete(cacheName);
          })
      );
    })
  );

  /*
   * Take control of all open pages
   * immediately.
   */
  self.clients.claim();
});


/* =====================================================
   FETCH
   ===================================================== */

self.addEventListener("fetch", (event) => {
  const request = event.request;

  /*
   * Only handle GET requests.
   */
  if (request.method !== "GET") {
    return;
  }


  /*
   * Don't cache API requests.
   *
   * Shipment/customer/notification data
   * must continue coming from the backend.
   */
  if (
    request.url.includes("/api/")
  ) {
    return;
  }


  event.respondWith(
    fetch(request)
      .then((response) => {

        /*
         * Save successful responses
         * in the cache.
         */
        if (
          response &&
          response.status === 200 &&
          response.type === "basic"
        ) {
          const responseClone =
            response.clone();

          caches.open(CACHE_NAME).then(
            (cache) => {
              cache.put(
                request,
                responseClone
              );
            }
          );
        }

        return response;
      })

      .catch(() => {

        /*
         * If the internet is unavailable,
         * try the cached version.
         */
        return caches.match(request);
      })
  );
});