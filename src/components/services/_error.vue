<template>
  <Generic
    :item="item"
    :title="error.message"
    subtitle="Failed to load component"
    class="component-error"
  >
    <template #aside>⚠️</template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Error",
  mixins: [service],
  props: {
    error: Object,
  },
};
</script>
