var app = new Vue({
    el: '#app',
    data: {
        config: null,
        filter: ''
    },
    beforeCreate () {
        var that = this;
        return getConfig().then(function (config) {
            // Splice services list into groups of 3 for flex column display
            var size = 3;
            config.services.forEach(function(service) {
                service.rows = [];
                items = service.items;
                while (items.length) {
                    service.rows.push(items.splice(0, size));
                }

                if (service.rows.length) {
                    var last = service.rows.length-1;
                    service.rows[last] = service.rows[last].concat(Array(size - service.rows[last].length));
                }
            });
            that.config = config;
        });
    }
});


function getConfig() {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'config.yml');
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                try {
                    var data = jsyaml.load(xhr.response);
                    resolve(data);
                } catch (e) {
                    console.error('fail to parse config file');
                    reject();
                }
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}