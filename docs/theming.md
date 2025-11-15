# Theming

## Change theme

The default theme can be changed using the yaml configuration file

```yaml
theme: default # 'default', 'walkxcode', or 'neon' see files in 'src/assets/themes'.
```

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
| `link`                | `--link`                | Links color (footer & message), service card icon color  |
| `link-hover`          | `--link-hover`          | Links hover color (footer & message), service card icon hover color |
| `background-image`    | `--background-image`    | page background image url (when used in css, set `url(<image-url>)` instead of just the url. see example below)|


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
