<template>
  <Generic :item="item" :badges="badges" />
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Mylar",
  mixins: [service],
  data: () => {
    return {
      upcoming: null,
      wanted: null,
      serverError: null,
    };
  },
  computed: {
    badges() {
      return [
        { key: "wanted", label: "Wanted", value: this.wanted, tone: "info" },
        {
          key: "upcoming",
          label: "Upcoming",
          value: this.upcoming,
          tone: "accent",
        },
        this.connectionBadge(),
      ];
    },
  },
  methods: {
    fetchData: function () {
      return this.load(
        this.fetch(`/api?cmd=getUpcoming&apikey=${this.item.apikey}`).then(
          (upcoming) => {
            this.upcoming = upcoming.length;
          },
        ),
        this.fetch(`/api?cmd=getWanted&apikey=${this.item.apikey}`).then(
          (wanted) => {
            this.wanted = wanted.issues.length + wanted.annuals.length;
          },
        ),
      );
    },
  },
};
</script>
