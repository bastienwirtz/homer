<template>
  <Generic :item="item">
    <template #indicator>
      <div class="status"><i class="fa-regular fa-copy fa-xl" :class="{'fa-beat': animate, 'copied-icon': animate}" @click="copy"></i></div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import Generic from "./Generic.vue";

export default {
  name: "CopyToClipboard",
  mixins: [service],
  props: {
    item: Object,
  },
  components: {
    Generic,
  },
  data: () => ({
    animate: false
  }),
  methods: {
    copy() {
      javascript:navigator.clipboard.writeText(this.item.clipboard)
      this.animate = true;
      setTimeout(
        () => { this.animate = false },
        1000
      );
    }
  },
};
</script>

<style scoped lang="scss">
.status {
  color: black;
}
.copied-icon {
  color: #5dbc9d;
}
</style>
