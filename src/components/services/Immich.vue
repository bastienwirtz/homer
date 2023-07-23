<template>
  <Generic :item="item">
    <template #indicator>
      <div class="notifs">
        <strong v-if="users > 0" class="notif users" title="Users">
          {{ users }}
        </strong>
        <strong v-if="photos > 0" class="notif photos" title="Photos">
          {{ photos }}
        </strong>
        <strong v-if="videos > 0" class="notif videos" title="Videos">
          {{ videos }}
        </strong>
        <strong v-if="usage > 0" class="notif usage" title="Usage">
          {{ humanizeSize }}
        </strong>
        <strong
          v-if="serverError"
          class="notif errors"
          title="Connection error to Immich API, check your url and apikey in config.yml"
          >?</strong
        >
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import Generic from "./Generic.vue";

export default {
  name: "Immich",
  mixins: [service],
  props: {
    item: Object,
  },
  components: {
    Generic,
  },
  data: () => {
    return {
      users: null,          
      photos: null,
      videos: null,
      usage: null,
      serverError: false,
    };
  },
  created: function () {
    const updateInterval = parseInt(this.item.updateInterval, 10) || 0;
    if (updateInterval > 0) {
      setInterval(() => this.fetchConfig(), updateInterval);
    }
    this.fetchConfig();
  },
  computed: {
    humanizeSize: function () {
        let bytes = this.usage;
        if (Math.abs(bytes) < 1024)
                return bytes + ' B';

        const units = ['KiB', 'MiB', 'GiB', 'TiB'];
        let u = -1;
        do {
                bytes /= 1024;
                ++u;
        } while (Math.round(Math.abs(bytes) * 100) / 100 >= 1024 && u < units.length - 1);

        return bytes.toFixed(2) + ' ' + units[u];
    },
  },
  methods: {
    fetchConfig: function () {
      const headers = {
        "x-api-key": this.item.apikey,
      }; 

      this.fetch(`/api/server-info/stats`, { headers })
        .then((stats) => {
          this.photos = stats.photos;
          this.videos = stats.videos;
          this.usage = stats.usage;
          this.users = stats.usageByUser.length;
        })                  
        .catch((e) => {
          console.error(e);
          this.serverError = true;
        });
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
    &.photos {
      background-color: #4fb5d6;
    }

    &.videos {
      background-color: #d08d2e;
    }

    &.usage {
      background-color: #e51111;
    }

    &.users {
      background-color: #8dd475;
    }
  }
}
</style>