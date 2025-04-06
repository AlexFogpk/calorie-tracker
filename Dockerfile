FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./

# Установим необходимые зависимости для сборки
RUN apk add --no-cache python3 make g++ git
# Установим зависимости без package-lock
RUN npm cache clean --force && npm install --no-package-lock

# Сначала копируем только исходный код и конфигурационные файлы
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tsconfig.node.json ./
COPY postcss.config.cjs ./
COPY tailwind.config.js ./

ENV NODE_OPTIONS="--max-old-space-size=4096 --no-warnings"
ENV CI=false
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_MEASUREMENT_ID

# Сохраняем список установленных пакетов для отладки
RUN npm list > npm-list.txt

# Запускаем сборку с пропуском проверок типов
RUN npm run build:railway

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 