# Calorie Tracker

Приложение для отслеживания калорий и макронутриентов с AI-анализом блюд.

## Возможности

- AI-анализ блюд с автоматическим расчётом КБЖУ
- Отслеживание дневной нормы калорий
- Визуализация прогресса через кольца
- Мобильная адаптация
- Поддержка десятичных значений

## Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/yourusername/calorie-tracker.git
cd calorie-tracker
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env` в корне проекта:
```env
OPENAI_API_KEY=your_api_key_here
```

## Разработка

### Локальная разработка

1. Запуск фронтенда и бэкенда:
```bash
npm run dev:all
```

2. Запуск только бэкенда:
```bash
npm run dev:server
```

3. Проверка кода:
```bash
npm run check
```

### Сборка для продакшена

1. Сборка для Railway:
```bash
npm run build:railway
```

2. Сборка сервера:
```bash
npm run build:server
```

## Технологии

- React
- TypeScript
- Vite
- OpenAI API
- Tailwind CSS
- Framer Motion

## Структура проекта

```
src/
  ├── components/     # React компоненты
  ├── api/           # API клиенты
  ├── types/         # TypeScript типы
  ├── utils/         # Утилиты
  └── server/        # Серверный код
```

## Лицензия

MIT
