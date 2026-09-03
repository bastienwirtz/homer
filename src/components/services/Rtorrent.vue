<template>
  <Generic :item="item" :badges="badges">
    <template #subtitle>
      <span class="is-family-monospace mr-3">
        <i class="fas fa-download"></i> {{ downRate }}
      </span>
      <span class="is-family-monospace">
        <i class="fas fa-upload"></i> {{ upRate }}
      </span>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import { displayRate } from "@/utils/format.js";

export default {
  name: "RTorrent",
  mixins: [service],
  // Properties for download, upload, torrent count and errors.
  data: () => ({ dl: null, ul: null, count: null, serverError: null }),
  // Computed properties for the rate labels.
  computed: {
    downRate: function () {
      return displayRate(this.dl);
    },
    upRate: function () {
      return displayRate(this.ul);
    },
    badges: function () {
      return [
        {
          key: "torrents",
          label: "Torrents",
          value: this.count,
          tone: "neutral",
        },
        this.connectionBadge(),
      ];
    },
  },
  methods: {
    fetchData: function () {
      if (!this.requireConfig("xmlrpc")) {
        return;
      }

      return this.load(
        this.getRate("throttle.global_up.rate").then((ul) => (this.ul = ul)),
        this.getRate("throttle.global_down.rate").then((dl) => (this.dl = dl)),
        this.getCount(),
      );
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
        headers["Authorization"] =
          `${this.item.username}:${this.item.password}`;
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
