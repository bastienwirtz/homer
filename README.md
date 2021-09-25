<h1 align="center">
 <img
  width="180"
  alt="Homer's donut"
  src="https://raw.githubusercontent.com//bastienwirtz/homer/main/public/logo.png">
    <br/>
    Homer
</h1>

<h4 align="center">
 A dead simple static <strong>HOM</strong>epage for your serv<strong>ER</strong> to keep your services on hand, from a simple <code>yaml</code> configuration file.
</h4>

<p align="center">
 <strong>
   <a href="https://homer-demo.netlify.app">Demo</a>
  •
  <a href="https://gitter.im/homer-dashboard/community">Chat</a>
  •
  <a href="#getting-started">Getting started</a>
 </strong>
</p>
<p align="center">
 <a href="https://opensource.org/licenses/Apache-2.0"><img
  alt="License: Apache 2"
  src="https://img.shields.io/badge/License-Apache%202.0-blue.svg"></a>
  <a href="https://gitter.im/homer-dashboard/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge"><img
  alt="Gitter chat"
  src="https://badges.gitter.im/homer-dashboard/community.svg"></a>
  <a href="https://github.com/bastienwirtz/homer/releases/latest/download/homer.zip"><img
  alt="Download homer static build"
  src="https://img.shields.io/badge/Download-homer.zip-orange"></a>
 <a href="https://github.com/awesome-selfhosted/awesome-selfhosted"><img
  alt="Awesome"
  src="https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg"></a>
</p>

<p align="center">
 <img src="https://raw.github.com/bastienwirtz/homer/main/docs/screenshot.png" width="100%">
</p>

## Table of Contents

- [Features](#features)
- [Getting started](#getting-started)
- [Configuration](docs/configuration.md)
- [Custom services](docs/customservices.md)
- [Tips & tricks](docs/tips-and-tricks.md)
- [Development](docs/development.md)
- [Troubleshooting](docs/troubleshooting.md)

## Features

- [yaml](http://yaml.org/) file configuration
- Installable (pwa)
- Search
- Grouping
- Theme customization
- Offline heath check
- keyboard shortcuts:
  - `/` Start searching.
  - `Escape` Stop searching.
  - `Enter` Open the first matching result (respects the bookmark's `_target` property).
  - `Alt`/`Option` + `Enter` Open the first matching result in a new tab.

## Getting started

Homer is a full static html/js dashboard, generated from the source in `/src` using webpack. It's meant to be served by an HTTP server, **it will not work if you open dist/index.html directly over file:// protocol**.

See [documentation](docs/configuration.md) for information about the configuration (`assets/config.yml`) options.

### Using docker

To launch container:

```sh
docker run -d \
  -p 8080:8080 \
  -v </your/local/assets/>:/www/assets \
  --restart=always \
  b4bz/homer:latest
```

Default assets will be automatically installed in the `/www/assets` directory. Use `UID` and/or `GID` env var to change the assets owner (`docker run -e "UID=1000" -e "GID=1000" [...]`).

### Using docker-compose

The `docker-compose.yml` file must be edited to match your needs.
Set the port and volume (equivalent to `-p` and `-v` arguments):

```yaml
volumes:
  - /your/local/assets/:/www/assets
ports:
  - 8080:8080
```

To launch container:

```sh
cd /path/to/docker-compose.yml
docker-compose up -d
```

Default assets will be automatically installed in the `/www/assets` directory. Use `UID` and/or `GID` env var to change the assets owner, also in `docker-compose.yml`:

```yaml
environment:
  - UID=1000
  - GID=1000
```

### Using the release tarball (prebuilt, ready to use)

Download and extract the latest release (`homer.zip`) from the [release page](https://github.com/bastienwirtz/homer/releases), rename the `assets/config.yml.dist` file to `assets/config.yml`, and put it behind a web server.

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
