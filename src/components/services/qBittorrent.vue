<template>
  <Generic :item="displayItem">
    <template #indicator>
      <div class="notifs">
        <strong
          v-if="count > 0"
          class="notif downloading"
          :title="`${count} active torrent${count > 1 ? 's' : ''}`"
        >
          {{ count }}
        </strong>
        <i
          v-if="error"
          class="notif error fa-solid fa-triangle-exclamation"
          title="Unable to fetch current status"
        ></i>
      </div>
    </template>
    <template #content>
      <p class="title is-4">
        {{ item.name }}
        <i
          v-if="count > 0"
          @click.stop.prevent="togglePause"
          @touchstart.stop.prevent="togglePause"
          class="control-icon fas"
          :class="isPaused ? 'fa-play' : 'fa-pause'"
          :title="isPaused ? 'Resume torrents' : 'Pause torrents'"
        ></i>
        <i
          v-if="count > 0"
          @click.stop.prevent="confirmDelete"
          @touchstart.stop.prevent="confirmDelete"
          class="control-icon fas fa-trash"
          title="Delete current torrent"
        ></i>
      </p>
      <teleport to="body">
        <div v-if="showDeleteConfirm" :class="['confirm-overlay', themeClass]" @click.stop="cancelDelete">
          <div class="confirm-dialog" @click.stop>
            <p class="confirm-title">Delete Torrent?</p>
            <p class="confirm-message">Are you sure you want to delete "{{ currentTorrent?.name }}"?</p>
            <div class="confirm-actions">
              <button @click.stop="deleteTorrent" class="confirm-btn confirm-delete">Delete</button>
              <button @click.stop="cancelDelete" class="confirm-btn confirm-cancel">Cancel</button>
            </div>
          </div>
        </div>
      </teleport>
      <template v-if="count > 0 && currentTorrent">
        <p class="subtitle is-6 torrent-name">
          {{ currentTorrent.name }}
        </p>
        <progress class="progress is-small torrent-progress" :value="currentTorrent.progress" max="100">
          {{ currentTorrent.progress }}%
        </progress>
        <p class="subtitle is-6 torrent-stats">
          <span class="percentage monospace">
            <i class="fas fa-download"></i>
            {{ currentTorrent.progress }}%
          </span>
          <span class="down monospace">
            <i class="fas fa-chart-line"></i>
            <span class="speed-text"><span class="speed-padding">{{ downRate.padding }}</span>{{ downRate.value }}</span>
          </span>
          <span v-if="currentTorrent.eta || isPaused" class="eta monospace">
            <i class="fas fa-clock"></i>
            {{ isPaused ? 'Paused' : currentTorrent.eta }}
          </span>
        </p>
      </template>
      <template v-else-if="item.subtitle && !error">
        <p class="subtitle">
          {{ item.subtitle }}
        </p>
      </template>
      <template v-else-if="error">
        <p class="subtitle is-6">
          <span class="error">An error has occurred.</span>
        </p>
      </template>
      <template v-else>
        <p class="subtitle is-6">
          <span class="idle">No active torrents</span>
        </p>
      </template>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
const units = ["KB", "MB", "GB"];

// Function to convert rate into a human-readable format with separate padding
const displayRate = (rate) => {
  let i = 0;

  while (rate > 1000 && i < units.length) {
    rate /= 1000;
    i++;
  }
  const roundedRate = Math.round(rate || 0);
  const rateStr = roundedRate.toString();
  const padding = "0".repeat(Math.max(0, 3 - rateStr.length));

  return {
    padding: padding,
    value: `${rateStr} ${units[i]}/s`
  };
};

