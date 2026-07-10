const CACHE_NAME = "bookwise-v1";

const urlsToCache = [
    "/",
    "/index.html",
    "/recommendations.html",
    "/wishlist.html",
    "/profile.html",
    "/library.html",
    "/css/style.css",
    "/js/app.js",
    "/images/logo-192.png"
];

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)

        .then(cache => cache.addAll(urlsToCache))

    );

});

self.addEventListener("fetch", event => {

    event.respondWith(

        caches.match(event.request)

        .then(response => {

            return response || fetch(event.request);

        })

    );

});
