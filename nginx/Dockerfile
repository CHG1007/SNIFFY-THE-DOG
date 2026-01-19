FROM nginx:1.25-alpine

COPY nginx/nginx.conf /etc/nginx/nginx.conf

RUN apk add --no-cache nodejs npm

WORKDIR /tmp/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend .
RUN npm run build

RUN rm -rf /usr/share/nginx/html/*
RUN cp -r /tmp/frontend/dist/* /usr/share/nginx/html/
