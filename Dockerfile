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

# Final production image
FROM node:20-alpine
WORKDIR /app

# Copy package files and server
COPY package.json ./
COPY server.js ./

# Install only production dependencies
RUN npm install --only=production

# Copy built app from builder stage
COPY --from=builder /app/dist ./dist

# Expose port for the application
EXPOSE 3000

# Run Express server
CMD ["node", "server.js"] 