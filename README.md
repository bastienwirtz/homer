# Homer

A dead simple static **HOM**epage for your serv**ER** to keep your services on hand, from a simple `yaml` configuration file.

**Check out the live demo [here](https://homer-demo.netlify.app).**

It supports keyboard shortcuts:

- `/` Start searching.
- `Escape` Stop searching.
- `Enter` Open the first matching result (respects the bookmark's `_target` property).
- `Alt`/`Option` + `Enter` Open the first matching result in a new tab.

If you need authentication support, you're on your own (it can be secured using a web server auth module or exposing it only through a VPN network / SSH tunnel, ...)

![screenshot](https://raw.github.com/bastienwirtz/homer/master/screenshot.png)

## Roadmap

- [ ] Add more themes.
- [ ] Add support for custom service card (add custom feature to some service / app link)
- [x] Colors / theme customization
- [x] Enable PWA support (making possible to "install" - add to homescreen - it)
- [x] Improve maintainability (external library import & service workers cached file list.)

## Usage

### Using docker

```sh
docker run -p 8080:8080 -v /your/local/config.yml:/www/config.yml -v /your/local/assets/:/www/assets b4bz/homer:latest
```

### Manually

Homer is a static page that need to be generated from the source in this repository.
Use the folowing command to build the project:

```sh
# Using yarn (recommended)
yarn install
yarn build

# **OR** Using npm
npm install
npm run build
```

Then your dashboard is ready to use in the `/dist` directory.
The `dist` directory is meant to be served by an HTTP server, so **it will not work if you open dist/index.html directly over file:// protocol**.

Use it like any static HTML content (use a webserver or open the html index directly).

## Development

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

## Configuration

Title, icons, links, colors, and services can be configured in the `config.yml` file (located in project root directory once built, or in the `public/` directory in developement mode), using [yaml](http://yaml.org/) format.

```yaml
---
# Homepage configuration
# See https://fontawesome.com/icons for icons options

title: "App dashboard"
subtitle: "Homer"
logo: "assets/homer.png"
# Alternatively a fa icon can be provided:
# icon: "fas fa-skull-crossbones"

header: true # Set to false to hide the header
footer: '<p>Created with <span class="has-text-danger">❤️</span> with <a href="https://bulma.io/">bulma</a>, <a href="https://vuejs.org/">vuejs</a> & <a href="https://fontawesome.com/">font awesome</a> // Fork me on <a href="https://github.com/bastienwirtz/homer"><i class="fab fa-github-alt"></i></a></p>' # set false if you want to hide it.header:

# Optional theming
theme: default # 'default' or one of the theme available in 'src/assets/themes'.

# Here is the exaustive list of customization parameters
# However all value are optional and will fallback to default if not set.
# if you want to change only some of the colors, feel free to remove all unused key.
colors:
  light:
    highlight-primary: "#3367d6"
    highlight-secondary: "#4285f4"
    highlight-hover: "#5a95f5"
    background: "#f5f5f5"
    card-background: "#ffffff"
    text: "#363636"
    text-header: "#424242"
    text-title: "#303030"
    text-subtitle: "#424242"
    card-shadow: rgba(0, 0, 0, 0.1)
    link-hover: "#363636"
  dark:
    highlight-primary: "#3367d6"
    highlight-secondary: "#4285f4"
    highlight-hover: "#5a95f5"
    background: "#131313"
    card-background: "#2b2b2b"
    text: "#eaeaea"
    text-header: "#ffffff"
    text-title: "#fafafa"
    text-subtitle: "#f5f5f5"
    card-shadow: rgba(0, 0, 0, 0.4)
    link-hover: "#ffdd57"

# Optional message
message:
  # url: "https://<my-api-endpoint>" # Can fetch information from an endpoint to override value below.
  style: "is-warning"
  title: "Optional message!"
  content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque risus mi, tempus quis placerat ut, porta nec nulla. Vestibulum rhoncus ac ex sit amet fringilla. Nullam gravida purus diam, et dictum felis venenatis efficitur. Aenean ac eleifend lacus, in mollis lectus. Donec sodales, arcu et sollicitudin porttitor, tortor urna tempor ligula."

# Optional navbar
# links: [] # Allows for navbar (dark mode, layout, and search) without any links
links:
  - name: "ansible"
    icon: "fab fa-github"
    url: "https://github.com/xxxxx/ansible/"
    target: "_blank" # optional html tag target attribute
  - name: "Wiki"
    icon: "fas fa-book"
    url: "https://wiki.xxxxxx.com/"

# Services
# First level array represent a group.
# Leave only a "items" key if not using group (group name, icon & tagstyle are optional, section separation will not be displayed).
services:
  - name: "DevOps"
    icon: "fa fa-code-fork"
    items:
      - name: "Jenkins"
        logo: "/assets/tools/jenkins.png"
        # Alternatively a fa icon can be provided:
        # icon: "fab fa-jenkins"
        subtitle: "Continuous integration server"
        tag: "CI"
        url: "#"
        target: "_blank" # optional html tag target attribute
      - name: "RabbitMQ Management"
        logo: "/assets/tools/rabbitmq.png"
        subtitle: "Manage & monitor RabbitMQ server"
        tag: "haproxy"
        # Optional tagstyle
        tagstyle: "is-success"
        url: "#"
  - name: "Monitoring"
    icon: "fas fa-heartbeat"
    items:
      - name: "M/Monit"
        logo: "/assets/tools/monit.png"
        subtitle: "Monitor & manage all monit enabled hosts"
        tag: "monit"
        url: "#"
      - name: "Grafana"
        logo: "/assets/tools/grafana.png"
        subtitle: "Metric analytics & dashboards"
        url: "#"
      - name: "Kibana"
        logo: "/assets/tools/elastic.png"
        subtitle: "Explore & visualize logs"
        tag: "elk"
        url: "#"
      - name: "Website monitoring"
        logo: "/assets/tools/pingdom.png"
        subtitle: "Pingdom public reports overview"
        tag: "CI"
        url: "#"
```

If you choose to fetch message information from an endpoint, the output format should be:

```json
{
  "style": null,
  "title": "Lorem ipsum 42",
  "content": "LA LA LA Lorem ipsum dolor sit amet, ....."
}
```

`null` value or missing keys will be ignored and value from the `config.yml` will be used if available.
Empty values (either in `config.yml` or the endpoint data) will hide the element (ex: set `"title": ""` to hide the title bar).

### Style Options

Homer uses [bulma CSS](https://bulma.io/), which provides a [modifiers syntax](https://bulma.io/documentation/modifiers/syntax/). You'll notice in the config there is a `tagstyle` option. It can be set to any of the bulma modifiers. You'll probably want to use one of these 4 main colors:

- `is-info` (blue)
- `is-success` (green)
- `is-warning` (yellow)
- `is-danger` (red)

You can read the [bulma modifiers page](https://bulma.io/documentation/modifiers/syntax/) for other options regarding size, style, or state.
