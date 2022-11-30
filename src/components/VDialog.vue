<template>
  <div class="modal" :class="{ 'is-active': modelValue }">
    <div class="modal-background"></div>
    <slot name="content">
      <div class="modal-content"></div>
    </slot>
    <button
      @click="close"
      class="modal-close is-large"
      aria-label="close"
    ></button>
  </div>
</template>
<script>
export default {
  name: "VDialog",
  props: {
    modelValue: Boolean,
  },
  emits: ["update:modelValue"],
  methods: {
    close: function () {
      this.$emit("update:modelValue", false);
    },
  },
};
</script>
<style scoped></style>
