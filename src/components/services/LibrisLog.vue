<template>
  <Generic :item="item" :subtitle="statsText" :badges="badges" />
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "LibrisLog",
  mixins: [service],
  data: () => ({
    stats: null,
    serverError: null,
  }),
  computed: {
    statsText() {
      if (!this.stats) return null;
      return `${this.stats.books_read} / ${this.stats.total_books} books read`;
    },
    badges() {
      return [
        {
          key: "reading",
          label: "Currently reading",
          value: this.stats?.books_reading,
          tone: "info",
        },
        {
          key: "want-to-read",
          label: "Want to read",
          value: this.stats?.books_want_to_read,
          tone: "accent",
        },
        this.connectionBadge(),
      ];
    },
  },
  methods: {
    fetchData() {
      const headers = {
        "X-API-Key": this.item.apikey,
      };
      return this.load(
        this.fetch("/api/books/stats", { headers }).then((data) => {
          this.stats = data;
        }),
      );
    },
  },
};
</script>
