<template>
  <div>
    <div :class="item.class" @click="openDialog" :style="containerStyle">
      <div class="card">
        <div class="card-header" v-if="item.name">
          <p class="card-header-title title">{{ item.name }}</p>
        </div>
        <div class="card-image">
          <video v-if="this.connected" autoplay muted ref="cardPlayer"></video>
          <div class="container" v-else>
            <progress class="progress is-small is-dark" max="100">30%</progress>
          </div>
        </div>
      </div>
    </div>
    <VDialog v-model="showDialog">
      <template v-slot:content>
        <div class="modal-content video-container">
          <video autoplay muted ref="dialogPlayer"></video>
        </div>
      </template>
    </VDialog>
  </div>
</template>
<script>
import JMuxer from "jmuxer";
import VDialog from "../VDialog.vue";
export default {
  name: "Surveillance",
  props: {
    item: Object,
  },
  components: { VDialog },
  data: function () {
    return {
      connected: false, // socket connected or not
      showDialog: false,
    };
  },
  mounted: function () {
    this.$players = new Map();

    console.log(`connect ${this.item.url}`);
    this.ws = new WebSocket(this.item.url);
    this.ws.binaryType = "arraybuffer";
    this.ws.addEventListener("open", this.onSocketOpen);
    this.ws.addEventListener("error", this.onSocketError);
    this.ws.addEventListener("message", this.onSocketData);
  },
  beforeUnmount: function () {
    this.destroyPlayers();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  },
  methods: {
    onSocketOpen: function () {
      this.connected = true;
      this.$nextTick(function () {
        this.createPlayer("cardPlayer");
      });
    },
    onSocketError: function () {
      this.connected = false;
      this.destroyPlayers();
    },
    onSocketData: function (event) {
      this.$players.forEach(function (player) {
        const data = new Uint8Array(event.data);
        player.feed({ video: data });
      });
    },
    openDialog: function () {
      if (this.connected) {
        this.showDialog = true;
      }
    },
    parse: function (data) {
      let input = new Uint8Array(data),
        video = input;
      return {
        video: video,
      };
    },
    createPlayer: function (refName) {
      console.log(`create ${refName} player`);
      this.$players.set(
        refName,
        new JMuxer({
          node: this.$refs[refName],
          mode: "video",
          flushingTime: 0,
          fps: 30,
          debug: false,
        })
      );
    },
    destroyPlayer: function (refName) {
      console.log(`destroy ${refName} player`);
      let p = this.$players.get(refName);
      if (p) {
        p.destroy();
        this.$players.delete(refName);
      }
    },
    destroyPlayers: function () {
      this.$players.forEach(function (player) {
        player.destroy();
      });
      this.$players.clear();
    },
  },
  computed: {
    containerStyle: function () {
      return { cursor: this.connected ? "pointer" : "wait" };
    },
  },
  watch: {
    showDialog: function (newVal) {
      if (newVal) {
        this.createPlayer("dialogPlayer");
      } else {
        this.destroyPlayer("dialogPlayer");
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.container video {
  display: block;
}
.title {
  color: var(--text-title);
}

.video-container {
  width: 80%;
  display: flex;
  justify-content: center;
  align-content: center;
}
</style>
