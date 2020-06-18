# build stage
FROM node:lts-alpine as build-stage

WORKDIR /app

COPY package*.json ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# production stage
FROM alpine:3.11

ENV USER darkhttpd
ENV GROUP darkhttpd
ENV GID 911
ENV UID 911
ENV PORT 8080

RUN addgroup -S ${GROUP} -g ${GID} && adduser -D -S -u ${UID} ${USER} ${GROUP} && \
    apk add -U darkhttpd

COPY --from=build-stage --chown=${USER}:${GROUP} /app/dist /www/
COPY --chown=${USER}:${GROUP} entrypoint.sh /entrypoint.sh

USER ${USER}
EXPOSE ${PORT}
VOLUME [ "/www/config.yml", "/www/assets" ]
ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]
