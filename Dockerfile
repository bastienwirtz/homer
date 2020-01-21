FROM alpine:3.11

COPY ./ /www/

ENV USER abc
ENV GROUP abc
ENV GID 911
ENV UID 911

RUN addgroup -S ${GROUP} -g ${GID} && adduser -D -S -u ${UID} ${USER} ${GROUP} && \
    apk add -U darkhttpd

USER abc

ENTRYPOINT ["darkhttpd","/www/"]
