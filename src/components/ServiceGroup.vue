<template>
  <!-- Vertical layout: Group container wrapper -->
  <div v-if="isVertical" :class="['column', `is-${12 / columns}`]">
    <GroupHeader v-if="group.name" :group="group" class="group-title" />
    <Service
      v-for="(item, index) in group.items"
      :key="`srv-${groupIndex}-${index}-${item.name || item.type}`"
      :item="item"
      :proxy="proxy"
      :class="item.class || group.class"
    />
  </div>

  <!-- Horizontal layout: Direct rendering -->
  <template v-else>
    <GroupHeader
      v-if="group.name"
      :key="`header-${groupIndex}`"
      :group="group"
      class="column is-full group-title"
    />
    <Service
      v-for="(item, index) in group.items"
      :key="`srv-${groupIndex}-${index}-${item.name || item.type}`"
      :item="item"
      :proxy="proxy"
      :class="[
        'column',
        `is-${12 / columns}`,
        `${item.class || group.class || ''}`,
      ]"
    />
  </template>
</template>

<script>
import Service from "./Service.vue";
import GroupHeader from "./GroupHeader.vue";

export default {
  name: "ServiceGroup",
  components: {
    Service,
    GroupHeader,
  },
  props: {
    group: {
      type: Object,
      required: true,
    },
    isVertical: {
      type: Boolean,
      default: false,
    },
    proxy: {
      type: String,
      default: null,
    },
    columns: {
      type: String,
      required: true,
    },
    groupIndex: {
      type: Number,
      required: true,
    },
  },
};
</script>
