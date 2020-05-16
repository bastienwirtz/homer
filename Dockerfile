FROM halverneus/static-file-server:v1.8.0

ENV \
	DEBUG=true \
	FOLDER=/www \
	PORT=8080

COPY ./ /www/
