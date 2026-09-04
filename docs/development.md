# Development

If you want to contribute to Homer, please read the [contributing guidelines](https://github.com/bastienwirtz/homer/blob/main/CONTRIBUTING.md) first. 

```sh
pnpm install
pnpm dev
```

## Custom services

Custom services are small VueJs component (see `src/components/services/`) that add little features to a classic, "static", dashboard item. It should be very simple.
A dashboard can contain a lot of items, so performance is very important. 

Each service must bind the `item` [property](https://vuejs.org/v2/guide/components-props.html) to the [`Generic`](https://github.com/bastienwirtz/homer/blob/main/src/components/services/Generic.vue) component, which owns the card layout.

```Vue
<Generic :item="item" :subtitle="rttLabel" :status="reachabilityStatus()" :badges="badges" />
```

- **`subtitle`** (string): the subtitle line. A config `subtitle` wins over it.
- **`status`** (`{ state, label }`): the chip on the right. `state` is `online`, `offline`, `warning`, `busy` or `unknown`; `label` is optional.
- **`badges`** (`[{ key, label, value, tone }]`): the counters along the top. `tone` is `info`, `success`, `warning`, `danger`, `accent` or `neutral`; `label` is the tooltip. Empty values, zeros (unless `showZero: true`) and any `key` in the item's `hide` are dropped, and counts cap at `99+`.

The `icon`, `subtitle`, `aside` and `badges` slots take richer content, each replacing its zone.

A card must surface an API failure exactly once: through its status chip if it has one, otherwise with a `connectionBadge()`.

> [!IMPORTANT]
> `pnpm lint` enforces this: a single `<Generic>` root, known slots, known `tone` / `state` values, no redeclared `item` prop, no `created()` that only wires `autoUpdateMethod`, a declared `serverError`, and no card restyling the shared chrome. Name a lookup table `_STATE` or `_TONE` in SCREAMING_CASE to have its values checked too.

### Fetching data

Any service consuming an API must use the [`service`](https://github.com/bastienwirtz/homer/blob/main/src/mixins/service.js) mixin and its `this.fetch(path, init, json)` helper instead of the native `fetch`. The mixin takes care of everything the user can configure:

- **URL**: `path` is appended to the service endpoint (`item.endpoint`, or `item.url`), so it only needs the part that follows it.
- **Headers**: pass the service ones (an API key, an `Authorization` header, ...) as `init.headers`. The mixin layers them over the user's `proxy.headers` and item `headers`, so never read those yourself. If both set the same header, the service value wins.
- **Credentials**: `proxy.useCredentials` and its per-item override are applied for you.
- **Response**: returned as parsed JSON, or as text when `json` is `false`.
- **Loading and refresh**: name the loading method `fetchData()`. The mixin runs it on create and on the `updateIntervalMs` schedule. To pick a method at runtime, set `this.autoUpdateMethod` in the card's own `created()` (see `PiHole`).
- **Errors**: wrap the requests in `this.load(...)`, which logs any failure and sets `this.serverError`. Declare `serverError: null` in `data`; `null` means "not loaded yet".
- **Card helpers**: `reachabilityStatus()` and `connectionBadge()` build the chip and error pill from `serverError`; `versionSubtitle`, `requireConfig("apikey")` and `isValueShown(key)` complete the mixin.
- **Formatting**: `capCount(value, max)`, `displayRate(bytesPerSecond)`, `displaySize(bytes)` and `displayDuration(seconds)` live in [`@/utils/format.js`](https://github.com/bastienwirtz/homer/blob/main/src/utils/format.js), not on the mixin. They are pure functions, so import them where you need them. A template cannot see an import, so a card calling one from its markup exposes it through `methods` (see `OctoPrint`).

> [!NOTE]
> Some services cannot use `this.fetch`: `OpenWeather` talks to a third-party public API and `Rtorrent` to an XML-RPC host. `Rtorrent` still uses the mixin for everything else, so follow it if you need a custom transport. `OpenWeather` uses none of it and is not a model for anything.

### Skeleton

```Vue
<template>
  <Generic :item="item" :subtitle="subtitle" :badges="badges">
    <template #icon>
      <!-- left area, the item logo or icon by default -->
    </template>
    <template #subtitle>
      <!-- subtitle line, for content richer than the `subtitle` prop -->
    </template>
    <template #aside>
      <!-- right area, the `status` chip by default -->
    </template>
    <template #badges>
      <!-- top band, the `badges` counters by default -->
    </template>
  </Generic>
</template>

<script>
import Generic from "./Generic.vue";
import service from "@/mixins/service.js";

export default {
  name: "MyNewService",
  mixins: [service],
  components: {
    Generic,
  },
  data: () => ({
    stats: null,
    serverError: null,
  }),
  computed: {
    subtitle() {
      return this.stats && `${this.stats.total} things`;
    },
    badges() {
      return [
        { key: "errors", label: "Error", value: this.stats?.errors, tone: "danger" },
        this.connectionBadge(),
      ];
    },
  },
  methods: {
    fetchData() {
      const headers = this.item.apikey
        ? { "X-Api-Key": this.item.apikey }
        : {};

      return this.load(
        this.fetch("/api/stats", { headers }).then((stats) => {
          this.stats = stats;
        }),
      );
    },
  },
};
</script>
```

## Themes

Themes are meant to be simple customization (written in [scss](https://sass-lang.com/documentation/syntax)).
To add a new theme, just add a file in the theme directory, and put all style in the `body #app.theme-<name>` scope. Then import it in the main style file.

```scss
// `src/assets/themes/my-awesome-theme.scss`
body #app.theme-my-awesome-theme. { ... }
```

```scss
// `src/assets/app.scss`
// Themes import
@import "./themes/sui.scss";
...
@import "./themes/my-awesome-theme.scss";
```
