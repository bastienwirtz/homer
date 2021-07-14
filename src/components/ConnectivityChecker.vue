<template>
  <div v-if="offline" class="offline-message">
    <i class="far fa-dizzy"></i>
    <h1>
      You're offline friend.
      <span @click="checkOffline"> <i class="fas fa-redo-alt"></i></span>
    </h1>
  </div>
</template>

<script>
export default {
  name: "ConnectivityChecker",
  data: function () {
    return {
      offline: false,
    };
  },
  created: function () {
    let that = this;
    this.checkOffline();

    document.addEventListener(
      "visibilitychange",
      function () {
        if (document.visibilityState == "visible") {
          that.checkOffline();
        }
      },
      false
    );
  },
  methods: {
    checkOffline: function () {
      let that = this;
      return fetch(window.location.href + "?alive", {
        method: "HEAD",
        cache: "no-store",
      })
        .then(function (response) {
          that.offline = !response.ok;
        })
        .catch(function () {
          that.offline = true;
        })
        .finally(function () {
          that.$emit("network-status-update", that.offline);
        });
    },
  },
};
</script>
