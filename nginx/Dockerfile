FROM nginx:1.25-alpine

COPY nginx/nginx.conf /etc/nginx/nginx.conf

RUN apk add --no-cache nodejs npm

WORKDIR /tmp/front
COPY frontend/package*.json ./
RUN npm ci
COPY front .
RUN npm run build

RUN rm -rf /usr/share/nginx/html/*
RUN cp -r /tmp/front/dist/* /usr/share/nginx/html/
