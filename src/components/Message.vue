<template>
  <article v-if="shouldShowMessage" class="message" :class="message.style">
    <div v-if="message.title || message.icon" class="message-header">
      <p>
        <i v-if="message.icon" :class="`fa-fw ${message.icon}`"></i>
        {{ message.title }}
      </p>
    </div>
    <div
      v-if="message.content"
      class="message-body"
      v-html="message.content"
      :style="contentStyle"
    ></div>
  </article>
</template>

<script>
import DOMPurify from 'dompurify';

export default {
  name: 'Message',
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      message: {
        title: '',
        style: '',
        content: '',
        icon: '',
      },
    };
  },
  computed: {
    shouldShowMessage() {
      return !!(this.message.title || this.message.content);
    },
    contentStyle() {
      return {
        wordBreak: 'break-word', // Prevent long words from overflowing
      };
    },
  },
  watch: {
    item: {
      handler(newItem) {
        this.initializeMessage(newItem);
      },
      immediate: true, // Trigger the watcher on component creation
    },
  },
  methods: {
    async initializeMessage(item) {
      this.message = {
        title: item.title || '',
        style: item.style || '',
        content: item.content || '',
        icon: item.icon || '',
      };

      await this.fetchRemoteMessage();

      if (item.refreshInterval) {
        setTimeout(this.fetchRemoteMessage, item.refreshInterval);
      }
    },

    async fetchRemoteMessage() {
      if (!this.item.url) {
        return;
      }

      try {
        let fetchedMessage = await this.downloadMessage(this.item.url);

        if (this.item.mapping) {
          fetchedMessage = this.mapRemoteMessage(fetchedMessage);
        }

        // Update the message object with fetched values, preserving defaults if not provided
        this.message = {
          title: fetchedMessage.title !== undefined ? fetchedMessage.title : this.message.title,
          style: fetchedMessage.style !== undefined ? fetchedMessage.style : this.message.style,
          content: fetchedMessage.content !== undefined ? fetchedMessage.content : this.message.content,
          icon: fetchedMessage.icon !== undefined ? fetchedMessage.icon : this.message.icon,
        };
        // this.$forceUpdate(); // Force component to re-render
      } catch (error) {
        console.error('Failed to fetch message:', error);
      }
    },

    async downloadMessage(url) {
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    },

    mapRemoteMessage(remoteMessage) {
      const mapped = {};
      for (const prop in this.item.mapping) {
        const remoteKey = this.item.mapping[prop];
        if (remoteKey && remoteMessage[remoteKey] !== undefined) {
          mapped[prop] = remoteMessage[remoteKey];
        }
      }
      return mapped;
    },
    sanitizeHTML(html) {
      return DOMPurify.sanitize(html);
    },
  },
};
</script>
