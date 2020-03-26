var router = new VueRouter({
    mode: 'history',
    routes: []
});

const app = new Vue({
    router,
    el: '#app',
    data: {
        config: null,
        offline: false,
        filter: '',
        vlayout: true,
        isDark: null,
        showMenu: false
    },
    created: async function () {
        let that = this;

        this.isDark = 'overrideDark' in localStorage ?
            JSON.parse(localStorage.overrideDark) : matchMedia("(prefers-color-scheme: dark)").matches;

        if ('vlayout' in localStorage) {
            this.vlayout = JSON.parse(localStorage.vlayout)
        }

        this.checkOffline();
        try {
            this.config =  await this.getConfig();
            document.title = this.config.title + ' | Homer';
        } catch (error) {
            this.offline = true;
        }

        // Check if golinks is activated and query parameter "q" exists and then analyze and redirect to external page
        if (this.config.golinks && this.$route.query.q) {
            this.redirectGolink(this.$route.query.q);
        }

        // Look for a new message if an endpoint is provided.
        if (this.config.message && this.config.message.url) {
            this.getMessage(this.config.message.url).then(function(message){
                // keep the original config value if no value is provided by the endpoint
                for (const prop of ['title','style','content']) {
                    if (prop in message && message[prop] !== null) {
                        that.config.message[prop] = message[prop];
                    }    
                }
            });
        }

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
        getMessage: function (url) {
            return fetch(url).then(function (response) {
                if (response.status != 200) {
                    return;
                }
                return response.json();
            });
        },
        toggleTheme: function() {
            this.isDark = !this.isDark;
            localStorage.overrideDark = this.isDark; 
        }, 
        toggleLayout: function() {
            this.vlayout = !this.vlayout;
            localStorage.vlayout = this.vlayout;
        },
        toggleMenu: function() {
            this.showMenu = !this.showMenu;
        },
        redirectGolink: function (parameter) {
            console.log("Query Parameter: " + parameter);

            prefix = parameter.split(" ", 1)[0]
            if (prefix) {
                console.log("Prefix: " + prefix);
                golink = this.config.golinks.services.find(x => x.prefix === prefix);

                if (golink) {
                    console.log("Golink Pre-URL: " + golink.url);
                    phrase = parameter.substring(parameter.indexOf(" ") + 1);

                    if (phrase) {
                        console.log("Phrase: " + phrase);
                        redirectUrl = golink.url.replace("%s", phrase)
                        console.log("Golink Redirect-URL: " + redirectUrl);
    
                    } else {
                        console.log("Invalid Phrase");
                    }
                } else {
                    redirectUrl = this.config.golinks.default.replace("%s", parameter);
                    console.log("Golink not configured; using default: " + redirectUrl);
                }
                
            } else {
                console.log("Invalid Prefix");
            }

            if (redirectUrl) {
                window.location.href = redirectUrl;
            }
        }
    },
    mounted() {
        function isSmallScreen() {
            return window.matchMedia('screen and (max-width: 1023px)').matches;
        }
        this._keyListener = function(e) {
            if (e.key === '/') {
                if (isSmallScreen()) {
                    this.showMenu = true;
                }
                Vue.nextTick(() => {
                    this.$refs.search.focus();
                });

                e.preventDefault();
            }
            if (e.key === 'Escape') {
                this.filter = '';
                this.$refs.search.blur();
                if (isSmallScreen()) {
                    this.showMenu = false;
                }
            }
        }

        document.addEventListener('keydown', this._keyListener.bind(this));
    },
    beforeDestroy() {
        document.removeEventListener('keydown', this._keyListener);
    }
});

Vue.component('service', {
    props: ['item'],
    template: `<div>
    <div class="card">
        <a :href="item.url" :target="item.target">
            <div class="card-content">
                <div class="media">
                    <div v-if="item.logo" class="media-left">
                        <figure class="image is-48x48">
                            <img :src="item.logo" />
                        </figure>
                    </div>
                    <div v-if="item.icon" class="media-left">
                        <figure class="image is-48x48">
                            <i style="font-size: 35px" :class="item.icon"></i>
                        </figure>
                    </div>
                    <div class="media-content">
                        <p class="title is-4">{{ item.name }}</p>
                        <p class="subtitle is-6">{{ item.subtitle }}</p>
                    </div>
                </div>
                <div class="tag" :class="item.tagstyle" v-if="item.tag">
                    <strong class="tag-text">#{{ item.tag }}</strong>
                </div>
            </div>
        </a>
    </div></div>`
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('worker.js');
    });
}
