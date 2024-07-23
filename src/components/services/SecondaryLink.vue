<template>
  <Generic :item="item">
    <template #indicator>
      <div class="status">
        <a :href="item.SecondaryLinkUrl" :target="item.SecondaryLinkTarget" :title="item.SecondaryLinkHover" rel="noreferrer">
          <i
          class="fa-xl" :class="item.SecondaryLinkIcon"
        ></i>
        </a>
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import Generic from "./Generic.vue";

export default {
  name: "SecondaryLink",
  mixins: [service],
  props: {
    item: Object,
  },
  components: {
    Generic,
  },
  data: () => ({
    animate: false,
  }),
};
</script>
