<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <template v-else-if="api">
          happily storing {{ api.count }} documents
        </template>
      </p>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import Generic from "./Generic.vue";

export default {
  name: "Paperless",
  mixins: [service],
  props: {
    item: Object,
  },
  components: {
    Generic,
  },
  data: () => ({
    api: null,
  }),
  created() {
    this.fetchStatus();
  },
  methods: {
    fetchStatus: async function () {
      if (this.item.subtitle != null) return;

      const apikey = this.item.apikey;
      if (!apikey) {
        console.error(
          "apikey is not present in config.yml for the paperless entry!",
        );
        return;
      }
      this.api = await this.fetch("/api/documents/", {
        headers: {
          Authorization: "Token " + this.item.apikey,
        },
      }).catch((e) => console.log(e));
    },
  },
};
</script>
