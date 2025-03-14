<template>
  <component :is="dynamicComponent" v-bind="componentProps" />
</template>

<script>
import { defineAsyncComponent } from 'vue';
import Generic from './services/Generic.vue';

export default {
  name: 'Service',
  props: {
    item: {
      type: Object,
      required: true,
    },
    proxy: {
      type: Object,
      default: null, // Make proxy optional
    },
  },
  computed: {
    /**
     * Dynamically determines and imports the appropriate component based on the item type.
     * Defaults to the Generic component if the type is not specified or not found.
     *
     * @returns {Component} - The dynamically loaded Vue component.
     */
    dynamicComponent() {
      const type = this.item.type || 'Generic';

      if (type === 'Generic') {
        return Generic;
      }

      try {
        return defineAsyncComponent(() => import(`./services/${type}.vue`));
      } catch (error) {
        console.error(`Failed to load component for type: ${type}. Falling back to Generic.`, error);
        return Generic;
      }
    },

    /**
     * Constructs the props to be passed to the dynamic component.  Uses v-bind.
     * Ensures that all necessary props are passed, including handling optional props safely.
     *
     * @returns {object} - An object containing the props for the dynamic component.
     */
    componentProps() {
      return {
        item: this.item,
        proxy: this.proxy,
      };
    },
  },
};
</script>
