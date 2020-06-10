# Homer
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Contribution Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Gitter](https://badges.gitter.im/homer-dashboard/community.svg)](https://gitter.im/homer-dashboard/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
[![Dowload](https://img.shields.io/badge/Dowload-homer.zip-orange)](https://github.com/bastienwirtz/homer/releases/latest/download/homer.zip)
[![Awesome](https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg)](https://github.com/awesome-selfhosted/awesome-selfhosted)

A dead simple static **HOM**epage for your serv**ER** to keep your s
ervices on hand, from a simple `yaml` configuration file.

## [Live demo](https://homer-demo.netlify.app)  • [Chat](https://gitter.im/homer-dashboard/community)
![screenshot](https://raw.github.com/bastienwirtz/homer/master/screenshot.png)

## Table of Contents
- [Features](#features)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Roadmap](#roadmap) 
- [Developement](#developement)

## Features
- [yaml](http://yaml.org/) file configuration
- Installable (pwa)
- Search
- Grouping 
- Theme customization
- Offline heathcheck
- keyboard shortcuts:
  - `/` Start searching.
  - `Escape` Stop searching.
  - `Enter` Open the first matching result (respects the bookmark's `_target` property).
  - `Alt`/`Option` + `Enter` Open the first matching result in a new tab.


## Getting started

Homer is a full static html/js dashboard, generated from the source in `/src` using webpack. It's meant to be served by an HTTP server, **it will not work if you open dist/index.html directly over file:// protocol**.

### Using docker

```sh
docker run -p 8080:8080 -v /your/local/config.yml:/www/config.yml -v /your/local/assets/:/www/assets b4bz/homer:latest
```

As a bind mount is used here, docker will not copy the initial content of the `assets` directory to the mounted directory. 
You can initialise your assets directory with the content provided in this repository
```sh
cp -r /public/assets/* /your/local/assets/
```

**Alternatively** if you just want to provide images/icons without customizing the other files (app manifest & pwa icons), you can mount a custom directory in the `www` directory and use it in your `config.yml` for icons path.

### Using the release tarball (prebuilt, ready to use)

Download and extract the latest the latest release (`homer.zip`) from the [release page](https://github.com/bastienwirtz/homer/releases), rename the `config.yml.dist` file to `config.yml`, and put it behind a webserver.
 
```sh
wget https://github.com/bastienwirtz/homer/releases/latest/download/homer.zip
unzip homer.zip
cd homer
cp config.yml.dist config.yml
npx serve # or python -m http.server 8010 or apache, nginx ...
```

### Build manually

```sh
# Using yarn (recommended)
yarn install
yarn build

# **OR** Using npm
npm install
npm run build
```

Then your dashboard is ready to use in the `/dist` directory.

## Configuration

Title, icons, links, colors, and services can be configured in the `config.yml` file (located in project root directory once built, or in the `public/` directory in developement mode), using [yaml](http://yaml.org/) format.

```yaml
---
# Homepage configuration
# See https://fontawesome.com/icons for icons options

# Optional: Use external configuration file. 
# Using this will ignore remaining config in this file
# externalConfig: https://example.com/server-luci/config.yaml

title: "App dashboard"
subtitle: "Homer"
logo: "assets/homer.png"
# Alternatively a fa icon can be provided:
# icon: "fas fa-skull-crossbones"

header: true # Set to false to hide the header
footer: '<p>Created with <span class="has-text-danger">❤️</span> with <a href="https://bulma.io/">bulma</a>, <a href="https://vuejs.org/">vuejs</a> & <a href="https://fontawesome.com/">font awesome</a> // Fork me on <a href="https://github.com/bastienwirtz/homer"><i class="fab fa-github-alt"></i></a></p>' # set false if you want to hide it.

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
  content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."

# Optional navbar
# links: [] # Allows for navbar (dark mode, layout, and search) without any links
links:
  - name: "Link 1"
    icon: "fab fa-github"
    url: "https://github.com/bastienwirtz/homer"
    target: "_blank" # optional html tag target attribute
  - name: "link 2"
    icon: "fas fa-book"
    url: "https://github.com/bastienwirtz/homer"

# Services
# First level array represent a group.
# Leave only a "items" key if not using group (group name, icon & tagstyle are optional, section separation will not be displayed).
services:
  - name: "Application"
    icon: "fa fa-code-fork"
    items:
      - name: "Awesome app"
        logo: "assets/tools/sample.png"
        # Alternatively a fa icon can be provided:
        # icon: "fab fa-jenkins"
        subtitle: "Bookmark example"
        tag: "app"
        url: "https://www.reddit.com/r/selfhosted/"
        target: "_blank" # optional html tag target attribute
      - name: "Another one"
        logo: "assets/tools/sample2.png"
        subtitle: "Another application"
        tag: "app"
        # Optional tagstyle
        tagstyle: "is-success"
        url: "#"
  - name: "Other group"
    icon: "fas fa-heartbeat"
    items:
      - name: "Another app"
        logo: "assets/tools/sample.png"
        subtitle: "Another example"
        tag: "other"
        url: "https://www.reddit.com/r/selfhosted/"
        target: "_blank" # optionnal html a tag target attribute
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


## Roadmap

- [ ] Add more themes.
- [ ] Add support for custom service card (add custom feature to some service / app link)


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
