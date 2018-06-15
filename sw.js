const version = "v1::";
const cacheName = `${version}restaurants`;

const assets = [
    '/',
    '/js/dbhelper.js',
    '/js/main.js',
    '/node_modules/idb/lib/idb.js',
    '/img/1.jpg',
    '/img/2.jpg',
    '/img/3.jpg',
    '/img/4.jpg',
    '/img/5.jpg',
    '/img/6.jpg',
    '/img/7.jpg',
    '/img/8.jpg',
    '/img/9.jpg',
    '/img/10.jpg',
    'img/place-holder.jpg',
    'img/logo.svg',
    'img/favicon.ico',
    'img/icons-192.png',
    'img/icons-512.png',
    '/manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheName)
        .then(cache => {
            console.log('adding caches to ' + cacheName);
            return cache.addAll(assets);
        })
        .catch(err => console.log(err))
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

// use assets from cache if exists or fetch them from the server add to cache and return
self.addEventListener('fetch', e => {
   e.respondWith(
       fetch(e.request).then(response => {
           let copy = response.clone();
           caches.open(cacheName)
            .then(cache => cache.put(e.request, copy))
            .catch(err => console.log(err));
           return response;
       })
       .catch(() => {
           return caches.match(e.request)
               .then(response => {
                   return response // || caches.match('/offline.html');
               })
       })
   );
});