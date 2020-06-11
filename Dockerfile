# build stage
FROM node:lts-alpine as build-stage

WORKDIR /app

COPY package*.json ./
RUN yarn install

COPY . .
RUN yarn build

# production stage
FROM alpine:3.11

COPY --from=build-stage /app/dist /www/

ENV USER darkhttpd
ENV GROUP darkhttpd
ENV GID 911
ENV UID 911

RUN addgroup -S ${GROUP} -g ${GID} && adduser -D -S -u ${UID} ${USER} ${GROUP} && \
    apk add -U darkhttpd

USER ${USER}

ENTRYPOINT ["darkhttpd","/www/", "--no-listing"]