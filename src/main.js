import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";

import "@fortawesome/fontawesome-free/css/all.css";

import service from "./mixins/service.js";
import "./assets/app.scss";

Vue.config.productionTip = false;

Vue.component("DynamicStyle", {
  render: function (createElement) {
    return createElement("style", this.$slots.default);
  },
});

Vue.mixin(service);

new Vue({
  render: (h) => h(App),
}).$mount("#app");
