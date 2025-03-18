// Service Worker pour mise en cache des images
const CACHE_NAME = 'digita-cache-v1';
const CACHED_URLS = [
    'assets/img/personel/1.png',
    'assets/img/personel/2.png',
    'assets/img/personel/3.png',
    'assets/img/personel/4.png',
    'assets/img/personel/5.png',
    'assets/img/personel/6.png',
    'assets/img/personel/7.png',
    'assets/img/personel/8.png',
    'assets/img/personel/9.png',
    'assets/img/personel/10.png',
    'assets/img/personel/11.png',
    'assets/img/personel/12.png',
    'assets/img/personel/13.png',
    'assets/img/personel/14.png',
    'assets/img/personel/15.png',

];

// Installation du Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache ouvert');
                return cache.addAll(CACHED_URLS);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

// Activation du Service Worker
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        // Suppression des anciens caches
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// Interception des requêtes fetch
self.addEventListener('fetch', event => {
    // Vérifier si la requête concerne une image
    if (event.request.destination === 'image' ||
        CACHED_URLS.includes(new URL(event.request.url).pathname)) {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    // Utiliser le cache si disponible
                    if (response) {
                        return response;
                    }

                    // Sinon faire la requête réseau
                    return fetch(event.request).then(response => {
                        // Ne pas mettre en cache les réponses non valides
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Cloner la réponse car elle ne peut être utilisée qu'une fois
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    });
                })
        );
    } else {
        // Comportement par défaut pour les autres requêtes
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match(event.request);
            })
        );
    }
});

// Préchargement d'images supplémentaires
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'CACHE_IMAGES') {
        const imagesToCache = event.data.images || [];

        caches.open(CACHE_NAME)
            .then(cache => {
                return Promise.all(
                    imagesToCache.map(imageUrl => {
                        return fetch(imageUrl)
                            .then(response => {
                                if (!response || response.status !== 200) {
                                    return;
                                }
                                return cache.put(imageUrl, response);
                            })
                            .catch(error => {
                                console.error('Erreur lors du préchargement:', imageUrl, error);
                            });
                    })
                );
            });
    }
});