<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>

      <p class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <template v-else>
          {{ details }}
        </template>
      </p>
    </template>

    <template #indicator>
      <div class="notifs">
        <strong v-if="folders > 0" class="notif folders" title="Folders">
          {{ folders }}
        </strong>
        <strong v-if="artists > 0" class="notif artists" title="Artists">
          {{ artists }}
        </strong>

        <div v-if="status" class="status" :class="status">
          {{ status }}
        </div>
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Navidrome",
  mixins: [service],
  props: {
    item: Object,
  },
  data: () => ({
    status: "",
    folders: null,
    artists: null,

    // scan info
    lastScan: null,
    scanning: false,

    separator: " · ",
    items: ["scan"],
  }),
  computed: {
    details() {
      const details = [];

      for (const key of this.items) {
        switch (key) {
          case "scan":
            if (this.scanning) {
              details.push("Scanning…");
            } else if (this.lastScan) {
              details.push(`Last scan: ${this.formattedLastScan}`);
            }
            break;
        }
      }

      return details.join(this.separator);
    },

    formattedLastScan() {
      if (!this.lastScan) return null;

      const d = new Date(this.lastScan);
      return d.toLocaleString(undefined, {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
  created() {
    this.fetchServerStatus().then(() => {
      if (this.status === "online") {
        this.fetchServerStats();
      }
    });
  },
  methods: {
    async fetchServerStatus() {
      try {
        const auth = {
          u: this.item.username,
          p: this.item.password,
          v: "1.16.1",
          c: "homer",
          f: "json",
        };

        const qs = new URLSearchParams(auth).toString();
        const response = await this.fetch(`/rest/ping.view?${qs}`);

        if (response?.["subsonic-response"]?.status === "ok") {
          this.status = "online";
        } else {
          throw new Error("Ping failed");
        }
      } catch (e) {
        console.error(e);
        this.status = "offline";
      }
    },

    async fetchServerStats() {
      try {
        const auth = {
          u: this.item.username,
          p: this.item.password,
          v: "1.16.1",
          c: "homer",
          f: "json",
        };

        const qs = new URLSearchParams(auth).toString();

        // Folders
        const foldersRes = await this.fetch(`/rest/getMusicFolders.view?${qs}`);
        this.folders =
          foldersRes["subsonic-response"]?.musicFolders?.musicFolder?.length || 0;

        // Artists
        const artistsRes = await this.fetch(`/rest/getArtists.view?${qs}`);
        const index =
          artistsRes["subsonic-response"]?.artists?.index || [];

        this.artists = index.reduce(
          (sum, g) => sum + (g.artist?.length || 0),
          0
        );

        // Scan status (Navidrome extension)
        const scanRes = await this.fetch(`/rest/getScanStatus.view?${qs}`);
        const scan = scanRes["subsonic-response"]?.scanStatus;

        this.scanning = !!scan?.scanning;
        this.lastScan = scan?.lastScan || null;
      } catch (e) {
        console.error(e);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.notifs {
  position: absolute;
  top: 0.3em;
  right: 0.5em;
  color: white;
  font-family: sans-serif;

  .notif {
    display: inline-block;
    padding: 0.2em 0.35em;
    border-radius: 0.25em;
    margin-left: 0.3em;
    font-size: 0.8em;

    &.folders {
      background-color: #8dd475;
    }

    &.artists {
      background-color: #6ec6ff;
    }
  }
}

.status {
  font-size: 0.8rem;
  color: var(--text-title);
  margin-left: 0.4em;

  &.online:before {
    background-color: #94e185;
    border-color: #78d965;
    box-shadow: 0 0 5px 1px #94e185;
  }

  &.offline:before {
    background-color: #c9404d;
    border-color: #c42c3b;
    box-shadow: 0 0 5px 1px #c9404d;
  }

  &:before {
    content: " ";
    display: inline-block;
    width: 7px;
    height: 7px;
    margin-right: 6px;
    border: 1px solid #000;
    border-radius: 7px;
  }
}
</style>
