<template>
  <a
    @click.prevent="toggleSetting()"
    class="navbar-item is-inline-block-mobile"
  >
    <span><i :class="['fas', 'fa-fw', value ? icon : secondaryIcon]"></i></span>
    <slot></slot>
  </a>
</template>

<script>
export default {
  name: "SettingToggle",
  props: {
    name: String,
    icon: String,
    iconAlt: String,
    defaultValue: Boolean,
  },
  data: function () {
    return {
      secondaryIcon: null,
      value: true,
    };
  },
  created: function () {
    this.secondaryIcon = this.iconAlt || this.icon;

    if (this.name in localStorage) {
      this.value = JSON.parse(localStorage[this.name]);
    } else {
      this.value = this.defaultValue;
    }

    this.$emit("updated", this.value);
  },
  methods: {
    toggleSetting: function () {
      this.value = !this.value;
      localStorage[this.name] = this.value;
      this.$emit("updated", this.value);
    },
  },
};
</script>
