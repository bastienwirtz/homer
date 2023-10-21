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
    if (/t=\d+/.test(window.location.href)) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    let that = this;
    this.checkOffline();

    document.addEventListener(
      "visibilitychange",
      function () {
        if (document.visibilityState == "visible") {
          that.checkOffline();
        }
      },
      false,
    );
    window.addEventListener(
      "online",
      function () {
        that.checkOffline();
      },
      false,
    );
    window.addEventListener(
      "offline",
      function () {
        this.offline = true;
      },
      false,
    );
  },
  methods: {
    checkOffline: function () {
      if (!navigator.onLine) {
        this.offline = true;
        return;
      }

      // extra check to make sure we're not offline
      let that = this;
      const urlPath = window.location.pathname.replace(/\/+$/, "");
      const aliveCheckUrl = `${
        window.location.origin
      }${urlPath}/index.html?t=${new Date().valueOf()}`;
      return fetch(aliveCheckUrl, {
        method: "HEAD",
        cache: "no-store",
        redirect: "manual",
      })
        .then(function (response) {
          // opaqueredirect means request has been redirected, to auth provider probably
          if (
            (response.type === "opaqueredirect" && !response.ok) ||
            [401, 403].indexOf(response.status) != -1
          ) {
            window.location.href = aliveCheckUrl;
          }
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
