<template>
  <div>
    <div class="card" :class="item.class">
      <a :href="item.url" :target="item.target" rel="noreferrer">
        <div class="card-content">
          <div class="media">
            <div v-if="item.logo" class="media-left">
              <figure class="image is-48x48">
                <img :src="item.logo" :alt="`${item.name} logo`" />
              </figure>
            </div>
            <div v-if="item.icon" class="media-left">
              <figure class="image is-48x48">
                <i style="font-size: 35px" :class="['fa-fw', item.icon]"></i>
              </figure>
            </div>
            <div class="media-content">
              <p class="title is-4">{{ item.name }}</p>
              <p class="subtitle is-6">
                <template v-if="item.subtitle">
                  {{ item.subtitle }}
                </template>
                <template v-else-if="content">
                  {{ content.message }}
                </template>
              </p>
            </div>
            <div v-if="content" class="status" :class="content.cssClass">
              {{ content.newVersion }}
            </div>
          </div>
          <div class="tag" :class="item.tagstyle" v-if="item.tag">
            <strong class="tag-text">#{{ item.tag }}</strong>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>

<script>
import versionCompare from './../../mixins/versionCompare';

export default {
  name: 'Wikijs',
  props: {
    item: Object,
  },
  data: () => ({
    content: {
      cssClass: '',
      message: '',
      currentVersion: '',
      newVersion: '',
    },
  }),
  computed: {},
  created() {
    this.fetchStatus();
  },
  methods: {
    fetchStatus: async function () {
      const url = `${this.item.url}/graphql`;

      this.content = await fetch(url, {
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

          const currentVersion = data.data.system.info.currentVersion;
          const newVersion = data.data.system.info.latestVersion;
          const result = versionCompare.compare(currentVersion, newVersion);
          let cssClass = '';
          let message = '';

          if (result == -1) {
            cssClass = 'update-available';
            message = 'A new version is available!';
          }
          else if (result == 0) {
            cssClass = 'update-to-date';
            message = 'Wiki.js is up-to-date.';
          }

          return {
            cssClass,
            message,
            currentVersion,
            newVersion,
          };
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
