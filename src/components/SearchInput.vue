<template>
  <div class="search-bar">
    <label for="search" class="search-label"></label>
    <input
      type="text"
      ref="search"
      :value="value"
      @input="$emit('input', $event.target.value.toLowerCase())"
      @keyup.enter.exact="$emit('search:open')"
      @keyup.alt.enter="$emit('search:open', '_blank')"
    />
  </div>
</template>

<script>
export default {
  name: "SearchInput",
  props: ["value"],
  mounted() {
    this._keyListener = function (event) {
      if (event.key === "/") {
        event.preventDefault();
        this.$emit("search:focus");
        this.$nextTick(() => {
          this.$refs.search.focus();
        });
      }
      if (event.key === "Escape") {
        this.$refs.search.value = "";
        this.$refs.search.blur();
        this.$emit("search:cancel");
      }
    };
    document.addEventListener("keydown", this._keyListener.bind(this));
  },
  beforeDestroy() {
    document.removeEventListener("keydown", this._keyListener);
  },
};
</script>

<style lang="scss" scoped></style>
