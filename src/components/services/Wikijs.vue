<template>
  <Generic :item="item">
    <template #indicator>
      <div v-if="newVersion" class="status" :class="cssClass">
        {{ newVersion }}
      </div>
    </template>
  </Generic>
</template>

<script>
import Generic from './Generic.vue';
import versionCompare from './../../mixins/versionCompare';

export default {
  name: 'Wikijs',
  props: {
    item: Object,
  },
  components: {
    Generic,
  },
  data: () => ({
    cssClass: '',
    currentVersion: '',
    newVersion: '',
  }),
  computed: {},
  created() {
    this.fetchStatus();
  },
  methods: {
    fetchStatus: async function () {
      const url = `${this.item.url}/graphql`;

      await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
          query: '{ system { info { currentVersion latestVersion } } }',
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + this.item.apikey,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.errors && data.errors.length > 0) {
            console.error(data.errors);
            return;
          }

          this.currentVersion = data.data.system.info.currentVersion;
          this.newVersion = data.data.system.info.latestVersion;

          const result = versionCompare.compare(
            this.currentVersion,
            this.newVersion
          );

          let cssClass = '';
          let message = '';

          if (result == -1) {
            cssClass = 'update-available';
            message = 'A new version is available!';
          } else if (result == 0) {
            cssClass = 'update-to-date';
            message = 'Wiki.js is up-to-date.';
          }

          this.cssClass = cssClass;
          
          if (!this.item.subtitle) {
            this.item.subtitle = message;
          }
        })
        .catch((e) => console.log(e));
    },
  },
};
</script>

<style scoped lang="scss">
.media-left img {
  max-height: 100%;
}
.status {
  font-size: 0.8rem;
  color: var(--text-title);

  &.update-to-date:before {
    background-color: #94e185;
    border-color: #78d965;
    box-shadow: 0 0 5px 1px #94e185;
  }

  &.update-available:before {
    background-color: #c99f40;
    border-color: #a98533;
    box-shadow: 0 0 5px 1px #c99f40;
  }

  &:before {
    content: ' ';
    display: inline-block;
    width: 7px;
    height: 7px;
    margin-right: 10px;
    border: 1px solid #000;
    border-radius: 7px;
  }
}
</style>
