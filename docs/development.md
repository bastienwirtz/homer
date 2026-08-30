# Development

If you want to contribute to Homer, please read the [contributing guidelines](https://github.com/bastienwirtz/homer/blob/main/CONTRIBUTING.md) first. 

```sh
pnpm install
pnpm dev
```

## Custom services

Custom services are small VueJs component (see `src/components/services/`) that add little features to a classic, "static", dashboard item. It should be very simple.
A dashboard can contain a lot of items, so performance is very important. 

The [`Generic`](https://github.com/bastienwirtz/homer/blob/main/src/components/services/Generic.vue) service provides a typical card layout which
you can extend to add specific features. Unless you want a completely different design, extended the generic service is the recommended way. It gives you 3 [slots](https://vuejs.org/v2/guide/components-slots.html#Named-Slots) to extend: `icon`, `content` and `indicator`. 
Each one is **optional**, and will display the usual information if omitted.

Each service must implement the `item` [property](https://vuejs.org/v2/guide/components-props.html) and bind it the Generic component if used.

### Fetching data

Any service consuming an API must use the [`service`](https://github.com/bastienwirtz/homer/blob/main/src/mixins/service.js) mixin and its `this.fetch(path, init, json)` helper instead of the native `fetch`. The mixin takes care of everything the user can configure:

- **URL**: `path` is appended to the service endpoint (`item.endpoint`, or `item.url`), so it only needs the part that follows it.
- **Headers**: pass the service ones (an API key, an `Authorization` header, ...) as `init.headers`. The mixin layers them over the user's `proxy.headers` and item `headers`, so never read those yourself. If both set the same header, the service value wins.
- **Credentials**: `proxy.useCredentials` and its per-item override are applied for you.
- **Response**: returned as parsed JSON, or as text when `json` is `false`.
- **Refresh**: assign the method to re-run to `this.autoUpdateMethod`, the mixin schedules it using `updateIntervalMs`.

> [!NOTE]
> Some services like `OpenWeather` and `Rtorrent` bypass the mixin, respectively for a third-party public API and an XML-RPC host. Don't use them as an example for a new service.

### Skeleton

```Vue
<template>
  <Generic :item="item">
    <template #icon>
      <!-- left area containing the icon -->
    </template>
    <template #content>
      <!-- main area containing the title, subtitle, ... -->
    </template>
    <template #indicator>
      <!-- top right area, empty by default -->
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
  props: {
    item: Object,
  },
  data: () => ({
    stats: null,
  }),
  created() {
    this.autoUpdateMethod = this.fetchStatus;
    this.fetchStatus();
  },
  methods: {
    fetchStatus: async function () {
      const headers = this.item.apikey
        ? { "X-Api-Key": this.item.apikey }
        : {};
      this.stats = await this.fetch("/api/stats", { headers }).catch((e) =>
        console.error(e),
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
