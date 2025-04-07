# Этап сборки фронтенда и сервера
FROM node:18-alpine AS builder

WORKDIR /app

ARG CACHE_BREAKER=ts-20250407
RUN echo "Cache bust: $CACHE_BREAKER"

COPY package.json ./
RUN apk add --no-cache python3 make g++ git
RUN npm install --no-package-lock

# Копируем весь проект
COPY . .

# Сборка фронта и сервера
RUN npm run build:railway

# Финальный образ на Node.js для запуска Express-сервера
FROM node:18-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --production

# Копируем собранный фронт и сервер из builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server

# Запуск Express-сервера
CMD ["node", "dist-server/index.js"]
