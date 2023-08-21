<template>
  <div class="search-bar">
    <label for="search" class="search-label"></label>
    <input
      type="text"
      ref="search"
      :value="value"
      @input.stop="search($event.target.value)"
      @keyup.enter.exact="open()"
      @keyup.alt.enter="open('_blank')"
    />
  </div>
</template>

<script>
export default {
  name: "SearchInput",
  props: {
    value: String,
    hotkey: {
      type: String,
      default: "/",
    },
  },
  mounted() {
    this._keyListener = function (event) {
      if (event.key === this.hotkey) {
        event.preventDefault();
        this.focus();
      }
      if (event.key === "Escape") {
        this.cancel();
      }
    };
    document.addEventListener("keydown", this._keyListener.bind(this));

    // fill search from get parameter.
    const search = new URLSearchParams(window.location.search).get("search");
    if (search) {
      this.$refs.search.value = search;
      this.search(search);
      this.focus();
    }
  },
  methods: {
    open: function (target = null) {
      if (!this.$refs.search.value) {
        return;
      }
      this.$emit("search-open", target);
    },
    focus: function () {
      this.$emit("search-focus");
      this.$nextTick(() => {
        this.$refs.search.focus();
      });
    },
    setSearchURL: function (value) {
      const url = new URL(window.location);
      if (value === "") {
        url.searchParams.delete("search");
      } else {
        url.searchParams.set("search", value);
      }
      window.history.replaceState("search", null, url);
    },
    cancel: function () {
      this.setSearchURL("");
      this.$refs.search.value = "";
      this.$refs.search.blur();
      this.$emit("search-cancel");
    },
    search: function (value) {
      this.setSearchURL(value);
      this.$emit("input", value.toLowerCase());
    },
  },
  beforeUnmount() {
    document.removeEventListener("keydown", this._keyListener);
  },
};
</script>

<style lang="scss" scoped></style>
