## Developement

```sh
# Using yarn (recommended)
yarn install
yarn serve

# **OR** Using npm
npm install
npm run serve
```

### Themes

Themes are meant to be simple customization (written in [scss](https://sass-lang.com/documentation/syntax)).
To addd a new theme, just add a file in the theme directory, and put all style in the `body #app.theme-<name>` scope. Then import it in the main style file.

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
