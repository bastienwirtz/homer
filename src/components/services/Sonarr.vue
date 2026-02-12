<template>
  <Generic :item="displayItem">
    <template #indicator>
      <div class="notifs">
        <strong v-if="activity > 0" class="notif activity" title="Activity">
          {{ activity }}
        </strong>
        <strong v-if="missing > 0" class="notif missing" title="Missing">
          {{ missing }}
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
          title="Connection error to Sonarr API, check url and apikey in config.yml"
        >
          ?
        </strong>
      </div>
    </template>
    <template #content>
      <p class="title is-4">
        {{ item.name }}
        <i
          v-if="activity > 0"
          @click.stop.prevent="confirmDelete"
          @touchstart.stop.prevent="confirmDelete"
          class="control-icon fas fa-trash"
          title="Delete current queue item"
        ></i>
      </p>
      <teleport to="body">
        <div v-if="showDeleteConfirm" :class="['confirm-overlay', themeClass]" @click.stop="cancelDelete">
          <div class="confirm-dialog" @click.stop>
            <p class="confirm-title">Delete Queue Item?</p>
            <p class="confirm-message">Are you sure you want to delete "{{ currentQueue?.episodeTitle }}" from the queue?</p>
            <div class="confirm-actions">
              <button @click.stop="deleteQueueItem" class="confirm-btn confirm-delete">Delete</button>
              <button @click.stop="cancelDelete" class="confirm-btn confirm-cancel">Cancel</button>
            </div>
          </div>
        </div>
      </teleport>
      <template v-if="activity > 0 && currentQueue">
        <p class="subtitle is-6 queue-episode">
          {{ currentQueue.episodeTitle }}
        </p>
        <p class="subtitle is-6 queue-details">
          {{ currentQueue.quality }} • {{ currentQueue.size }}
        </p>
        <p class="subtitle is-6 queue-client">
          <span>{{ currentQueue.status }}</span>
          <span v-if="currentQueue.timeleft" class="queue-eta">
            • ETA: {{ currentQueue.timeleft }}
          </span>
        </p>
      </template>
      <template v-else-if="item.subtitle && !serverError">
        <p class="subtitle">
          {{ item.subtitle }}
        </p>
      </template>
      <template v-else-if="serverError">
        <p class="subtitle is-6">
          <span class="error">Connection error</span>
        </p>
      </template>
      <template v-else>
        <p class="subtitle is-6">
          <span class="idle">No active queue items</span>
        </p>
      </template>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

const V3_API = "/api/v3";
const LEGACY_API = "/api";

