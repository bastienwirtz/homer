<template>
  <div>
    <div class="card" :class="item.class">
      <a :href="item.url" :target="item.target" rel="noreferrer">
        <div class="card-content">
          <div class="media">
            <div v-if="item.logo" class="media-left">
              <figure class="image is-48x48">
                <img :src="item.logo" :alt="`${item.name} logo`" />
              </figure>
            </div>
            <div v-if="item.icon" class="media-left">
              <figure class="image is-48x48">
                <i style="font-size: 35px" :class="['fa-fw', item.icon]"></i>
              </figure>
            </div>
            <div class="media-content">
              <p class="title is-4">{{ item.name }}</p>
              <p class="subtitle is-6">{{ item.subtitle }}</p>
            </div>
            <div class="notifs">
              <strong
                v-if="activity > 0"
                class="notif activity"
                title="Activity"
                >{{ activity }}</strong
              >
              <strong
                v-if="warnings > 0"
                class="notif warnings"
                title="Warning"
                >{{ warnings }}</strong
              >
              <strong v-if="errors > 0" class="notif errors" title="Error">{{
                errors
              }}</strong>
              <strong
                v-if="serverError"
                class="notif errors"
                title="Connection error to Radarr API, check url and apikey in config.yml"
                >?</strong
              >
            </div>
          </div>
          <div class="tag" :class="item.tagstyle" v-if="item.tag">
            <strong class="tag-text">#{{ item.tag }}</strong>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: "Radarr",
  props: {
    item: Object,
  },
  data: () => {
    return {
      activity: null,
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
      fetch(`${this.item.url}/api/health?apikey=${this.item.apikey}`, {
        credentials: "include",
      })
        .then((response) => {
          if (response.status != 200) {
            throw new Error(response.statusText);
          }
          return response.json();
        })
        .then((health) => {
          this.warnings = 0;
          this.errors = 0;
          for (var i = 0; i < health.length; i++) {
            if (health[i].type == "warning") {
              this.warnings++;
            } else if (health[i].type == "error") {
              this.errors++;
            }
          }
        })
        .catch((e) => {
          console.error(e);
          this.serverError = true;
        });
      fetch(`${this.item.url}/api/queue?apikey=${this.item.apikey}`, {
        credentials: "include",
      })
        .then((response) => {
          if (response.status != 200) {
            throw new Error(response.statusText);
          }
          return response.json();
        })
        .then((queue) => {
          this.activity = 0;
          for (var i = 0; i < queue.length; i++) {
            if (queue[i].movie) {
              this.activity++;
            }
          }
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
.media-left img {
  max-height: 100%;
}
.notifs {
  position: absolute;
  color: white;
  font-family: sans-serif;
  top: 0.3em;
  right: 0.5em;
}
.notif {
  padding-right: 0.35em;
  padding-left: 0.35em;
  padding-top: 0.2em;
  padding-bottom: 0.2em;
  border-radius: 0.25em;
  position: relative;
  margin-left: 0.3em;
  font-size: 0.8em;
}
.activity {
  background-color: #4fb5d6;
}

.warnings {
  background-color: #d08d2e;
}

.errors {
  background-color: #e51111;
}
</style>
