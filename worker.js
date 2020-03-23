self.addEventListener('install', event => {
    event.waitUntil(
        caches
            .open('homer')
            .then(cache =>
                cache.addAll([
                    '.',
                    'index.html',
                    'app.css',
                    'app.js',
                    'vendors/vue.min.js',
                    'vendors/js-yaml.min.js',
                    'vendors/font-awesone.min.css',
                    'vendors/bulma.min.css',
                    'assets/logo.png',
                    'assets/favicon.png',
                    'webfonts/raleway/raleway-v14-latin-regular.woff',
                    'webfonts/raleway/raleway-v14-latin-regular.woff2',
                    'webfonts/lato/lato-v16-latin-regular.woff',
                    'webfonts/lato/lato-v16-latin-regular.woff2',
                    'webfonts/fa-brands-400.woff',
                    'webfonts/fa-brands-400.woff2',
                    'webfonts/fa-brands-400.svg',
                    'webfonts/fa-brands-400.ttf',
                    'webfonts/fa-brands-400.eot',
                    'webfonts/fa-regular-400.woff',
                    'webfonts/fa-regular-400.woff2',
                    'webfonts/fa-regular-400.svg',
                    'webfonts/fa-regular-400.ttf',
                    'webfonts/fa-regular-400.eot',
                    'webfonts/fa-solid-900.woff',
                    'webfonts/fa-solid-900.woff2',
                    'webfonts/fa-solid-900.svg',
                    'webfonts/fa-solid-900.ttf',
                    'webfonts/fa-solid-900.eot',
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
