self.addEventListener('install', event => {
    event.waitUntil(
        caches
            .open('homer')
            .then(cache =>
                cache.addAll([
                    '.',
                    'index.html',
                    'config.yml',
                    'app.css',
                    'app.js',
                    'vendors/vue.min.js',
                    'vendors/js-yaml.min.js',
                    'vendors/font-awesone.min.css',
                    'vendors/bulma.min.css',
                    'assets/logo.png',
                    'webfonts/raleway/raleway-v14-latin-regular.woff',
                    'webfonts/raleway/raleway-v14-latin-regular.woff2',
                    'webfonts/lato/lato-v16-latin-regular.woff',
                    'webfonts/lato/lato-v16-latin-regular.woff2',
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
