<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <span v-if="error" class="error">An error has occurred.</span>
        <template v-else>
          <span class="down">
            <i class="fas fa-download"></i> {{ downRate }}
          </span>
          <span class="up"> <i class="fas fa-upload"></i> {{ upRate }} </span>
        </template>
      </p>
    </template>
    <template #indicator>
      <span v-if="!error" class="count"
        >{{ count }}
        <template v-if="count === 1">torrent</template>
        <template v-else>torrents</template>
      </span>
    </template>
  </Generic>
</template>

<script>
import Generic from "./Generic.vue";

// Units to add to download and upload rates.
const units = ["B", "kiB", "MiB", "GiB"];

// Take the rate in bytes and keep dividing it by 1k until the lowest
// value for which we have a unit is determined. Return the value with
// up to two decimals as a string and unit/s appended.
const displayRate = (rate) => {
  let i = 0;

  while (rate > 1000 && i < units.length) {
    rate /= 1000;
    i++;
  }

  return (
    Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
      rate || 0,
    ) + ` ${units[i]}/s`
  );
};

export default {
  name: "rTorrent",
  props: { item: Object },
  components: { Generic },
  // Properties for download, upload, torrent count and errors.
  data: () => ({ dl: null, ul: null, count: null, error: null }),
  // Computed properties for the rate labels.
  computed: {
    downRate: function () {
      return displayRate(this.dl);
    },
    upRate: function () {
      return displayRate(this.ul);
    },
  },
  created() {
    // Set intervals if configured so the rates and/or torrent count
    // will be updated.
    const rateInterval = parseInt(this.item.rateInterval, 10) || 0;
    const torrentInterval = parseInt(this.item.torrentInterval, 10) || 0;

    if (rateInterval > 0) {
      setInterval(() => this.fetchRates(), rateInterval);
    }

    if (torrentInterval > 0) {
      setInterval(() => this.fetchCount(), torrentInterval);
    }

    // Fetch the initial values.
    this.fetchRates();
    this.fetchCount();
  },
  methods: {
    // Perform two calls to the XML-RPC service and fetch download
    // and upload rates. Values are saved to the `ul` and `dl`
    // properties.
    fetchRates: async function () {
      this.getRate("throttle.global_up.rate")
        .then((ul) => (this.ul = ul))
        .catch(() => (this.error = true));

      this.getRate("throttle.global_down.rate")
        .then((dl) => (this.dl = dl))
        .catch(() => (this.error = true));
    },
    // Perform a call to the XML-RPC service to fetch the number of
    // torrents.
    fetchCount: async function () {
      this.getCount().catch(() => (this.error = true));
    },
    // Fetch a numeric value from the XML-RPC service by requesting
    // the specified method name and parsing the XML. The response
    // is expected to adhere to the structure of a single numeric
    // value.
    getRate: async function (methodName) {
      return this.getXml(methodName).then((xml) =>
        parseInt(
          xml.getElementsByTagName("value")[0].firstChild.textContent,
          10,
        ),
      );
    },
    // Fetch the numer of torrents by requesting the download list
    // and counting the number of entries therein.
    getCount: async function () {
      return this.getXml("download_list").then((xml) => {
        const arrayEl = xml.getElementsByTagName("array");
        this.count = arrayEl
          ? arrayEl[0].getElementsByTagName("value").length
          : 0;
      });
    },
    // Perform a call to the XML-RPC service and parse the response
    // as XML, which is then returned.
    getXml: async function (methodName) {
      const headers = { "Content-Type": "text/xml" };

      if (this.item.username && this.item.password) {
        headers[
          "Authorization"
        ] = `${this.item.username}:${this.item.password}`;
      }

      return fetch(`${this.item.xmlrpc.replace(/\/$/, "")}/RPC2`, {
        method: "POST",
        headers,
        body: `<methodCall><methodName>${methodName}</methodName></methodCall>`,
      })
        .then((response) => {
          if (!response.ok) {
            throw Error(response.statusText);
          }

          return response.text();
        })
        .then((text) =>
          Promise.resolve(new DOMParser().parseFromString(text, "text/xml")),
        );
    },
  },
};
</script>

<style scoped lang="scss">
.error {
  color: #e51111 !important;
}
.down {
  margin-right: 1em;
}
.count {
  color: var(--text);
  font-size: 0.8em;
}
</style>
