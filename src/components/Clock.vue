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
      this.timestamp = `${this.formatNumber(now.getHours())}:${this.formatNumber(now.getMinutes())}`;
    },
    formatNumber: function (number) {
      number = (`0${number}`).slice(-2);
      return number;
    }
  },
};
</script>