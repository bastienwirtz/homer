# Theming

## Change theme

The default theme can be changed using the yaml configuration file

```yaml
theme: default # 'default', 'walkxcode', or 'neon' see files in 'src/assets/themes'.
```

## Favicon

Use your own favicon by changing the icons files in the `assets/icons` directory. More information on the format [here](https://github.com/bastienwirtz/homer/blob/main/public/assets/icons/README.md).

## Colors and background customization

Default colors and background can be customized for each theme variant (light and dark), using either the yaml config file, or the css variables (see "Additional stylesheets" below).

### Available options

| yaml | css | description |
| --------------------- | ----------------------- | --- |
| `highlight-primary`   | `--highlight-primary`   | header background, group title icons       |
| `highlight-secondary` | `--highlight-secondary` | navbar background, default tag color |
| `highlight-hover`     | `--highlight-hover`     | navbar links hover, search input background |
| `background`          | `--background`          | page background color |
| `card-background`     | `--card-background`     | service card background color |
| `text`                | `--text`                | main text color |
| `text-header`         | `--text-header`         | header text color |
| `text-title`          | `--text-title`          | service card title color |
| `text-subtitle`       | `--text-subtitle`       | service card subtitle color  |
| `card-shadow`         | `--card-shadow`         | Service card `box-shadow` |
| `link`                | `--link`                | Links color (footer & message), service card icon color (unless the item carries a `highlight-*` class) |
| `link-hover`          | `--link-hover`          | Links hover color (footer & message), service card icon hover color |
| `background-image`    | `--background-image`    | page background image url (when used in css, set `url(<image-url>)` instead of just the url. see example below)|

Service card colors are shared by every card. Set them under both `light` and `dark` unless you want them to differ.

| yaml | css | description |
| --------------------- | ----------------------- | --- |
| `status-online`       | `--status-online`       | status dot, reachable and healthy |
| `status-offline`      | `--status-offline`      | status dot, down or errored |
| `status-warning`      | `--status-warning`      | status dot, needs attention |
| `status-busy`         | `--status-busy`         | status dot, working (pulsing) |
| `status-unknown`      | `--status-unknown`      | status dot, state not known |
| `badge-info`          | `--badge-info`          | badge, activity counters |
| `badge-success`       | `--badge-success`       | badge, healthy totals |
| `badge-warning`       | `--badge-warning`       | badge, warnings |
| `badge-danger`        | `--badge-danger`        | badge, errors |
| `badge-accent`        | `--badge-accent`        | badge, secondary counters |
| `badge-neutral`       | `--badge-neutral`       | badge, plain totals |
| `badge-text`          | `--badge-text`          | badge text color |

Card geometry is not part of `colors:`, but the same custom properties can be overridden from an additional stylesheet (see below). Defaults are in `assets/components/base.scss`: `--card-height` (`85px`), `--card-icon-size` (`48px`), `--card-pad` (`1.3rem`), `--card-pad-block` (`0.75rem`), `--card-radius` (`0.75rem`) and `--card-lift` (`3px`, the hover rise).

The icon is pinned `--card-pad` from the top of the card, so keep `--card-height` above `--card-pad` plus `--card-icon-size` (about `70px` at the defaults) or it overflows the bottom. Lower `--card-icon-size` to go shorter than that.

YAML example

```yml
colors:
  light:
    highlight-primary: "#3367d6"
    background-image: "assets/your/light/bg.webp"
    ...
  dark:
    highlight-primary: "#3367d6"
    background-image: "assets/your/dark/bg.webp"
    ...
```

CSS example

```css
.light {
    --highlight-primary: #3367d6;
    --background-image: url("assets/your/light/bg.webp");
    ...
}

.dark {
    --highlight-primary: #3367d6;
    --background-image: url("assets/your/dark/bg.webp");
    ...
}
```

## Additional stylesheets

One or more additional stylesheets can be loaded to add or override style from the current theme. Use the 'stylesheet' option in the yaml configuration file to load your own CSS file.

```yml
stylesheet:
   - "assets/custom.css"
```

### Customization example

#### Max width modification

```css
body #main-section .container {
    max-width: 2000px; // adjust to your needs (eg: calc(100% - 100px), none, ...)
}
```

#### Background gradient

```css
#app {
    height: 100%;
    background: linear-gradient(90deg, #5c2483, #0095db);
}
```
