# Development

If you want to contribute to Homer, please read the [contributing guidelines](https://github.com/bastienwirtz/homer/blob/main/CONTRIBUTING.md) first. 

```sh
# Using yarn (recommended)
yarn install
yarn serve

# **OR** Using npm
npm install
npm run serve
```

## Custom services

Custom services are small VueJs component (see `src/components/services/`) that add little features to a classic, "static", dashboard item. It should be very simple.
A dashboard can contain a lot of items, so performance is very important. 

The [`Generic`](https://github.com/bastienwirtz/homer/blob/main/src/components/services/Generic.vue) service provides a typical card layout which
you can extend to add specific features. Unless you want a completely different design, extended the generic service is the recommended way. It gives you 3 [slots](https://vuejs.org/v2/guide/components-slots.html#Named-Slots) to extend: `icon`, `content` and `indicator`. 
Each one is **optional**, and will display the usual information if omitted.

Each service must implement the `item` [property](https://vuejs.org/v2/guide/components-props.html) and bind it the Generic component if used.

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

export default {
  name: "MyNewService",
  props: {
    item: Object,
  },
  components: {
    Generic,
  }
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


## Documentation

### Install Python dependencies

Homer's documentation is built using
[Material for MkDocs](https://squidfunk.github.io/mkdocs-material/). To get
started, you'll need Python 3 installed on your machine and set up your local
environment.

```sh
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Preview local copy

MkDocs comes with a command-line utility for building and serving the static
documentation site every time you save a file. To launch it, run the `serve`
command.

```sh
mkdocs serve
```

Your local version of the docs site will now be available at
http://localhost:8000/.