export default {
  name: "QBittorrent",
  mixins: [service],
  props: { item: Object },
  data: () => ({
    dl: null,
    ul: null,
    count: null,
    error: null,
    torrents: [],
    showDeleteConfirm: false,
  }),
  computed: {
    downRate: function () {
      return displayRate(this.dl);
    },
    upRate: function () {
      return displayRate(this.ul);
    },
    isPaused: function () {
      if (!this.currentTorrent) return false;
      return this.currentTorrent.state === 'pausedDL' || this.currentTorrent.state === 'pausedUP';
    },
    themeClass() {
      // Detect current theme from document
      if (typeof document !== 'undefined') {
        const isDark = document.body.classList.contains('dark') ||
                      document.documentElement.classList.contains('dark') ||
                      window.matchMedia('(prefers-color-scheme: dark)').matches;
        return isDark ? 'dark' : 'light';
      }
      return 'light';
    },
    currentTorrent: function () {
      if (!this.torrents || this.torrents.length === 0) {
        return null;
      }
      // Get the first active torrent
      const torrent = this.torrents[0];

      // Format ETA
      let eta = null;
      if (torrent.eta > 0 && torrent.eta < 8640000) { // 8640000 = infinite in qBittorrent
        const hours = Math.floor(torrent.eta / 3600);
        const minutes = Math.floor((torrent.eta % 3600) / 60);
        if (hours > 0) {
          eta = `${hours}h ${minutes}m`;
        } else {
          eta = `${minutes}m`;
        }
      }

      return {
        name: torrent.name || "Unknown",
        progress: Math.round(torrent.progress * 100),
        eta: eta,
        state: torrent.state,
        hash: torrent.hash,
      };
    },
    displayItem() {
      // Remove tag from DOM when torrents are active
      if (this.count > 0 && this.currentTorrent) {
        const { tag, tagstyle, ...itemWithoutTag } = this.item;
        return itemWithoutTag;
      }
      return this.item;
    },
  },
  created() {
    const rateInterval = parseInt(this.item.rateInterval, 10) || 0;
    const torrentInterval = parseInt(this.item.torrentInterval, 10) || 0;
    if (rateInterval > 0) {
      setInterval(() => this.getRate(), rateInterval);
    }
    if (torrentInterval > 0) {
      setInterval(() => this.fetchCount(), torrentInterval);
    }

    this.getRate();
    this.fetchCount();
  },
  methods: {
    fetchCount: async function () {
      try {
        const body = await this.fetch("/api/v2/torrents/info");
        this.error = false;
        this.count = body.length;
        this.torrents = body;
      } catch (e) {
        this.error = true;
        console.error(e);
      }
    },
    getRate: async function () {
      try {
        const body = await this.fetch("/api/v2/transfer/info");
        this.error = false;
        this.dl = body.dl_info_speed;
        this.ul = body.up_info_speed;
      } catch (e) {
        this.error = true;
        console.error(e);
      }
    },
    togglePause: async function () {
      try {
        if (!this.currentTorrent?.hash) return;

        const endpoint = this.isPaused ? 'resume' : 'pause';
        await this.fetch(`/api/v2/torrents/${endpoint}?hashes=${this.currentTorrent.hash}`, {
          method: 'POST',
        });

        // Refresh status
        await this.fetchCount();
      } catch (e) {
        console.error('Failed to toggle pause:', e);
      }
    },
    confirmDelete: function () {
      this.showDeleteConfirm = true;
    },
    cancelDelete: function () {
      this.showDeleteConfirm = false;
    },
    deleteTorrent: async function () {
      try {
        if (!this.currentTorrent?.hash) {
          console.error('No torrent hash available for deletion');
          return;
        }

        await this.fetch(`/api/v2/torrents/delete?hashes=${this.currentTorrent.hash}&deleteFiles=false`, {
          method: 'POST',
        });

        this.showDeleteConfirm = false;
        // Refresh status
        await this.fetchCount();
        await this.getRate();
      } catch (e) {
        console.error('Failed to delete torrent:', e);
        this.showDeleteConfirm = false;
      }
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

    &.downloading {
      background-color: #4fb5d6;
    }

    &.error {
      border-radius: 50%;
      aspect-ratio: 1;
      background-color: #e51111;
    }
  }
}

.error {
  color: #e51111 !important;
  font-weight: normal;
  font-size: 0.9em;
}

.idle {
  color: #888;
  font-style: italic;
  font-weight: normal;
  font-size: 0.9em;
}

.torrent-name {
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
  margin-bottom: 0.5em !important;
}

.torrent-progress {
  margin-bottom: 0.5em !important;
  height: 0.5rem;
  transition: all 0.3s ease-in-out;
}

.torrent-progress::-webkit-progress-value {
  background-color: #20c625ff;
  transition: all 0.3s ease-in-out;
}

.torrent-progress::-moz-progress-bar {
  background-color: #20c625ff;
  transition: all 0.3s ease-in-out;
}

.torrent-stats {
  display: flex;
  gap: 0;
  margin-bottom: 0 !important;
  font-size: 1.1em;

  span {
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0.3em;
    white-space: nowrap;
    overflow: hidden;

    i {
      opacity: 0.7;
      flex-shrink: 0;
      font-size: 0.8em;
    }
  }
}

.down {
  width: 7.5em;
  margin-right: 0;
  color: #4fb5d6;
}

.percentage {
  width: 4.8em;
  color: #4caf50;
}

.eta {
  width: 7em;
  color: #f39c12;
}

.monospace {
  font-family: monospace;
}

.torrent-stats .monospace {
  font-weight: 600;
}

.speed-text {
  display: inline-flex;
  gap: 0 !important;
  margin: 0;
  padding: 0;
}

.speed-padding {
  opacity: 0.25;
  margin: 0;
  padding: 0;
}

.control-icon {
  margin-left: 0.4em;
  font-size: 0.6em;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s ease, transform 0.1s ease, border-color 0.2s ease;
  vertical-align: middle;
  position: relative;
  top: -0.1em;
  z-index: 9999;
  pointer-events: all;
  border: 1.5px solid;
  border-radius: 0.3em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.8em;
  height: 1.8em;

  &:hover {
    opacity: 1;
  }

  &:active {
    transform: scale(0.95);
  }

  &.fa-play {
    color: #4caf50;
    border-color: rgba(76, 175, 80, 0.4);

    &:hover {
      border-color: rgba(76, 175, 80, 0.7);
    }
  }

  &.fa-pause {
    color: #f39c12;
    border-color: rgba(243, 156, 18, 0.4);

    &:hover {
      border-color: rgba(243, 156, 18, 0.7);
    }
  }

  &.fa-trash {
    color: #e51111;
    border-color: rgba(229, 17, 17, 0.4);

    &:hover {
      border-color: rgba(229, 17, 17, 0.7);
    }
  }
}
</style>

<style>
/* Non-scoped styles for teleported dialog */
.confirm-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background-color: rgba(0, 0, 0, 0.7) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  z-index: 10000 !important;
}

.confirm-dialog {
  background-color: var(--card-background) !important;
  border-radius: 0.5em !important;
  padding: 1.5em !important;
  max-width: 400px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
}

.confirm-title {
  font-size: 1.2em !important;
  font-weight: 600 !important;
  margin-bottom: 0.5em !important;
  color: var(--text-title) !important;
}

.confirm-message {
  margin-bottom: 1.5em !important;
  color: var(--text) !important;
  word-break: break-word !important;
}

.confirm-actions {
  display: flex !important;
  gap: 0.5em !important;
  justify-content: flex-end !important;
}

.confirm-btn {
  padding: 0.5em 1em !important;
  border: none !important;
  border-radius: 0.3em !important;
  cursor: pointer !important;
  font-weight: 600 !important;
  transition: opacity 0.2s ease, transform 0.1s ease !important;
}

.confirm-btn:hover {
  opacity: 0.9 !important;
}

.confirm-btn:active {
  transform: scale(0.95) !important;
}

.confirm-delete {
  background-color: #e51111 !important;
  color: white !important;
}

.confirm-cancel {
  background-color: #888 !important;
  color: white !important;
}
</style>
