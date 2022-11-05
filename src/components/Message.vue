<template>
  <article v-if="show" class="message" :class="message.style">
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
    ></div>
  </article>
</template>

<script>
export default {
  name: "Message",
  props: {
    item: Object,
  },
  data: function () {
    return {
      message: {},
    };
  },
  created: async function () {
    // Look for a new message if an endpoint is provided.
    this.message = Object.assign({}, this.item);
    await this.getMessage();
  },
  computed: {
    show: function () {
      return this.message.title || this.message.content;
    },
  },
  watch: {
    item: function (item) {
      this.message = Object.assign({}, item);
    },
  },
  methods: {
    getMessage: async function () {
      if (!this.item) {
        return;
      }
      if (this.item.url) {
        let fetchedMessage = await this.downloadMessage(this.item.url);
        if (this.item.mapping) {
          fetchedMessage = this.mapRemoteMessage(fetchedMessage);
        }

        // keep the original config value if no value is provided by the endpoint
        const message = this.message;
        for (const prop of ["title", "style", "content", "icon"]) {
          if (prop in fetchedMessage && fetchedMessage[prop] !== null) {
            message[prop] = fetchedMessage[prop];
          }
        }
        this.message = { ...message }; // Force computed property to re-evaluate
      }

      if (this.item.refreshInterval) {
        setTimeout(this.getMessage, this.item.refreshInterval);
      }
    },

    downloadMessage: function (url) {
      return fetch(url).then(function (response) {
        if (response.status != 200) {
          return;
        }
        return response.json();
      });
    },

    mapRemoteMessage: function (message) {
      let mapped = {};
      // map property from message into mapped according to mapping config (only if field has a value):
      for (const prop in this.item.mapping)
        if (message[this.item.mapping[prop]])
          mapped[prop] = message[this.item.mapping[prop]];
      return mapped;
    },
  },
};
</script>
