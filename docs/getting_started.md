## Using Docker

The fastest and recommended way to get your Homer instance up and running is
with Docker. The Docker image comes with a web server built-in so that all you
need to worry about is your config file.

Internally, the Docker image looks for the assets in the `/www/assets` directory
so you can bind a volume from your host machine to that directory in order to
modify and persist the configuration files. The web server serves the dashboard
on port 8080, but using a port binding will let you expose that to whatever
external port you like.

### docker

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

### docker-compose

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
