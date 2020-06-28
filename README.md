# Homer
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Contribution Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Gitter](https://badges.gitter.im/homer-dashboard/community.svg)](https://gitter.im/homer-dashboard/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
[![Dowload](https://img.shields.io/badge/Dowload-homer.zip-orange)](https://github.com/bastienwirtz/homer/releases/latest/download/homer.zip)
[![Awesome](https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg)](https://github.com/awesome-selfhosted/awesome-selfhosted)

A dead simple static **HOM**epage for your serv**ER** to keep your s
ervices on hand, from a simple `yaml` configuration file.

## [Live demo](https://homer-demo.netlify.app)  • [Chat](https://gitter.im/homer-dashboard/community)
![screenshot](https://raw.github.com/bastienwirtz/homer/master/docs/screenshot.png)

## Table of Contents
- [Features](#features)
- [Getting started](#getting-started)
- [Configuration](docs/configuration.md)
- [Tips & tricks](docs/tips-and-tricks.md)
- [Roadmap](#roadmap) 
- [Developement](docs/developement.md)


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

See [documentation](docs/configuration.md) for information about the configuration (`assets/config.yml`) options.

### Using docker

```sh
docker run -p 8080:8080 -v /your/local/assets/:/www/assets b4bz/homer:latest
```

Default assets will be automatically installed in the `/www/assets` directory. Use `UID` and/or `GID` env var to change the assets owner (`docker run -e "UID=1000" -e "GID=1000" [...]`).

### Using the release tarball (prebuilt, ready to use)

Download and extract the latest the latest release (`homer.zip`) from the [release page](https://github.com/bastienwirtz/homer/releases), rename the `assets/config.yml.dist` file to `assets/config.yml`, and put it behind a webserver.
 
```sh
wget https://github.com/bastienwirtz/homer/releases/latest/download/homer.zip
unzip homer.zip
cd homer
cp assets/config.yml.dist assets/config.yml
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


## Roadmap

- [ ] Add new themes.
- [ ] Add support for custom service card (add custom feature to some service / app link)
