# Development

```sh
# Using yarn (recommended)
yarn install
yarn serve

# **OR** Using npm
npm install
npm run serve
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

## Fetch Options

In order to make your service work with the global `fetchWithCredentials` attribute, you need to include a call to `this.fetchOptions()` as the optional second parameter of your `fetch` call. This allows us to hook in and add global options for all fetch calls as needed.

`fetchOptions()` itself takes an optional object just like the usual `fetch` param, and would conditionally add other options as needed.

### Basic example
```js
fetch(
  `${this.item.url}/api/health?apikey=${this.item.apikey}`,
  this.fetchOptions()
)
```

### Example with other fetch options
```js
fetch(
  `${this.item.url}/api/v2/config`,
  this.fetchOptions({
    headers: { "X-Api-Key": `${this.item.apikey}` },
  })
)
```
