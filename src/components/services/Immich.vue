<template>
  <Generic :item="item" :badges="badges" />
</template>

<script>
import service from "@/mixins/service.js";
import { displaySize } from "@/utils/format.js";

export default {
  name: "Immich",
  mixins: [service],
  data: () => {
    return {
      users: null,
      photos: null,
      videos: null,
      usage: null,
      serverError: null,
    };
  },
  computed: {
    badges() {
      return [
        { key: "users", label: "Users", value: this.users, tone: "success" },
        { key: "photos", label: "Photos", value: this.photos, tone: "info" },
        { key: "videos", label: "Videos", value: this.videos, tone: "warning" },
        {
          key: "usage",
          label: "Usage",
          value: this.usage ? displaySize(this.usage) : null,
          tone: "neutral",
        },
        this.connectionBadge(),
      ];
    },
  },
  methods: {
    fetchData: function () {
      const headers = {
        "x-api-key": this.item.apikey,
      };

      return this.load(
        this.fetch(`/api/server/statistics`, { headers }).then((stats) => {
          this.photos = stats.photos;
          this.videos = stats.videos;
          this.usage = stats.usage;
          this.users = stats.usageByUser.length;
        }),
      );
    },
  },
};
</script>
