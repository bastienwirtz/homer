<template>
  <div
    :class="{
      'columns is-multiline': horizontal,
      'column': vertical,
      [`is-${width}`]: vertical,
    }"
  >
    <h2
      v-if="group.name"
      :class="[
        {
          'column is-full': horizontal,
        },
        'group-title',
      ]"
      style="cursor: pointer"
      v-on:click="toggle"
    >
      <i v-if="group.icon" :class="['fa-fw', group.icon]"></i>
      <div v-else-if="group.logo" class="group-logo media-left">
        <figure class="image is-48x48">
          <img :src="group.logo" :alt="`${group.name} logo`" />
        </figure>
      </div>
      {{ group.name }}
      <i
        :class="[
          'fas',
          open ? 'fa-chevron-down' : 'fa-chevron-up',
          'media-right',
        ]"
      ></i>
    </h2>
    <Service
      :class="{ column: horizontal, [`is-${width}`]: horizontal }"
      v-show="open"
      v-for="(item, index) in group.items"
      :key="index"
      v-bind:item="item"
    />
  </div>
</template>

<script>
import Service from "./Service.vue";

export default {
  name: "Accordion",
  components: {
    Service,
  },
  props: {
    group: {
      required: true,
      type: Object,
    },
    horizontal: {
      required: true,
      type: Boolean,
    },
    width: {
      required: true,
      type: Number,
    },
  },
  data: function () {
    return {
      open: true,
      vertical: !this.horizontal,
    };
  },
  methods: {
    toggle() {
      this.open = !this.open;
    },
  },
};
</script>
