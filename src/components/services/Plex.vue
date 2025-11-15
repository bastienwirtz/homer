<template>
  <Generic :item="item">
    <template #indicator>
      <div class="notifs">
        <strong
          v-if="streams > 0"
          class="notif activity"
          title="Active Streams"
        >
          {{ streams }}
        </strong>
        <strong v-if="series > 0" class="notif series" title="Total Series">
          {{ series }}
        </strong>
        <strong v-if="movies > 0" class="notif movies" title="Total Movies">
          {{ movies }}
        </strong>
        <strong v-if="warnings > 0" class="notif warnings" title="Warning">
          {{ warnings }}
        </strong>
        <strong v-if="errors > 0" class="notif errors" title="Error">
          {{ errors }}
        </strong>
        <strong
          v-if="serverError"
          class="notif errors"
          title="Connection error to Plex API, check url and token in config.yml"
        >
          ?
        </strong>
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
export default {
  name: "Plex",
  mixins: [service],
  props: {
    item: Object,
  },
  data: () => {
    return {
      streams: null,
      series: null,
      movies: null,
      warnings: null,
      errors: null,
      serverError: false,
    };
  },
  created: function () {
    const checkInterval = parseInt(this.item.checkInterval, 10) || 0;
    if (checkInterval > 0) {
      setInterval(() => this.fetchData(), checkInterval);
    }
    this.fetchData();
  },
  methods: {
    fetchData: function () {
      const handleError = (e) => {
        console.error(e);
        this.serverError = true;
      };
      this.fetch(`/status/sessions?X-Plex-Token=${this.item.token}`, {}, false)
        .then((str) => {
          const parser = new DOMParser();
          const xml = parser.parseFromString(str, "application/xml");
          const metadata = xml.getElementsByTagName("MediaContainer")[0];
          this.streams = metadata ? metadata.getAttribute("size") || 0 : 0;
        })
        .catch(handleError);
      this.fetch(`/library/sections?X-Plex-Token=${this.item.token}`, {}, false)
        .then((str) => {
          const parser = new DOMParser();
          const xml = parser.parseFromString(str, "application/xml");
          const directories = xml.getElementsByTagName("Directory");
          const seriesDirIds = [];
          const movieDirIds = [];
          for (let dir of directories) {
            if (dir.getAttribute("type") === "show") {
              seriesDirIds.push(dir.getAttribute("key"));
            } else if (dir.getAttribute("type") === "movie") {
              movieDirIds.push(dir.getAttribute("key"));
            }
          }
          let seriesCount = 0;
          Promise.all(
            seriesDirIds.map((seriesDirId) =>
              fetch(
                `${this.endpoint}/library/sections/${seriesDirId}/all?X-Plex-Token=${this.item.token}`,
              )
                .then((response) => response.text())
                .then((str) => {
                  const xml = parser.parseFromString(str, "application/xml");
                  seriesCount += xml.getElementsByTagName("Directory").length;
                })
                .catch(handleError),
            ),
          )
            .then(() => {
              this.series = seriesCount;
            })
            .catch(handleError);

          let movieCount = 0;
          Promise.all(
            movieDirIds.map((movieDirId) =>
              fetch(
                `${this.endpoint}/library/sections/${movieDirId}/all?X-Plex-Token=${this.item.token}`,
              )
                .then((response) => response.text())
                .then((str) => {
                  const xml = parser.parseFromString(str, "application/xml");
                  movieCount += xml.getElementsByTagName("Video").length;
                })
                .catch(handleError),
            ),
          ).then(() => {
            this.movies = movieCount;
          });
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
    &.activity {
      background-color: #4fb5d6;
    }
    &.series {
      background-color: #ffa500;
    }
    &.movies {
      background-color: #008000;
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
