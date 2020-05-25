<template>
  <a v-on:click="toggleSetting()" class="navbar-item is-inline-block-mobile">
    <span v-show="value"><i :class="['fas', icon]"></i></span>
    <span v-show="!value"><i :class="['fas', iconAlt]"></i></span>
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
  },
  data: function () {
    return {
      value: true,
    };
  },
  created: function () {
    if (!this.iconAlt) {
      this.iconAlt = this.icon;
    }

    if (this.name in localStorage) {
      this.value = JSON.parse(localStorage[this.name]);
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
