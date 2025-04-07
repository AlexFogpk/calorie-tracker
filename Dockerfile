# ===== Этап 1: Сборка фронтенда и сервера =====
FROM node:18-alpine AS builder

WORKDIR /app

# 👇 Кэш-бастинг, чтобы Railway не юзал старое
ARG CACHE_BREAKER=ts-20250408
RUN echo "Cache bust: $CACHE_BREAKER"

# Установка зависимостей
COPY package.json ./
RUN npm install --no-package-lock

# Копируем проект
COPY . .

# Сборка фронта и сервера
RUN npm run build:server && npm run build:railway

# ===== Этап 2: Финальный образ =====
FROM node:18-alpine

WORKDIR /app

# Установка только прод-зависимостей
COPY package.json ./
RUN npm install --production

# Копируем собранные артефакты
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server

# Запуск Express-сервера
CMD ["node", "dist-server/index.js"]
