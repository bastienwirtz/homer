# build stage
FROM node:18-alpine3.19 as build-stage

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN corepack use pnpm@8

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# production stage
FROM alpine:3.19

ENV GID 1000
ENV UID 1000
ENV PORT 8080
ENV SUBFOLDER "/_"
ENV INIT_ASSETS 1
ENV IPV6_DISABLE 0

RUN addgroup -S lighttpd -g ${GID} && adduser -D -S -u ${UID} lighttpd lighttpd && \
    apk add -U --no-cache lighttpd

WORKDIR /www

COPY lighttpd.conf /lighttpd.conf
COPY lighttpd-ipv6.sh /etc/lighttpd/ipv6.sh
COPY entrypoint.sh /entrypoint.sh
COPY --from=build-stage --chown=${UID}:${GID} /app/dist /www/
COPY --from=build-stage --chown=${UID}:${GID} /app/dist/assets /www/default-assets

USER ${UID}:${GID}

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:${PORT}/ || exit 1

EXPOSE ${PORT}

ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]
