FROM alpine:3.11

COPY ./ /www/

ENV USER darkhttpd
ENV GROUP darkhttpd
ENV GID 911
ENV UID 911

RUN addgroup -S ${GROUP} -g ${GID} && adduser -D -S -u ${UID} ${USER} ${GROUP} && \
    apk add -U darkhttpd

USER darkhttpd

ENTRYPOINT ["darkhttpd","/www/"]
