# build stage
FROM node:lts-alpine as build-stage

WORKDIR /app

COPY package*.json ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# dashboard icons stage
FROM bitnami/git as icons-stage
WORKDIR /root
RUN git clone https://github.com/walkxcode/dashboard-icons.git

# production stage
FROM alpine:3.16

ENV GID 1000
ENV UID 1000
ENV PORT 8080
ENV SUBFOLDER "/_"
ENV INIT_ASSETS 1

RUN addgroup -S lighttpd -g ${GID} && adduser -D -S -u ${UID} lighttpd lighttpd && \
    apk add -U --no-cache lighttpd

WORKDIR /www

COPY lighttpd.conf /lighttpd.conf
COPY entrypoint.sh /entrypoint.sh
COPY --from=build-stage --chown=${UID}:${GID} /app/dist /www/
COPY --from=build-stage --chown=${UID}:${GID} /app/dist/assets /www/default-assets
COPY --from=icons-stage --chown=${UID}:${GID} /root/dashboard-icons/png /www/assets/dashboard-icons/png
COPY --from=icons-stage --chown=${UID}:${GID} /root/dashboard-icons/svg /www/assets/dashboard-icons/svg

USER ${UID}:${GID}

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:${PORT}/ || exit 1

EXPOSE ${PORT}

ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]
