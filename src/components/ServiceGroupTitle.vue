<template>
  <h2 v-if="group.name" class="group-title">
    <i v-if="group.icon" :class="['fa-fw', group.icon]"></i>
    <div v-else-if="group.logo" class="group-logo media-left">
      <figure class="image is-48x48">
        <img :src="group.logo" :alt="`${group.name} logo`" />
      </figure>
    </div>
    {{ group.name }}
  </h2>
</template>

<script>
export default {
  name: "ServiceGroupTitle",
  props: {
    group: { type: Object, required: true },
  },
};
</script>
