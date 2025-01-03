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
  <a href="https://www.buymeacoffee.com/bastien" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-yellow.png" alt="Buy Me A Coffee" height="41" width="174"></a>
<p>
<p align="center">
 <a href="https://opensource.org/licenses/Apache-2.0"><img
  alt="License: Apache 2"
  src="https://img.shields.io/badge/License-Apache%202.0-blue.svg"></a>
  <a href="https://github.com/bastienwirtz/homer/releases/latest/download/homer.zip"><img
  alt="Download homer static build"
  src="https://img.shields.io/badge/Download-homer.zip-orange"></a>
 <a href="https://twitter.com/acdlite/status/974390255393505280"><img
  alt="speed-blazing"
  src="https://img.shields.io/badge/speed-blazing%20%F0%9F%94%A5-red"></a>
 <a href="https://github.com/awesome-selfhosted/awesome-selfhosted"><img
  alt="Awesome"
  src="https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg"></a>
</p>

<p align="center">
 <strong>
  <a href="https://homer-demo.netlify.app">Demo</a>
  •
  <a href="https://hub.docker.com/r/b4bz/homer">Docker Hub</a>
  •
  <a href="#get-started">Get started</a>
 </strong>
</p>

## Highlights

- ⚡️ Lightweight & Fast
- 🥱 Low / No maintenance
- 📄 Simple [yaml](http://yaml.org/) file configuration
- ➕ Installable (pwa)
- 🧠 Smart cards
- 🔍️ Fuzzy search
- 📂 Multi pages & item grouping
- 🎨 Theme customization
- ⌨️ keyboard shortcuts:
  - <kbd>/</kbd> Start searching.
  - <kbd>Escape</kbd> Stop searching.
  - <kbd>Enter</kbd> Open the first matching result (respects the bookmark's `_target` property).
  - <kbd>Alt</kbd> (or <kbd>Option</kbd>) + <kbd>Enter</kbd> Open the first matching result in a new tab.

## Table of Contents

- [Getting started](#get-started)
- [Kubernetes Installation](docs/kubernetes.md)
- [Configuration](docs/configuration.md)
- [Theming](docs/theming.md)
- [Smart cards](docs/customservices.md)
- [Tips & tricks](docs/tips-and-tricks.md)
- [Development](docs/development.md)
- [Troubleshooting](docs/troubleshooting.md)

## Get started

Homer is a full static html/js dashboard, based on a simple yaml configuration file. See [documentation](docs/configuration.md) for information about the configuration (`assets/config.yml`) options.

It's meant to be served by an HTTP server, **it will not work if you open the index.html directly over file:// protocol**.

### Using docker

The configuration directory is bind mounted to make your dashboard easy to maintain.

**Start the container with `docker run`**

```sh
# Make sure your local config directory exists
docker run -d \
  --name homer \
  -p 8080:8080 \
  --mount type=bind,source="/path/to/config/dir",target=/www/assets \
  --restart=unless-stopped \
  b4bz/homer:latest
```

> [!NOTE]  
> The container will run using a user uid and gid 1000 by default, add `--user <your-UID>:<your-GID>` to the docker command to adjust it if necessary. Make sure this match the permissions of your assets directory.

**or `docker-compose`**

```yaml
services:
  homer:
    image: b4bz/homer
    container_name: homer
    volumes:
      - /path/to/config/dir:/www/assets # Make sure your local config directory exists
    ports:
      - 8080:8080
    user: 1000:1000 # default
    environment:
      - INIT_ASSETS=1 # default, requires the config directory to be writable for the container user (see user option)
    restart: unless-stopped
```

**Environment variables:**

- **`INIT_ASSETS`** (default: `1`)
Install example configuration file & assets (favicons, ...) to help you get started.

- **`SUBFOLDER`** (default: `null`)
If you would like to host Homer in a subfolder, (ex: *<http://my-domain/homer>*), set this to the subfolder path (ex `/homer`).

- **`PORT`** (default: `8080`)
If you would like to change internal port of Homer from default `8080` to your port choice.

- **`IPV6_DISABLE`** (default: 0)
Set to `1` to disable listening on IPv6.

### Using the release tarball (prebuilt, ready to use)

Download and extract the latest release (`homer.zip`) from the [release page](https://github.com/bastienwirtz/homer/releases), rename the `assets/config.yml.dist` file to `assets/config.yml`, and put it behind a web server.

```sh
wget https://github.com/bastienwirtz/homer/releases/latest/download/homer.zip
unzip homer.zip -d homer
cd homer
cp assets/config.yml.dist assets/config.yml
pnpx http-server # or python -m http.server 8010 or any web server.
```

### Build manually

```sh
pnpm install
pnpm build
```

Then your dashboard is ready to use in the `/dist` directory.
