<template>
  <a id="clock" class="navbar-item is-inline-block-mobile">
    <span>{{ timestamp }}</span>
  </a>
</template>

<script>
export default {
  name: "Clock",
  props: {
    item: Object,
  },
  data: function () {
    return {
      timestamp: "",
    };
  },
  created: function () {
    this.getTime();
    setInterval(this.getTime, 5000);
  },
  methods: {
    getTime: function () {
      const now = new Date();
      const militaryTime = this.item.militaryTime || false;
      if (militaryTime) {
        this.timestamp = `${this.formatNumber(now.getHours())}:${this.formatNumber(now.getMinutes())}`;
      } else {
        var hours = now.getHours();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        this.timestamp = `${this.formatNumber(hours)}:${this.formatNumber(now.getMinutes())} ${ampm}`;
      }
    },
    formatNumber: function (number) {
      number = (`0${number}`).slice(-2);
      return number;
    }
  },
};
</script>