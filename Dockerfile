# Этап сборки: Node + Vite
FROM node:18-alpine AS builder

WORKDIR /app

# Всегда инвалидация кэша (по времени)
ARG CACHE_BREAKER=dev
RUN echo "Cache bust: $CACHE_BREAKER"

# Установка зависимостей
COPY package.json ./
RUN apk add --no-cache python3 make g++ git
RUN npm cache clean --force && npm install --no-package-lock

# Копируем исходные файлы
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tsconfig.node.json ./
COPY postcss.config.cjs ./
COPY tailwind.config.js ./

# Сборка проекта
RUN npm run build:railway && ls -lah dist

# Финальный образ: Nginx
FROM nginx:alpine

# Копируем собранную статику
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфигурацию Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Добавляем логирование nginx для отладки
#RUN echo "access_log /var/log/nginx/access.log;" >> /etc/nginx/nginx.conf && \
#    echo "error_log /var/log/nginx/error.log debug;" >> /etc/nginx/nginx.conf

# Проверка, что index.html есть
RUN cat /usr/share/nginx/html/index.html || echo "⚠️ index.html не найден!"

# Стартуем Nginx в фореground (иначе контейнер упадёт)
CMD ["nginx", "-g", "daemon off;"]
