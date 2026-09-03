<template>
  <Generic :item="item">
    <template #aside>
      <button
        type="button"
        title="Copy to clipboard"
        @click="copy()"
        @animationend="animate = false"
      >
        <i class="fa-regular fa-copy fa-xl" :class="{ scale: animate }"></i>
      </button>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "CopyToClipboard",
  mixins: [service],
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
button {
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  color: inherit;
}

.scale {
  -webkit-animation: scale-up 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  animation: scale-up 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}
.light i {
  color: black;
}
.dark i {
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
