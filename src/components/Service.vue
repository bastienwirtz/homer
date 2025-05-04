<template>
  <Generic v-if="isGeneric" :item="item"></Generic>
  <component :is="component" v-else :item="item" :proxy="proxy"></component>
</template>

<script>
import { defineAsyncComponent } from "vue";
import errorComponent from "./services/_error.vue";
const defaultService = "Generic";

export default {
  name: "Service",
  props: {
    item: Object,
    proxy: Object,
  },
  computed: {
    isGeneric() {
      return defaultService === (this.item.type || defaultService);
    },
    component() {
      return defineAsyncComponent({
        loader: () => import(`./services/${this.item.type}.vue`),
        errorComponent: errorComponent,
        timeout: 3000,
      });
    },
  },
};
</script>
