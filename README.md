<h1 align="center">
 <img
  width="180"
  alt="Homer's donut"
  src="public/logo.png">
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
 <img src="docs/images/screenshot.png" width="100%">
</p>

## Table of Contents

- [Features](#features)
- [Getting started](#getting-started)
- [Configuration](https://bastienwirtz.github.io/homer/configuration)
- [Custom services](https://bastienwirtz.github.io/homer/custom_services)
- [Tips & tricks](https://bastienwirtz.github.io/homer/tips_and_tricks)
- [Development](https://bastienwirtz.github.io/homer/development)
- [Troubleshooting](https://bastienwirtz.github.io/homer/troubleshooting)

## Features

- [yaml](http://yaml.org/) file configuration
- Installable (pwa)
- Search
- Grouping
- Theme customization
- Offline health check
- keyboard shortcuts:
  - `/` Start searching.
  - `Escape` Stop searching.
  - `Enter` Open the first matching result (respects the bookmark's `_target` property).
  - `Alt`/`Option` + `Enter` Open the first matching result in a new tab.

## Getting started

### Using Docker

The fastest and recommended way to get your Homer instance up and running is
with Docker. The Docker image comes with a web server built-in so that all you
need to worry about is your config file.

Internally, the Docker image looks for the assets in the `/www/assets` directory
so you can bind a volume from your host machine to that directory in order to
modify and persist the configuration files. The web server serves the dashboard
on port 8080, but using a port binding will let you expose that to whatever
external port you like.

#### docker

To launch container:

```sh
docker run -d \
  -p 8080:8080 \
  -v </your/local/assets>:/www/assets \
  --restart=always \
  b4bz/homer:latest
```

Use `UID` and/or `GID` env var to change the assets owner:

```sh
docker run -d \
  -p 8080:8080 \
  -v </your/local/assets>:/www/assets \
  -e "UID=1000" -e "GID=1000" \
  --restart=always \
  b4bz/homer:latest
```

#### docker-compose

It is recommended to use docker-compose to manage your Docker containers, and
below you can find a simple compose yaml file. Copy the contents into a
`docker-compose.yaml` and modify the volume binding to your desired directory to
get started:

```yaml
version: '3.3'
services:
  homer:
    restart: always
    volumes:
      - /your/local/assets:/www/assets
    ports:
      - 8080:8080
    image: b4bz/homer
```

To launch container:

```sh
cd /path/to/docker-compose.yml
docker-compose up -d
```

Use `UID` and/or `GID` env var to change the assets owner:

```yaml
version: '3.3'
services:
  homer:
    restart: always
    volumes:
      - /your/local/assets:/www/assets
    ports:
      - 8080:8080
    environment:
      - UID=1000
      - GID=1000
    image: b4bz/homer
```

### Shipping your own web server

#### Prebuilt release tarball

Download and extract the latest release (`homer.zip`) from the [release page]
(https://github.com/bastienwirtz/homer/releases), rename the
`assets/config.yml.dist` file to `assets/config.yml`, and put it behind a web
server.

```sh
wget https://github.com/bastienwirtz/homer/releases/latest/download/homer.zip
unzip homer.zip
cd homer
cp assets/config.yml.dist assets/config.yml
npx serve # or python -m http.server 8010 or apache, nginx ...
```

#### Building from source

```sh
# Using yarn (recommended)
yarn install
yarn build

# **OR** Using npm
npm install
npm run build
```

Then your dashboard is ready to use in the `/dist` directory.
