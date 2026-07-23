<template>
  <h2 :class="group.class">
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
  name: "GroupHeader",
  props: {
    group: {
      type: Object,
      required: true,
    },
  },
};
</script>
