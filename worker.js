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
                    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css',
                    'https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.5/css/bulma.min.css',
                    'https://fonts.googleapis.com/css?family=Lato|Raleway&display=swap',
                    'https://cdn.jsdelivr.net/npm/vue@2.6.10/dist/vue.min.js',
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
