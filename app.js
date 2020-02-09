const app = new Vue({
    el: '#app',
    data: {
        config: null,
        offline: false,
        filter: '',
        vlayout: true,
        isDark: null
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
        } catch (error) {
            this.offline = true;
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
    updated: async function () {
        setTimeout(this.healthcheck,100);
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
        healthcheck: function() {
            
            async function loop_cards() {
                //loop cards and check if healthcheck is needed
                console.log("healthcheck is running");
                var links = document.getElementsByClassName('card');
                console.log(links.length);
                for(var i = 0; i < links.length; i++) {
                    var thisLink = links[i];
                    if (thisLink.getElementsByClassName('notif').length > 0) {
                        var url     = thisLink.getElementsByTagName('a')[0].href;
                        var name    = thisLink.getElementsByClassName('title')[0].innerHTML;
                        var type    = thisLink.getElementsByClassName('type')[0].innerHTML;
                        var rooturl = thisLink.getElementsByClassName('rooturl')[0].innerHTML;
                        var apikey  = thisLink.getElementsByClassName('apikey')[0].innerHTML;
                        if (type == 'medusa') {
                            var val = await medusa_get_health(rooturl, apikey);
                            //info has grey color in medusa
                            thisLink.getElementsByClassName('info')[0].style.backgroundColor = "#777777";
                            show_notif(val, thisLink);
                        } else if (type == 'radarr') {
                            var val = await radarr_get_health(rooturl, apikey);
                            show_notif(val, thisLink);
                        } else if (type == 'sonarr') {
                            var val = await radarr_get_health(rooturl, apikey);
                            show_notif(val, thisLink);
                        } else {
                            isSiteOnline(url,function(found){
                                if(found == false) {
                                    // site is offline (or favicon not found, or server is too slow)
                                    show_notif([0, 0, 'offline'], thisLink);
                                }
                            })
                        }
                    }
                }
            }

            async function api_load(api_url, api_key) {
                var obj;
                try {
                    obj = await fetch(api_url, {
                        headers: { 'X-Api-Key': api_key }
                    });
                }
                catch(err) {
                    console.log("api error! check url and apikey");
                    return 1;
                }
                if (obj.ok != true) {
                    return 1
                } else {
                    obj = obj.json();
                    return(obj);
                }
            }

            function isSiteOnline(url,callback) {
                // try to load favicon
                var timer = setTimeout(function(){
                    // timeout after 5 seconds
                    callback(false);
                },5000)

                var img = document.createElement("img");
                img.onload = function() {
                    clearTimeout(timer);
                    callback(true);
                }

                img.onerror = function() {
                    clearTimeout(timer);
                    callback(false);
                }

                img.src = url+"/favicon.ico";
            }


            async function medusa_get_health(medusa_rooturl, medusa_apikey) {
                //fetch medusa health

                var medusa_apiurl = medusa_rooturl.replace(/\/$/, "") + '/api/v2/config';

                config_json = await api_load(medusa_apiurl, medusa_apikey);
                if (config_json != 1) {
                    var m_news = config_json.system.news.unread;
                    var m_warnings = config_json.main.logs.numWarnings;
                    var m_errors = config_json.main.logs.numErrors;
                } else {
                    var m_news = 0;
                    var m_warnings = 0;
                    var m_errors = "api error";
                }
                return [m_news, m_warnings, m_errors]
            }

            async function radarr_get_health(radarr_rooturl, radarr_apikey) {
                //fetch radarr health (maybe can work with sonarr)

                var radarr_apiurl = radarr_rooturl.replace(/\/$/, "") + '/api/health';
                var radarr_apiurl2 = radarr_rooturl.replace(/\/$/, "") + '/api/queue';
                
                health_json = await api_load(radarr_apiurl, radarr_apikey);
                
                if (health_json != 1) {
                    //var nb = api_json.length;
                    queue_json = await api_load(radarr_apiurl2, radarr_apikey);
                    var r_activity = queue_json.length;
                    var r_warnings = 0;
                    var r_errors = 0;
                    for (var i = 0; i < health_json.length; i++) {
                        if (health_json[i].type == 'warning') {
                            r_warnings++
                            //api_json[i].message
                        } else if (health_json[i].type == 'error') {
                            r_errors++
                            //api_json[i].message
                        }
                    }
                } else {
                    var r_activity = 0;
                    var r_warnings = 0;
                    var r_errors = "api error";
                }
                return [r_activity, r_warnings, r_errors]

            }

            function show_offline(card) {
                //show offline notif
                var off_notif = card.getElementsByClassName('error');
                off_notif.style.display = "block";
            }

            function show_notif(notif_values, card) {
                //show info/warning/error notifs
                //by default are blue/orange/red
                i = notif_values[0];
                w = notif_values[1];
                e = notif_values[2];

                var i_notif = card.getElementsByClassName('info')[0];
                var w_notif = card.getElementsByClassName('warning')[0];
                var e_notif = card.getElementsByClassName('error')[0];
                
                if (i != 0) {
                    i_notif.innerHTML = i;
                    i_notif.style.display = "inline";
                }
                if (w != 0) {
                    w_notif.innerHTML = w;
                    w_notif.style.display = "inline";
                }
                if (e != 0) {  
                    e_notif.innerHTML = e;
                    e_notif.style.display = "inline";
                }
            }
            
            loop_cards();
        },
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
                <div class="notif" :class="item.healthcheck.type" v-if="item.healthcheck">
                    <span hidden class="type">{{ item.healthcheck.type }}</span>
                    <span hidden class="rooturl">{{ item.healthcheck.rooturl }}</span>
                    <span hidden class="apikey">{{ item.healthcheck.apikey }}</span>
                    <strong class="notif info">0</strong>
                    <strong class="notif warning">0</strong>
                    <strong class="notif error">0</strong>
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
