const version="v1::",cacheName="v1::restaurants",assets=["/","/js/dbhelper.js","/js/main.js","/js/restaurant_info.js","/js/idb.js","/img/1.jpg","/img/2.jpg","/img/3.jpg","/img/4.jpg","/img/5.jpg","/img/6.jpg","/img/7.jpg","/img/8.jpg","/img/9.jpg","/img/10.jpg","img/place-holder.jpg","img/logo.svg","img/favicon.ico","img/icons-192.png","img/icons-512.png","/manifest.json","/webfonts/fa-regular-400.eot","/webfonts/fa-solid-900.eot"];self.addEventListener("install",e=>{e.waitUntil(caches.open(cacheName).then(e=>(console.log("adding caches to "+cacheName),e.addAll(assets))).catch(e=>console.log(e)))}),self.addEventListener("activate",e=>{e.waitUntil(self.clients.claim())}),self.addEventListener("fetch",e=>{e.respondWith(fetch(e.request).then(s=>{let t=s.clone();return caches.open(cacheName).then(s=>s.put(e.request,t)).catch(e=>console.log(e)),s}).catch(()=>caches.match(e.request).then(e=>e)))});