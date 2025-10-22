FROM node:20-alpine

WORKDIR /app

# Копируем только package файлы для лучшего кэширования
COPY package.json package-lock.json* ./

# установка зависимостей
RUN npm install --silent --no-optional

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Устанавливаем serve для статики
RUN npm install -g serve

EXPOSE 3000

# Запускаем сервер для статических файлов
CMD ["serve", "-s", "build", "-l", "3000"]
