<template>
  <template v-for="bookmark in bookmarks" :key="bookmark.name">
      <Generic :item="bookmark">
    </Generic>
  </template>
</template>

<script>
import service from "@/mixins/service.js";
import Generic from "./Generic.vue";

export default {
  name: "Linkding",
  components: {
    Generic,
  },
  mixins: [service],
  props: {
    item: Object
  },
  data: () => ({
    bookmarks: [],
  }),
  computed: {
    calculatedLimit: function () {
      let limit = this.item.limit ? this.item.limit : 5;
      return Math.min(Math.max(limit,1),15);
    }
  },
  created() {
    this.fetchBookmarks();
  },
  methods: {
    fetchBookmarks: async function () {
      const headers = {
        Authorization: `Token ${this.item.token}`,
        Accept: "application/json",
      };

      let limit = this.calculatedLimit;

      let query = ''
      if (this.item.query) {
        query = `&q=${encodeURIComponent(this.item.query)}`;
      }

      let url = `/api/bookmarks/?limit=${limit}${query}`;

      this.fetch(url, {
        headers,
      })
          .then((ld_response) => {
            this.bookmarks = ld_response.results.map(bookmark => ({
              name: `${bookmark.title}`,
              subtitle: `${bookmark.description}`,
              url: bookmark.url,
              logo: `${bookmark.favicon_url}`,
              tag: `${bookmark.tag_names.join(" #")}`
            }));
          })
          .catch((e) => {
            console.log(e);
            this.error = true;
          });
    },
  },
};
</script>