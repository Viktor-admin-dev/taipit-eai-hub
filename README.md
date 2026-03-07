# EAI Hub — Платформа конкурса EAI Challenge

Внутренний портал холдинга **Тайпит** для конкурса идей по внедрению Enterprise AI.
Сотрудники подают заявки, получают AI-оценку, читают новости. Комиссия управляет конкурсом через админ-панель.

**Стек:** Next.js 16 · Prisma · SQLite · Docker · Claude API · Telegram Bot API · Resend

---

## Что умеет система

### Публичная часть (для сотрудников)

| Страница | URL | Что делает |
|---|---|---|
| Главная | `/` | Лэндинг с цитатами, статистикой и CTA |
| Зачем | `/why` | Письмо акционера, причины участвовать |
| Новости | `/news` | Лента AI-постов о заявках коллег |
| Истории успеха | `/testimonials` | Примеры внедрения AI в компании |
| Конкурс | `/contest` | Правила, этапы, призы + форма подачи заявки |
| Как участвовать | `/how-to-participate` | Пошаговая инструкция |
| Голосование | `/voting` | Алгоритм выбора победителей |
| Форум | `/forum` | Вопросы и ответы с модерацией |
| Моя заявка | `/my-application` | Просмотр AI-оценки + редактирование заявки |

### Форма заявки
- 6 категорий, 3 типа (идея/прототип/внедрение), индивидуально или команда
- **AI-превью** перед отправкой: частичный анализ с советами по улучшению
- После отправки: сотрудник может вернуться и увидеть полную оценку + рекомендации

### Админ-панель (`/admin`)

| Раздел | Что делает |
|---|---|
| **Дашборд** | KPI-карточки, графики заявок по дням/категориям/дивизионам, батч-операции |
| **Заявки** | Список с фильтрами, поиском; изменение статуса, CSV-экспорт |
| **Просмотр заявки** | Полный AI-анализ: оценки, вердикт, профиль автора, потенциал |
| **Уведомления** | Превью email → редактирование → отправка через Resend |
| **Telegram** | Отправка оценки в групповой чат комиссии |
| **Новости** | Управление постами: скрыть/показать/удалить |
| **Форум** | Модерация тем и ответов, ответ от имени модератора |
| **Аналитика** | Посещаемость страниц, уникальные пользователи |

### AI-инструменты на дашборде (батч-операции)

- **🤖 AI-оценка всех заявок** — запускает оценку Claude для всех необработанных заявок (~2 мин)
- **📨 Отправить оценки в Telegram** — отправляет все оценки в группу комиссии (~0.5 сек/заявка)
- **📰 Сгенерировать новости** — создаёт мотивационные посты по оценённым заявкам (~2 сек/заявка)

---

## Переменные окружения

> Все переменные задаются в `docker-compose.yml` на сервере. В репозитории `.env` файла **нет**.

| Переменная | Обяз. | Описание |
|---|---|---|
| `DATABASE_URL` | ✅ | `file:/app/prisma/dev.db` |
| `JWT_SECRET` | ✅ | Секрет для JWT-токенов (любая длинная строка) |
| `ADMIN_PASSWORD` | ✅ | Пароль входа в `/admin` |
| `ANTHROPIC_API_KEY` | ✅ | Ключ Claude API — нужен для AI-оценки и новостей |
| `TELEGRAM_BOT_TOKEN` | ⚡ | Токен Telegram-бота (формат `123456:AAE...`) |
| `TELEGRAM_CHAT_ID` | ⚡ | ID группового чата (отрицательное число `-100...`) |
| `RESEND_API_KEY` | ⚡ | Ключ Resend для отправки email авторам/комиссии |
| `EMAIL_FROM` | — | Адрес отправителя (по умолчанию `eai@taipit.starec.ai`) |

> ⚡ — не обязательны, но нужны для полного функционала уведомлений

---

## Деплой на новый сервер

### Требования

- Linux-сервер с Docker и Docker Compose
- Git
- Nginx (для reverse proxy)
- Домен с DNS-записью на сервер

### Шаг 1 — Клонировать репозиторий

```bash
git clone https://github.com/Viktor-admin-dev/taipit-eai-hub.git
cd taipit-eai-hub
```

### Шаг 2 — Настроить docker-compose.yml

Отредактировать файл `docker-compose.yml`:

```yaml
version: '3.8'

services:
  taipit-eai-hub:
    build: .
    container_name: taipit-eai-hub
    restart: unless-stopped
    ports:
      - "3010:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:/app/prisma/dev.db
      - JWT_SECRET=замените-на-случайную-строку-32+-символа
      - ADMIN_PASSWORD=замените-на-пароль-администратора
      - ANTHROPIC_API_KEY=sk-ant-api03-...
      - TELEGRAM_BOT_TOKEN=1234567890:AAExxxxxxxx
      - TELEGRAM_CHAT_ID=-1001234567890
      - RESEND_API_KEY=re_xxxxxxxxxxxx
      - EMAIL_FROM=eai@taipit.ru
    volumes:
      - db_data:/app/prisma

volumes:
  db_data:
```

### Шаг 3 — Запустить контейнер

```bash
docker compose up -d --build
```

Первый запуск: ~5-7 минут (сборка Next.js + инициализация БД).

Проверить запуск:
```bash
docker ps | grep taipit
docker logs taipit-eai-hub --tail 20
```

### Шаг 4 — Настроить Nginx

