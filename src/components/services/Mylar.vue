<template>
  <Generic :item="item">
    <template #indicator>
      <div class="notifs">
        <strong v-if="wanted > 0" class="notif wanted" title="Wanted">
          {{ wanted }}
        </strong>
        <strong v-if="upcoming > 0" class="notif upcoming" title="Upcoming">
          {{ upcoming }}
        </strong>
        <strong
          v-if="serverError"
          class="notif errors"
          title="Connection error to Mylar API, check url and apikey in config.yml"
        >
          ?
        </strong>
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import Generic from "./Generic.vue";

export default {
  name: "Mylar",
  mixins: [service],
  props: {
    item: Object,
  },
  components: {
    Generic,
  },
  data: () => {
    return {
      upcoming: null,
      wanted: null,
      warnings: null,
      errors: null,
      serverError: false,
    };
  },
  created: function () {
    this.fetchConfig();
  },
  methods: {
    fetchConfig: function () {
      const handleError = (e) => {
        console.error(e);
        this.serverError = true;
      };
      this.fetch(`/api?cmd=getUpcoming&apikey=${this.item.apikey}`)
        .then((upcoming) => {
          this.upcoming = upcoming.length;
        })
        .catch(handleError);
      this.fetch(`/api?cmd=getWanted&apikey=${this.item.apikey}`)
        .then((wanted) => {
          this.wanted = wanted.issues.length + wanted.annuals.length;
        })
        .catch(handleError);
    },
  },
};
</script>

<style scoped lang="scss">
.notifs {
  position: absolute;
  color: white;
  font-family: sans-serif;
  top: 0.3em;
  right: 0.5em;

  .notif {
    display: inline-block;
    padding: 0.2em 0.35em;
    border-radius: 0.25em;
    position: relative;
    margin-left: 0.3em;
    font-size: 0.8em;

    &.wanted {
      background-color: #4fb5d6;
    }

    &.upcoming {
      background-color: #9d00ff;
    }

    &.warnings {
      background-color: #d08d2e;
    }

    &.errors {
      background-color: #e51111;
    }
  }
}
</style>
