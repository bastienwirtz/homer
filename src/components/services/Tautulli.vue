<template>
  <Generic :item="item" :badges="badges" />
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Tautulli",
  mixins: [service],
  data: () => ({
    stats: null,
    serverError: null,
  }),
  computed: {
    streams: function () {
      return this.stats?.stream_count;
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
      return this.load(
        this.fetch(`/api/v2?apikey=${this.item.apikey}&cmd=get_activity`).then(
          (response) => {
            this.stats = response.response.data;
          },
        ),
      );
    },
  },
};
</script>
