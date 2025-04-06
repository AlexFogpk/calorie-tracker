# Этап сборки
FROM node:18-alpine AS builder

WORKDIR /app

# Установка зависимостей
COPY package.json ./
RUN apk add --no-cache python3 make g++ git
RUN npm cache clean --force && npm install --no-package-lock

# Копируем исходники
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tsconfig.node.json ./
COPY postcss.config.cjs ./
COPY tailwind.config.js ./

# Сборка
RUN npm run build:railway && ls -lah dist

# Финальный слой — Nginx
FROM nginx:alpine

# Копируем сборку во внутреннюю папку Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем nginx.conf (настройки сервера)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Проверим, что index.html действительно скопирован
RUN cat /usr/share/nginx/html/index.html || echo "index.html not found"

# 🔥 Обязательно указываем, чтобы Nginx не завершался сразу после старта
CMD ["nginx", "-g", "daemon off;"]
