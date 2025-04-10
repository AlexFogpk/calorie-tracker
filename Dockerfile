# ===== Этап 1: Сборка фронтенда и сервера =====
FROM node:18-alpine AS builder

WORKDIR /app

# 👇 Кэш-бастинг, чтобы Railway не юзал старое
ARG CACHE_BREAKER=ts-20250409-9
RUN echo "Cache bust: $CACHE_BREAKER"

# Установка зависимостей (включая devDependencies для сборки)
COPY package.json ./
COPY package-lock.json ./
# If this step causes Error 137, increasing memory in Railway is the best solution.
RUN npm ci

# Копируем проект
COPY . .

# Сборка фронтенда и сервера (используя скрипт)
RUN npm run build:railway || (echo "❌ Ошибка build:railway" && exit 1)

# ===== Этап 2: Финальный образ =====
FROM node:18-alpine

WORKDIR /app

# Установка только прод-зависимостей
COPY package.json ./
COPY package-lock.json ./
# Change from npm ci to npm install to try and fix error 127
RUN npm install --omit=dev

# Копируем собранные артефакты
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server

# Запуск Express-сервера
CMD ["node", "dist-server/index.js"]
