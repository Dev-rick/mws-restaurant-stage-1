
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open('restaurant-static-v1').then(function(cache) {
      return cache.match(event.request).then(function (response) {
        return response || fetch(event.request).then(function(response) {
          if (response.status === 404) {
            return fetch('/img/404error.gif');
          }
          cache.put(event.request, response.clone());
          return response;
        }).catch(function() {
          return new Response('Oh, the servers are down...');
        });
      });
    })
  );
});

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('restaurant-static-v1').then(function(cache) {
      return cache.addAll([
        '/',
        'min_js/combobox.js',
        'min_css/styles.css',
        'min_css/responsive.css'
      ]);
    })
  );
});


self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('restaurant-');
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});
