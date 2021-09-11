<template>
  <a id="clock" class="navbar-item is-inline-block-mobile">
    <span>{{ timestamp }}</span>
  </a>
</template>

<script>
export default {
  name: "Clock",
  props: {
    name: String,
    icon: String,
    iconAlt: String,
  },
  data: function () {
    return {
      timestamp: "",
    };
  },
  created: function () {
    setInterval(this.getTime, 1000);
  },
  methods: {
    getTime: function () {
      const now = new Date();
      this.timestamp = now.getHours() + ":" + now.getMinutes();
    },
  },
};
</script>