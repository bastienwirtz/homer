<template>
  <component
    v-bind:is="component"
    :item="item"
    :proxy="proxy"
    :forwarder="forwarder"
  ></component>
</template>

<script>
import Generic from "./services/Generic.vue";

export default {
  name: "Service",
  props: {
    item: Object,
    proxy: Object,
    forwarder: Object,
  },
  computed: {
    component() {
      const type = this.item.type || "Generic";
      if (type === "Generic") {
        return Generic;
      }
      return () => import(`./services/${type}.vue`);
    },
  },
};
</script>
