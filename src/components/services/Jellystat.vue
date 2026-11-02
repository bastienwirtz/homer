<template>
  <Generic :item="item" :badges="badges" />
</template>
<script>
import service from "@/mixins/service.js";

export default {
  name: "Jellystat",
  mixins: [service],
  data: () => ({
    stats: null,
    serverError: null,
  }),
  computed: {
    streams: function () {
      return this.stats?.filter((stream) => "NowPlayingItem" in stream).length;
    },
    badges() {
      return [
        {
          key: "streams",
          label: "Active streams",
          value: this.streams,
          tone: "success",
        },
        this.connectionBadge(),
      ];
    },
  },
  methods: {
    fetchData: function () {
      const headers = {
        Authorization: `bearer ${this.item.apikey}`,
      };
      return this.load(
        this.fetch("/proxy/getSessions", { headers }).then((response) => {
          this.stats = response;
        }),
      );
    },
  },
};
</script>
