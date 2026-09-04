<template>
  <Generic :item="item" :subtitle="embyCount" :status="status" />
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Emby",
  mixins: [service],
  data: () => ({
    status: null,
    albumCount: 0,
    songCount: 0,
    movieCount: 0,
    seriesCount: 0,
    episodeCount: 0,
  }),
  computed: {
    embyCount: function () {
      if (this.item.libraryType === "music")
        return `${this.songCount} songs, ${this.albumCount} albums`;
      else if (this.item.libraryType === "movies")
        return `${this.movieCount} movies`;
      else if (this.item.libraryType === "series")
        return `${this.episodeCount} eps, ${this.seriesCount} series`;
      else return `wrong library type 💀`;
    },
  },
  methods: {
    fetchData: async function () {
      const serverInfo = await this.fetchServerStatus();

      if (!this.item.subtitle) {
        this.fetchServerMediaStats(serverInfo);
      }
    },
    fetchServerStatus: async function () {
      return this.fetch("/System/info/public")
        .then((response) => {
          if (!response.Id) throw new Error();
          this.status = { state: "online", label: "running" };
          return response;
        })
        .catch((e) => {
          console.error(e);
          this.status = { state: "offline", label: "dead" };
          return null;
        });
    },
    // Jellyfin 12 no longer accepts X-Emby-Token.
    authHeaders: function (serverInfo) {
      const isJellyfin12OrNewer =
        serverInfo?.ProductName?.toLowerCase().includes("jellyfin") &&
        parseInt(serverInfo.Version, 10) >= 12;

      const legacyAuth = this.item.legacyAuth ?? !isJellyfin12OrNewer;

      return legacyAuth
        ? { "X-Emby-Token": this.item.apikey }
        : { Authorization: `MediaBrowser Token="${this.item.apikey}"` };
    },
    fetchServerMediaStats: async function (serverInfo) {
      const headers = this.authHeaders(serverInfo);

      const data = await this.fetch("/items/counts", { headers }).catch((e) => {
        console.error(e);
      });

      if (!data) {
        return;
      }

      this.albumCount = data.AlbumCount;
      this.songCount = data.SongCount;
      this.movieCount = data.MovieCount;
      this.seriesCount = data.SeriesCount;
      this.episodeCount = data.EpisodeCount;
    },
  },
};
</script>
