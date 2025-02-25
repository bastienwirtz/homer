# build stage
FROM --platform=$BUILDPLATFORM node:22-alpine3.21 AS build-stage

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack use pnpm@10

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# production stage
FROM alpine:3.21

LABEL \
    org.label-schema.schema-version="1.0" \
    org.label-schema.version="$VERSION_TAG" \
    org.opencontainers.image.title="Homer Image" \
    org.opencontainers.image.description="A dead simple static Home-Page for your server to keep your services on hand, from a simple yaml configuration file." \
    org.opencontainers.image.ref.name="b4bz/homer:${VERSION_TAG}" \
    org.opencontainers.image.version="$VERSION_TAG" \
    org.opencontainers.image.licenses="Apache-2.0 license" \
    org.opencontainers.image.source="https://github.com/bastienwirtz/homer" \
    org.opencontainers.image.url="https://hub.docker.com/r/b4bz/homer"

ENV GID=1000 \
    UID=1000 \
    PORT=8080 \
    SUBFOLDER="/_" \
    INIT_ASSETS=1 \
    IPV6_DISABLE=0

RUN addgroup -S lighttpd -g ${GID} && adduser -D -S -u ${UID} lighttpd lighttpd && \
    apk add -U --no-cache tzdata lighttpd

WORKDIR /www

COPY lighttpd.conf /lighttpd.conf
COPY lighttpd-ipv6.sh /etc/lighttpd/ipv6.sh
COPY entrypoint.sh /entrypoint.sh
COPY --from=build-stage --chown=${UID}:${GID} /app/dist /www/
COPY --from=build-stage --chown=${UID}:${GID} /app/dist/assets /www/default-assets

USER ${UID}:${GID}

HEALTHCHECK --start-period=10s --start-interval=1s --interval=30s --timeout=5s --retries=3 \
    CMD wget --no-verbose -Y off --tries=1 --spider http://127.0.0.1:${PORT}/ || exit 1

EXPOSE ${PORT}

ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]
