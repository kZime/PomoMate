# syntax=docker/dockerfile:1

FROM node:18-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 9000

CMD ["node", "bin/www"]
