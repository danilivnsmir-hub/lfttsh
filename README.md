
# Workout Tracker v1.0.1

Современное веб-приложение для отслеживания тренировок с поддержкой Telegram Cloud Storage.

## 🚀 Возможности

- ✅ Отслеживание тренировок и подходов
- ✅ База данных упражнений
- ✅ История тренировок
- ✅ Статистика прогресса
- ✅ Экспорт данных в CSV
- ✅ Telegram Web App интеграция
- ✅ Offline работа (localStorage)
- ✅ Адаптивный дизайн

## 🛠 Технологии

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Animation**: Framer Motion
- **Storage**: Telegram Cloud Storage + localStorage

## 📱 Развертывание

### Vercel (рекомендуется)
1. Подключите репозиторий к Vercel
2. Настройте переменные окружения (см. ниже)
3. Деплой произойдет автоматически

### Переменные окружения
Создайте в Vercel следующие переменные:
- `NODE_ENV=production`
- `NEXTAUTH_URL=https://ваш-домен.vercel.app`
- `NEXTAUTH_SECRET=ваш-секретный-ключ`

## 🏃‍♂️ Локальный запуск

```bash
# Установка зависимостей
yarn install

# Запуск dev сервера
yarn dev

# Сборка для production
yarn build
yarn start
```

## 📁 Структура проекта

```
app/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── globals.css     # Глобальные стили
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Главная страница
├── components/         # React компоненты
├── lib/               # Утилиты и конфигурация
├── public/            # Статические файлы
└── styles/            # Дополнительные стили
```

## 🔧 Настройки

Приложение работает в трех режимах:
1. **Telegram Web App** - с Telegram Cloud Storage
2. **Веб-приложение** - с localStorage
3. **С базой данных** - с PostgreSQL (опционально)

## 📄 Лицензия

MIT License
