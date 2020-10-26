<template>
  <a v-on:click="toggleLayout()" class="navbar-item is-inline-block-mobile">
    <span><i :class="['fas', 'fa-fw', vlayout ? icon : secondaryIcon]"></i></span>
    <slot></slot>
  </a>
</template>

<script>
export default {
  name: "LayoutToggle",
  props: {
    name: String,
    icon: String,
    iconAlt: String,
    vlayout: Boolean,
  },
  data: function () {
    return {
      secondaryIcon: null,
    };
  },
  created: function () {
    this.secondaryIcon = this.iconAlt || this.icon;
    let vlayout;
    if (this.name in localStorage) {
      vlayout = JSON.parse(localStorage[this.name]);
    } else {
	vlayout = this.vlayout === null 
        ? true 
        : this.vlayout;
    }

    this.$emit("updated", vlayout);
  },
  methods: {
    toggleLayout: function () {
      let vlayout = !this.vlayout;
      localStorage[this.name] = vlayout;
      this.$emit("updated", vlayout);
    },
  },
};
</script>