```nginx
server {
    listen 80;
    server_name eai.taipit.ru;   # ← ваш домен

    location / {
        proxy_pass http://localhost:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
nginx -t && systemctl reload nginx
```

### Шаг 5 — SSL (Let's Encrypt)

```bash
certbot --nginx -d eai.taipit.ru
```

### Шаг 6 — Проверить работу

Открыть в браузере:
- `https://eai.taipit.ru` — главная
- `https://eai.taipit.ru/admin` — войти с паролем из `ADMIN_PASSWORD`
- `https://eai.taipit.ru/news` — лента новостей

---

## Обновление

```bash
# 1. Запушить изменения в GitHub (с локальной машины разработчика)
git push origin main

# 2. На сервере подтянуть и пересобрать
cd /root/taipit-eai-hub    # или ваш путь
git pull && docker compose up -d --build
```

Одной командой с локальной машины:
```bash
ssh root@SERVER_IP "cd /root/taipit-eai-hub && git pull && docker compose up -d --build"
```

---

## Настройка Telegram-бота

1. Создать бота через `@BotFather` → `/newbot` → получить токен
2. Добавить бота в группу комиссии
3. Отключить Group Privacy:
   `@BotFather` → `/mybots` → выбрать бота → `Bot Settings` → `Group Privacy` → `Turn off`
4. Написать что-нибудь в группу (чтобы бот получил сообщение)
5. Получить `chat_id`:
   ```
   https://api.telegram.org/bot<TOKEN>/getUpdates
   ```
   Найти `"chat":{"id":-XXXXXXXXXX}` — это `TELEGRAM_CHAT_ID`
6. Прописать оба значения в `docker-compose.yml` и перезапустить контейнер

---

## Настройка email (Resend)

1. Зарегистрироваться на [resend.com](https://resend.com)
2. Добавить домен отправителя (например `taipit.ru`) → верифицировать DNS
3. Создать API-ключ → прописать в `RESEND_API_KEY`
4. Установить `EMAIL_FROM=eai@taipit.ru`

---

## Структура базы данных

| Таблица | Описание |
|---|---|
| `Division` | Дивизионы холдинга (заполняется при первом старте) |
| `Application` | Заявки участников конкурса |
| `TeamMember` | Члены команды в командных заявках |
| `AIEvaluation` | AI-оценки: баллы по 5 критериям, вердикт, рекомендации |
| `CommissionMember` | Email-адреса членов комиссии для рассылки |
| `NewsPost` | Посты ленты новостей (AI-генерация) |
| `EmailCampaign` | Email/Telegram-контент, созданный вместе с NewsPost |
| `ForumTopic` | Темы форума |
| `ForumReply` | Ответы на форуме |
| `EmailLog` | Лог отправленных писем |
| `PageVisit` | Аналитика посещений страниц |

---

## AI-система оценки

### Модели Claude

| Операция | Модель |
|---|---|
| Полная оценка заявки (админка) | `claude-sonnet-4-20250514` |
| Превью при заполнении заявки | `claude-haiku-4-5-20251001` |
| Генерация новостей | `claude-haiku-4-5-20251001` |

### Критерии оценки (0-100 баллов каждый)

| Критерий | Вес |
|---|---|
| Бизнес-ценность | 25% |
| Инновационность | 20% |
| Реализуемость | 25% |
| Масштабируемость | 15% |
| Качество описания | 15% |

### Вердикты

| Вердикт | Порог | Смысл |
|---|---|---|
| 🟢 support | ≥ 70 | Поддержать — идея готова к реализации |
| 🟡 develop | 40–69 | Развить — есть потенциал, нужна доработка |
| 🔴 rethink | < 40 | Переосмыслить — нужна серьёзная доработка |

---

## Разработка локально

```bash
git clone https://github.com/Viktor-admin-dev/taipit-eai-hub.git
cd taipit-eai-hub
npm install

# Инициализировать БД
DATABASE_URL="file:./prisma/dev.db" npx prisma db push
DATABASE_URL="file:./prisma/dev.db" npx prisma db seed

# Запустить
DATABASE_URL="file:./prisma/dev.db" ADMIN_PASSWORD=admin JWT_SECRET=dev-secret npm run dev
```

Открыть: http://localhost:3000
Админка: http://localhost:3000/admin (пароль: `admin`)

### Прямой доступ к БД

```bash
# Lokally
DATABASE_URL="file:./prisma/dev.db" npx prisma studio

# На продакшен-сервере
sqlite3 /var/lib/docker/volumes/taipit-eai-hub_db_data/_data/dev.db 'SELECT * FROM Application;'
```

---

## Известные технические нюансы

1. **entrypoint.sh** — запускает `prisma db push` при старте контейнера, чтобы схема БД применялась к production-volume (не к временной БД при билде)

2. **JSON от Claude** — иногда приходит обёрнутым в \`\`\`json \`\`\`. В коде везде стоит strip-логика перед `JSON.parse()`

3. **force-dynamic** — API-роуты без `NextRequest` параметра нужно помечать `export const dynamic = "force-dynamic"`, иначе Next.js пре-рендерит их при билде (когда БД пустая)

4. **Prisma версия** — проект использует 5.22.0, глобальный `prisma` может быть другой версии — всегда использовать `npx prisma` из папки проекта

5. **git push перед деплоем** — сервер тянет из GitHub (`git pull`), поэтому локальные коммиты нужно сначала запушить
