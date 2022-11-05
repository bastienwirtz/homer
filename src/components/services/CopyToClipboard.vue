<template>
  <Generic :item="item">
    <template #indicator>
      <div class="status">
        <i
          class="fa-regular fa-copy fa-xl"
          :class="{ scale: animate }"
          @click="copy()"
          @animationend="animate = false"
        ></i>
      </div>
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
    animate: false,
  }),
  methods: {
    copy() {
      navigator.clipboard.writeText(this.item.clipboard);
      this.animate = true;
    },
  },
};
</script>

<style scoped lang="scss">
.scale {
  -webkit-animation: scale-up 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  animation: scale-up 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}
.is-light i {
  color: black;
}
.is-dark i {
  color: white;
}
/**
 * ----------------------------------------
 * animation scale-down-center
 * ----------------------------------------
 */
@-webkit-keyframes scale-up {
  0% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
  50% {
    -webkit-transform: scale(1.25);
    transform: scale(1.25);
  }
  100% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
}
@keyframes scale-up {
  0% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
  50% {
    -webkit-transform: scale(1.25);
    transform: scale(1.25);
  }
  100% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
}
</style>
