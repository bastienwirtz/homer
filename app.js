const app = new Vue({
    el: '#app',
    data: {
        config: null,
        offline: false,
        filter: '',
    },
    created: function () {
        let that = this;

        this.checkOffline();
        that.getConfig().then(function (config) {
            that.config = config;
        }).catch(function () {
            that.offline = true;
        });

        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState == "visible") {
                that.checkOffline();
            }
        }, false);
    },
    methods: {
        checkOffline: function () {
            let that = this;
            return fetch(window.location.href + "?alive", {
                method: 'HEAD',
                cache: 'no-store'
            }).then(function () {
                that.offline = false;
            }).catch(function () {
                that.offline = true;
            });
        },
        getConfig: function (event) {
            return fetch('config.yml').then(function (response) {
                if (response.status != 200) {
                    return
                }
                return response.text().then(function (body) {
                    return jsyaml.load(body);
                });
            });
        },
    }
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/worker.js');
    });
}
