import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";

import "@fortawesome/fontawesome-free/css/all.css";

import "./assets/app.scss";

Vue.config.productionTip = false;

Vue.component("DynamicStyle", {
  render: function (createElement) {
    return createElement("style", this.$slots.default);
  },
});

Vue.mixin({
  methods: {
    fetchOptions(options = {}) {
      if (
        this.item &&
        this.item.fetchWithCredentials &&
        this.item.fetchWithCredentials == true
      ) {
        options.credentials = "include";
      }
      return options;
    },
  },
});

new Vue({
  render: (h) => h(App),
}).$mount("#app");
