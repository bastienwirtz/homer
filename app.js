var app = new Vue({
    el: '#app',
    data: {
        config: null,
        filter: ''
    },
    beforeCreate() {
        let that = this;

        return getConfig().then(function (config) {
            const size = 3;
            config.services.forEach(function (service) {
                service.rows = [];
                items = service.items;
                while (items.length) {
                    service.rows.push(items.splice(0, size));
                }

                if (service.rows.length) {
                    let last = service.rows.length - 1;
                    service.rows[last] = service.rows[last].concat(Array(size - service.rows[last].length));
                }
            });
            that.config = config;
        }).catch(function () {
            console.error('Fail to get config');
        });
    }
});


function getConfig() {
    return fetch('config.yml').then(function (response) {
        if (response.status !== 200) {
            return;
        }

        return response.text().then(function (body) {
            return jsyaml.load(body);
        });
    });
}
