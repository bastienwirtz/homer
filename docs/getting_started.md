## Using Docker

The fastest and recommended way to get your Homer instance up and running is
with Docker. The Docker image comes with a web server built-in so that all you
need to worry about is your config file.

### docker

To launch container:

```sh
docker run -d \
  -p 8080:8080 \
  -v </your/local/assets/>:/www/assets \
  --restart=always \
  b4bz/homer:latest
```

Default assets will be automatically installed in the `/www/assets` directory. Use `UID` and/or `GID` env var to change the assets owner (`docker run -e "UID=1000" -e "GID=1000" [...]`).

### docker-compose

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

## Shipping your own web server

### Prebuilt release tarball

Download and extract the latest release (`homer.zip`) from the [release page](https://github.com/bastienwirtz/homer/releases), rename the `assets/config.yml.dist` file to `assets/config.yml`, and put it behind a web server.

```sh
wget https://github.com/bastienwirtz/homer/releases/latest/download/homer.zip
unzip homer.zip
cd homer
cp assets/config.yml.dist assets/config.yml
npx serve # or python -m http.server 8010 or apache, nginx ...
```

### Building from source

```sh
# Using yarn (recommended)
yarn install
yarn build

# **OR** Using npm
npm install
npm run build
```

Then your dashboard is ready to use in the `/dist` directory.
