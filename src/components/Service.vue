<template>
  <component v-bind:is="component" :item="item" :proxy="proxy"></component>
</template>

<script>
import Generic from "./services/Generic.vue";

export default {
  name: "Service",
  props: {
    item: Object,
    proxy: Object,
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
