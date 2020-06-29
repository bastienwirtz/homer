<template>
  <article v-if="show" class="message" :class="message.style">
    <div v-if="message.title" class="message-header">
      <p>{{ message.title }}</p>
    </div>
    <div v-if="message.content" class="message-body" v-html="message.content"></div>
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
      show: false,
      message: {},
    };
  },
  created: async function () {
    // Look for a new message if an endpoint is provided.
    this.message = Object.assign({}, this.item);
    if (this.item && this.item.url) {
      const fetchedMessage = await this.getMessage(this.item.url);
      // keep the original config value if no value is provided by the endpoint
      for (const prop of ["title", "style", "content"]) {
        if (prop in fetchedMessage && fetchedMessage[prop] !== null) {
          this.message[prop] = fetchedMessage[prop];
        }
      }
    }
    this.show = this.message.title || this.message.content;
  },
  methods: {
    getMessage: function (url) {
      return fetch(url).then(function (response) {
        if (response.status != 200) {
          return;
        }
        return response.json();
      });
    },
  },
};
</script>
