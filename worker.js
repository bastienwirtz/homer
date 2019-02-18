self.addEventListener('install', event => {
    event.waitUntil(
        caches
            .open('homer')
            .then(cache =>
                cache.addAll([
                    '/',
                    '/index.html',
                    '/config.yml',
                    '/app.css',
                    '/app.js',
                    '/vendors/js-yaml.min.js',
                    '/assets/logo.png',
                    'https://use.fontawesome.com/releases/v5.5.0/css/all.css',
                    'https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.2/css/bulma.css',
                    'https://fonts.googleapis.com/css?family=Lato|Raleway',
                    'https://cdn.jsdelivr.net/npm/vue@2.6.2/dist/vue.min.js',
                ])
            )
    )
})

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                return response;
            }
            return fetch(event.request);
        })
    );
});
