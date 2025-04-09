# ===== Этап 1: Сборка фронтенда и сервера =====
FROM node:18-alpine AS builder

WORKDIR /app

# 👇 Кэш-бастинг, чтобы Railway не юзал старое
ARG CACHE_BREAKER=ts-20250409-7
RUN echo "Cache bust: $CACHE_BREAKER"

# Установка зависимостей
COPY package.json ./
RUN npm install --no-package-lock

# Копируем проект
COPY . .

# Сборка сервера с расширенной диагностикой ошибок
RUN echo "=== Начало сборки сервера ===" && \
    echo "=== Содержимое tsconfig.server.json ===" && \
    cat tsconfig.server.json && \
    echo "=== Содержимое директории src/server ===" && \
    ls -la src/server && \
    echo "=== Запуск tsc с подробным выводом ошибок ===" && \
    npx tsc -p tsconfig.server.json --listFiles --pretty false --diagnostics --extendedDiagnostics || ( \
        echo "❌ Ошибка build:server" && \
        echo "=== Подробный вывод ошибок TypeScript ===" && \
        npx tsc -p tsconfig.server.json --listFiles --pretty false --diagnostics --extendedDiagnostics 2>&1 && \
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
