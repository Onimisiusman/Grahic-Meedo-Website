FROM node:24-alpine

ENV NODE_ENV=production
ENV DATA_DIR=/data

WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

COPY hproject.html style.css style.js ./
COPY server ./server

RUN mkdir -p /data

EXPOSE 3000
CMD ["node", "server/server.js"]
