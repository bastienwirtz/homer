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

RUN echo "darkhttpd /www/ --no-listing --port $PORT" > /entrypoint.sh
RUN set -ex chown ${USER}:${GROUP} /entrypoint.sh

USER ${USER}

COPY --from=build-stage --chown=${USER}:${GROUP} /app/dist /www/

EXPOSE ${PORT}
ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]
