<template>
  <component :is="component" :item="item" :proxy="proxy"></component>
</template>

<script>
import { defineAsyncComponent } from "vue";
import Generic from "./services/Generic.vue";

export default {
  name: "Service",
  props: {
    item: Object,
    proxy: Object,
  },
  computed: {
    component() {
      if (this.item.url.startsWith('/') || this.item.url.startsWith(':')) {
        let hostname = window.location.hostname;
        if (hostname.endsWith('/')) {
          hostname = hostname.slice(0, -1)
        }
        this.item.url = window.location.protocol + '//' + hostname + this.item.url
      }
      const type = this.item.type || "Generic";
      if (type === "Generic") {
        return Generic;
      }
      return defineAsyncComponent(() => import(`./services/${type}.vue`));
    },
  },
};
</script>
