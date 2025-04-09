# ===== Этап 1: Сборка фронтенда и сервера =====
FROM node:18-alpine AS builder

WORKDIR /app

# 👇 Кэш-бастинг, чтобы Railway не юзал старое
ARG CACHE_BREAKER=ts-20250409-9
RUN echo "Cache bust: $CACHE_BREAKER"

# Установка зависимостей
COPY package.json ./
RUN npm install --no-package-lock

# Копируем проект
COPY . .

# 💥 Добавим явный вывод ошибок TypeScript
RUN echo "=== Сборка сервера ===" && \
    echo "=== tsconfig.server.json ===" && \
    cat tsconfig.server.json && \
    echo "=== Файлы в src/server ===" && \
    ls -la src/server && \
    echo "=== Запуск tsc ===" && \
    npx tsc -p tsconfig.server.json --noEmit --listFiles --pretty false || ( \
        echo "❌ Ошибка TypeScript" && \
        echo "=== Подробный вывод ошибок ===" && \
        npx tsc -p tsconfig.server.json --noEmit --listFiles --pretty false 2>&1 && \
        echo "=== Содержимое проблемных файлов ===" && \
        find src/server -type f -name "*.ts" -exec echo "=== {} ===" \; -exec cat {} \; && \
        exit 1 \
    )

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
