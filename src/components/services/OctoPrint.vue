<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle && printerstatus == null">
          {{ item.subtitle }}
        </template>
        <template v-else-if="api" && printerstatus !="null">
         Status: {{ printerstatus }}<template v-if="printerstatus == 'Printing'">: {{ printerprogress }}% <br /> ({{ printtime }}/{{  printtimeleft }} left)</template>
        </template>

      </p>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import Generic from "./Generic.vue";

export default {
  name: "OctoPrint",
  mixins: [service],
  props: {
    item: Object,
  },
  components: {
    Generic,
  },
  data: () => ({
    api: {
      code: true,
      state: "",
      job: {
        file: {
          display: "",
        },
      },
      progress: {
        state: "",
        completion: 0,
        printTimeLeft: 0,
        printTime: 0,
      },
    },
  }),
  computed: {
    printerstatus: function () {
      if (this.api && this.api.code != false) {
        return this.api.state;
      } else if (this.api.code != false) {
        return "Offline";
      }
      return null;
    },
    printerprogress: function () {
      if (this.api) {
        return this.api.progress.completion.toFixed();
      }
      return 0;
    },
    printtime: function () {
        if (!this.api) {
            return 0;
        }
        const timestamp = this.api.progress.printTime;
        let hours = Math.floor(timestamp / 60 / 60);
        let minutes = Math.floor(timestamp / 60) - hours * 60;
        let seconds = timestamp % 60;
        if (hours < 10) {
          hours = "0" + hours;
        }
        if (minutes < 10) {
          minutes = "0" + minutes;
        }
        if (seconds < 10) {
          seconds = "0" + seconds;
        }
        return ${hours}:${minutes};
    },
    printtimeleft: function () {
        if (!this.api) {
            return 0;
        }
        const timestamp = this.api.progress.printTimeLeft;
        let  hours = Math.floor(timestamp / 60 / 60);
        let minutes = Math.floor(timestamp / 60) - hours * 60;
        let seconds = timestamp % 60;
        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        return ${hours}:${minutes};
    },
  },
  created() {
    this.fetchStatus();
  },
  methods: {
    fetchStatus: async function () {
      if (this.item.apikey) {
        try {
          this.api = await this.fetch(`api/job?apikey=${this.item.apikey}`);
        } catch (e) {
          console.error(e);
          this.api.code = false;
        }
      }
    },
  },
};
</script>

<style scoped lang="scss">
.media-left {
  .image {
    display: flex;
    align-items: center;
  }

  img {
    max-height: 100%;
  }
}
.status {
  font-size: 0.8rem;
  color: var(--text-title);

  &.firing:before {
    background-color: #d65c68;
    border-color: #e87d88;
    box-shadow: 0 0 5px 1px #d65c68;
  }

  &.pending:before {
    background-color: #e8bb7d;
    border-color: #d6a35c;
    box-shadow: 0 0 5px 1px #e8bb7d;
  }

  &.inactive:before {
    background-color: #8fe87d;
    border-color: #70d65c;
    box-shadow: 0 0 5px 1px #8fe87d;
  }

  &:before {
    content: " ";
    display: inline-block;
    width: 7px;
    height: 7px;
    margin-right: 10px;
    border: 1px solid #000;
    border-radius: 7px;
  }
}
</style>
