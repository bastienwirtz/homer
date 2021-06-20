<template>
  <component v-bind:is="component" :item="domainOverride(item, domain)" v-show="!item.hidden"></component>
</template>

<script>
import Generic from "./services/Generic.vue";

export default {
  name: "Service",
  components: {
    Generic,
  },
  props: {
    item: Object,

  },
  methods: {
    domainOverride(item, domain) {
      if (item.override && item.override[domain]) {
        return Object.assign(item, item.override[domain]);
      } else {
        return item
      }
    }
  },
  computed: {
    domain() {
      return this.$parent.domain
    },
    component() {
      const type = this.item.type || "Generic";
      if (type == "Generic") {
        return Generic;
      }
      return () => import(`./services/${type}.vue`);
    },
  },
};
</script>
