<template>
  <component v-bind:is="component" :item="item"></component>
</template>

<script>
export default {
  name: "Widget",
  props: {
    item: Object,
  },
  computed: {
    component() {
      return () => import(`./widgets/${this.item.type}.vue`);
    },
  },
}
</script>
