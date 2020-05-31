<template>
  <article v-if="item" class="message" :class="item.style">
    <div v-if="item.title" class="message-header">
      <p>{{ item.title }}</p>
    </div>
    <div v-if="item.content" class="message-body" v-html="item.content"></div>
  </article>
</template>

<script>
export default {
  name: "Message",
  props: {
    item: Object,
  },
  created: function () {
    // Look for a new message if an endpoint is provided.
    let that = this;
    if (this.item && this.item.url) {
      this.getMessage(this.item.url).then(function (message) {
        // keep the original config value if no value is provided by the endpoint
        for (const prop of ["title", "style", "content"]) {
          if (prop in message && message[prop] !== null) {
            that.item[prop] = message[prop];
          }
        }
      });
    }
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
