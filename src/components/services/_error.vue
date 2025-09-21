<template>
  <Generic :item="item" :title="error.message" class="component-error">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">Failed to load component</p>
    </template>
    <template #indicator>⚠️</template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Error",
  mixins: [service],
  props: {
    item: Object,
    error: Object,
  },
};
</script>
