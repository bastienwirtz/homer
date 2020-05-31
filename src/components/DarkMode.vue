<template>
  <a
    v-on:click="toggleTheme()"
    aria-label="Toggle dark mode"
    class="navbar-item is-inline-block-mobile"
  >
    <i class="fas fa-adjust"></i>
  </a>
</template>

<script>
export default {
  name: "Darkmode",
  data: function () {
    return {
      isDark: null,
    };
  },
  created: function () {
    this.isDark =
      "overrideDark" in localStorage
        ? JSON.parse(localStorage.overrideDark)
        : matchMedia("(prefers-color-scheme: dark)").matches;
    this.$emit("updated", this.isDark);
  },
  methods: {
    toggleTheme: function () {
      this.isDark = !this.isDark;
      localStorage.overrideDark = this.isDark;
      this.$emit("updated", this.isDark);
    },
  },
};
</script>
