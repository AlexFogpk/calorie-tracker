# Этап сборки фронтенда
FROM node:18-alpine AS builder

WORKDIR /app

ARG CACHE_BREAKER=ts-20250407
RUN echo "Cache bust: $CACHE_BREAKER"

COPY package.json ./
RUN apk add --no-cache python3 make g++ git
RUN npm install --no-package-lock

COPY . .

RUN npm run build:railway

# Финальный образ на Node.js для запуска сервера
FROM node:18-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY dist ./dist
COPY dist-server ./dist-server

# Запуск сервера
CMD ["node", "dist-server/index.js"]
