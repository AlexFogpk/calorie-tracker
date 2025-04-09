# ===== Этап 1: Сборка фронтенда и сервера =====
FROM node:18-alpine AS builder

WORKDIR /app

# 👇 Кэш-бастинг, чтобы Railway не юзал старое
ARG CACHE_BREAKER=ts-20250409-5
RUN echo "Cache bust: $CACHE_BREAKER"

# Установка зависимостей
COPY package.json ./
RUN npm install --no-package-lock

# Копируем проект
COPY . .

# Сборка сервера с проверкой ошибок
RUN npm run build:server || (echo "❌ Ошибка build:server" && cat tsconfig.server.json && ls -la src/server && exit 1)

# Сборка фронтенда с проверкой ошибок
RUN npm run build:railway || (echo "❌ Ошибка build:railway" && exit 1)

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
