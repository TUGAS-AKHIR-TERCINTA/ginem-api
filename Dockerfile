FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache tini

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/build ./build
COPY --from=builder /app/resources ./resources
COPY --from=builder /app/settings ./settings
COPY --from=builder /app/.sequelizerc ./.sequelizerc
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
  && mkdir -p logs

EXPOSE 8000

ENTRYPOINT ["/sbin/tini", "--", "docker-entrypoint.sh"]
CMD ["node", "build/server.js"]
