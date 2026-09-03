<template>
  <Generic :item="item" :badges="badges" />
</template>

<script>
import service from "@/mixins/service.js";
export default {
  name: "Plex",
  mixins: [service],
  data: () => {
    return {
      streams: null,
      series: null,
      movies: null,
      warnings: null,
      errors: null,
      serverError: null,
    };
  },
  computed: {
    badges() {
      return [
        {
          key: "streams",
          label: "Active Streams",
          value: this.streams,
          tone: "info",
        },
        {
          key: "series",
          label: "Total Series",
          value: this.series,
          tone: "accent",
        },
        {
          key: "movies",
          label: "Total Movies",
          value: this.movies,
          tone: "success",
        },
        {
          key: "warnings",
          label: "Warning",
          value: this.warnings,
          tone: "warning",
        },
        { key: "errors", label: "Error", value: this.errors, tone: "danger" },
        this.connectionBadge(),
      ];
    },
  },
  methods: {
    fetchData: function () {
      return this.load(
        this.fetch(
          `/status/sessions?X-Plex-Token=${this.item.token}`,
          {},
          false,
        ).then((str) => {
          const parser = new DOMParser();
          const xml = parser.parseFromString(str, "application/xml");
          const metadata = xml.getElementsByTagName("MediaContainer")[0];
          this.streams = metadata ? Number(metadata.getAttribute("size")) : 0;
        }),
        this.fetch(
          `/library/sections?X-Plex-Token=${this.item.token}`,
          {},
          false,
        ).then((str) => {
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
          let movieCount = 0;

          return Promise.all([
            Promise.all(
              seriesDirIds.map((seriesDirId) =>
                this.fetch(
                  `/library/sections/${seriesDirId}/all?X-Plex-Token=${this.item.token}`,
                  {},
                  false,
                ).then((str) => {
                  const xml = parser.parseFromString(str, "application/xml");
                  seriesCount += xml.getElementsByTagName("Directory").length;
                }),
              ),
            ).then(() => {
              this.series = seriesCount;
            }),
            Promise.all(
              movieDirIds.map((movieDirId) =>
                this.fetch(
                  `/library/sections/${movieDirId}/all?X-Plex-Token=${this.item.token}`,
                  {},
                  false,
                ).then((str) => {
                  const xml = parser.parseFromString(str, "application/xml");
                  movieCount += xml.getElementsByTagName("Video").length;
                }),
              ),
            ).then(() => {
              this.movies = movieCount;
            }),
          ]);
        }),
      );
    },
  },
};
</script>