export default {
  name: "Sonarr",
  mixins: [service],
  props: {
    item: Object,
  },
  data: () => {
    return {
      activity: null,
      missing: null,
      warnings: null,
      errors: null,
      serverError: false,
      queueData: null,
      showDeleteConfirm: false,
    };
  },
  computed: {
    apiPath() {
      return this.item.legacyApi ? LEGACY_API : V3_API;
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
    currentQueue() {
      if (!this.queueData || !this.queueData.records || this.queueData.records.length === 0) {
        return null;
      }
      // Get the first item in the queue
      const queue = this.queueData.records[0];
      const series = queue.series || {};
      const episode = queue.episode || {};
      const size = queue.size || 0;
      const downloadClient = queue.downloadClient || "Unknown client";
      const status = queue.status || "Processing";
      const quality = queue.quality?.quality?.name || "Unknown quality";

      // Format episode title with series name
      const episodeTitle = series.title
        ? `${series.title} - S${String(episode.seasonNumber || 0).padStart(2, '0')}E${String(episode.episodeNumber || 0).padStart(2, '0')}`
        : queue.title || "Unknown Episode";

      // Format status message
      let statusMessage = "";
      if (status.toLowerCase().includes('download')) {
        // Map qBittorrent to VueTorrent for display
        statusMessage = downloadClient === "qBittorrent" ? "VueTorrent" : downloadClient;
      } else if (status.toLowerCase().includes('import')) {
        statusMessage = "Importing...";
      } else {
        statusMessage = status;
      }

      return {
        episodeTitle: episodeTitle,
        status: statusMessage,
        quality: quality,
        size: this.formatSize(size),
        timeleft: queue.timeleft || queue.estimatedCompletionTime ? this.formatTime(queue.timeleft || queue.estimatedCompletionTime) : null,
        id: queue.id,
      };
    },
    displayItem() {
      // Remove tag from DOM when queue is active
      if (this.activity > 0 && this.currentQueue) {
        const { tag, tagstyle, ...itemWithoutTag } = this.item;
        return itemWithoutTag;
      }
      return this.item;
    },
  },
  created: function () {
    const checkInterval = parseInt(this.item.checkInterval, 10) || 0;
    if (checkInterval > 0) {
      setInterval(() => this.fetchConfig(), checkInterval);
    }

    this.fetchConfig();
  },
  methods: {
    fetchConfig: function () {
      const handleError = (e) => {
        console.error(e);
        this.serverError = true;
      };
      this.fetch(`${this.apiPath}/health?apikey=${this.item.apikey}`)
        .then((health) => {
          this.warnings = health.filter((h) => h.type === "warning").length;
          this.errors = health.filter((h) => h.type === "errors").length;
        })
        .catch(handleError);
      this.fetch(`${this.apiPath}/queue?apikey=${this.item.apikey}`)
        .then((queue) => {
          this.activity = 0;
          this.queueData = queue;

          if (this.item.legacyApi) {
            for (var i = 0; i < queue.length; i++) {
              if (queue[i].series) {
                this.activity++;
              }
            }
          } else {
            this.activity = queue.totalRecords;
          }
        })
        .catch(handleError);
      this.fetch(`${this.apiPath}/wanted/missing?apikey=${this.item.apikey}`)
        .then((missing) => {
          this.missing = missing.totalRecords;
        })
        .catch(handleError);
    },
    formatSize(bytes) {
      if (!bytes) return "0 B";
      const units = ["B", "KB", "MB", "GB", "TB"];
      let size = bytes;
      let unitIndex = 0;

      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }

      return `${size.toFixed(1)} ${units[unitIndex]}`;
    },
    formatTime(timeString) {
      if (!timeString) return null;
      // Sonarr provides time in format like "00:05:23" or ISO date
      if (timeString.includes(":")) {
        const parts = timeString.split(":");
        const hours = parseInt(parts[0]);
        const minutes = parseInt(parts[1]);

        if (hours > 0) {
          return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
      }
      // Handle ISO date format
      try {
        const date = new Date(timeString);
        const now = new Date();
        const diffMs = date - now;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 60) {
          return `${diffMins}m`;
        }
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return `${hours}h ${mins}m`;
      } catch {
        return timeString;
      }
    },
    confirmDelete: function () {
      this.showDeleteConfirm = true;
    },
    cancelDelete: function () {
      this.showDeleteConfirm = false;
    },
    deleteQueueItem: async function () {
      try {
        if (!this.currentQueue?.id) {
          console.error('No queue item ID available for deletion');
          return;
        }
        // Sonarr API: DELETE /api/v3/queue/{id}
        try {
          await this.fetch(`${this.apiPath}/queue/${this.currentQueue.id}?apikey=${this.item.apikey}`, {
            method: 'DELETE',
          });
        } catch (e) {
          // DELETE returns empty response, which is normal - ignore JSON parse errors
          if (e.message && e.message.includes('JSON')) {
            // Deletion successful, empty response is expected
          } else {
            throw e; // Re-throw if it's a different error
          }
        }
        this.showDeleteConfirm = false;
        // Fetch the latest status to confirm deletion
        await this.fetchConfig();
      } catch (e) {
        console.error('Failed to delete queue item:', e);
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

    &.activity {
      background-color: #4fb5d6;
    }

    &.missing {
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

.queue-episode {
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
  margin-bottom: 0.25em !important;
}

.queue-client {
  color: #4fb5d6;
  margin-bottom: 0 !important;
  font-size: 0.85em;
  font-weight: 600;

  .queue-eta {
    color: #f39c12;
    font-weight: 500;
  }
}

.queue-details {
  color: #9d00ff;
  margin-bottom: 0.25em !important;
  font-size: 0.85em;
  font-weight: 500;
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
