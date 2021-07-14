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
                v-if="config !== null && config.system.news.unread > 0"
                class="notif news"
                title="News"
                >{{ config.system.news.unread }}</strong
              >
              <strong
                v-if="config !== null && config.main.logs.numWarnings > 0"
                class="notif warnings"
                title="Warning"
                >{{ config.main.logs.numWarnings }}</strong
              >
              <strong
                v-if="config !== null && config.main.logs.numErrors > 0"
                class="notif errors"
                title="Error"
                >{{ config.main.logs.numErrors }}</strong
              >
              <strong
                v-if="serverError"
                class="notif errors"
                title="Connection error to Medusa API, check url and apikey in config.yml"
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
  name: "Medusa",
  props: {
    item: Object,
  },
  data: () => {
    return {
      config: null,
      serverError: false,
    };
  },
  created: function () {
    this.fetchConfig();
  },
  methods: {
    fetchConfig: function () {
      fetch(`${this.item.url}/api/v2/config`, {
        credentials: "include",
        headers: { "X-Api-Key": `${this.item.apikey}` },
      })
        .then((response) => {
          if (response.status != 200) {
            throw new Error(response.statusText);
          }
          return response.json();
        })
        .then((conf) => {
          this.config = conf;
        })
        .catch((e) => {
          console.log(e);
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
.news {
  background-color: #777777;
}

.warnings {
  background-color: #d08d2e;
}

.errors {
  background-color: #e51111;
}
</style>
