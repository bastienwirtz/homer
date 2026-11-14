<template>
  <Generic
    :item="item"
    :subtitle="displayVersion(versionstring)"
    :status="reachabilityStatus()"
    :badges="badges"
  />
</template>

<script>
import service from "@/mixins/service.js";
import { displayVersion } from "@/utils/format.js";

// Protocol sections nest categories; certificates is a flat {total, warnings, errors}.
const PROTOCOLS = ["http", "tcp", "udp"];
const CATEGORIES = ["routers", "services", "middlewares"];

// Indicator badges; key doubles as the hide key.
const COUNTERS = [
  { key: "routers", label: "Routers", tone: "success", cap: false },
  { key: "services", label: "Services", tone: "info", cap: false },
  { key: "middlewares", label: "Middlewares", tone: "accent", cap: false },
  { key: "certificates", label: "Certificates", tone: "success", cap: false },
  { key: "warnings", label: "Warnings", tone: "warning" },
  { key: "errors", label: "Errors", tone: "danger" },
];

export default {
  name: "Traefik",
  mixins: [service],
  data: () => ({
    overview: null,
    serverError: null,
    versionstring: null,
  }),
  computed: {
    counts() {
      if (!this.overview) {
        return {};
      }

      const totals = Object.fromEntries(COUNTERS.map(({ key }) => [key, 0]));
      const entries = [
        ...PROTOCOLS.flatMap((protocol) =>
          CATEGORIES.map((category) => [
            category,
            this.overview[protocol]?.[category],
          ]),
        ),
        ["certificates", this.overview.certificates],
      ];

      for (const [key, entry] of entries) {
        totals[key] += entry?.total || 0;
        totals.warnings += entry?.warnings || 0;
        totals.errors += entry?.errors || 0;
      }
      return totals;
    },
    badges() {
      return COUNTERS.map((counter) => ({
        ...counter,
        value: this.counts[counter.key],
      }));
    },
  },
  methods: {
    displayVersion,
    fetchData: function () {
      let headers = {};
      if (this.item.basic_auth) {
        const encodedCredentials = btoa(this.item.basic_auth);
        headers["Authorization"] = `Basic ${encodedCredentials}`;
      }

      const requests = [
        this.fetch("/api/version", { headers }).then((response) => {
          this.versionstring = response.Version;
        }),
      ];

      if (COUNTERS.some(({ key }) => this.isValueShown(key))) {
        requests.push(
          this.fetch("/api/overview", { headers }).then((overview) => {
            this.overview = overview;
          }),
        );
      }

      return this.load(...requests);
    },
  },
};
</script>
