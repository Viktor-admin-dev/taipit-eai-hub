# Taipit EAI Hub

Внутренний портал холдинга Тайпит для конкурса идей по внедрению Enterprise AI. Сотрудники подают заявки, голосуют, читают истории коллег. Администратор управляет заявками и смотрит аналитику.

**Продакшен:** https://taipit.starec.ai
**Сервер:** Hetzner 136.243.71.213 (Docker, порт 3010)

## Стек технологий

- **Next.js 16.1.6** (React 19, TypeScript, App Router)
- **Prisma ORM** + SQLite
- **TailwindCSS 4** (тёмная тема)
- **Recharts** (графики в админке)
- **JWT** (авторизация админа)
- **Docker** (продакшен-деплой)

## Структура проекта

```
src/
├── app/
│   ├── page.tsx                    # Главная (карусель, статистика, CTA)
│   ├── why/page.tsx                # Зачем конкурс (письмо акционера, бенефиты)
│   ├── testimonials/page.tsx       # Истории успеха (4 кейса из 55-го дивизиона)
│   ├── contest/page.tsx            # Конкурс (этапы, призы, условия, форма заявки)
│   ├── how-to-participate/page.tsx # Как участвовать (воронка, тьюторы, FAQ)
│   ├── voting/page.tsx             # Система голосования (описание, FAQ)
│   ├── voting/algorithm/page.tsx   # Калькулятор алгоритма голосования
│   ├── forum/page.tsx              # Форум (MVP, хардкод)
│   ├── resources/page.tsx          # Ресурсы и обучение
│   ├── admin/
│   │   ├── login/page.tsx          # Вход в админку
│   │   ├── page.tsx                # Дашборд (KPI, графики, последние заявки)
│   │   ├── applications/page.tsx   # Управление заявками (фильтры, CSV-экспорт)
│   │   └── analytics/page.tsx      # Аналитика посещений
│   └── api/
│       ├── admin/login/             # POST — вход (пароль → JWT-кука)
│       ├── admin/verify/            # GET — проверка сессии
│       ├── admin/logout/            # POST — выход
│       ├── admin/dashboard/         # GET — данные дашборда
│       ├── applications/            # GET — список, POST — новая заявка
│       ├── applications/[id]/       # GET — одна заявка
│       ├── divisions/               # GET — список дивизионов
│       ├── stats/                   # GET — статистика для главной
│       └── analytics/               # GET/POST — аналитика посещений
├── components/
│   ├── Header.tsx                  # Навигация (7 пунктов + CTA)
│   ├── Footer.tsx                  # Подвал
│   ├── HeroCarousel.tsx            # Карусель на главной (5 слайдов, автоплей)
│   ├── StatsSection.tsx            # Блок статистики (20 дивизионов, 30 премий...)
│   ├── ApplicationForm.tsx         # Форма подачи заявки (многосекционная)
│   └── Avatar.tsx                  # Аватар с инициалами
├── data/
│   └── testimonials.ts             # Истории, дивизионы, таймлайн конкурса
└── middleware.ts                    # Трекинг посещений страниц
```

## Админ-панель

### Вход

- **URL:** https://taipit.starec.ai/admin/login
- **Пароль:** `eai-hub-admin-2026`
- Сессия живёт 24 часа (JWT в httpOnly-куке)

### Возможности

| Раздел | Что делает |
|--------|------------|
| **Дашборд** (`/admin`) | KPI-карточки, графики заявок по дням/категориям/дивизионам, таблица последних заявок |
| **Заявки** (`/admin/applications`) | Список всех заявок с фильтрами (дивизион, категория, тип, статус), пагинация, CSV-экспорт, детальный просмотр |
| **Аналитика** (`/admin/analytics`) | Посещаемость за неделю/месяц/всё время, популярные страницы, уникальные посетители, CSV-экспорт |

## Локальная разработка

### Требования

- Node.js 20+
- npm

### Запуск

```bash
# Клонировать репозиторий
git clone https://github.com/Viktor-admin-dev/taipit-eai-hub.git
cd taipit-eai-hub

# Установить зависимости
npm install

# Создать базу данных
npx prisma db push

# (Опционально) Заполнить тестовыми данными
npm run db:seed

# Запустить dev-сервер
npm run dev
```

Сайт будет доступен на http://localhost:3000

### Переменные окружения

Создайте файл `.env.local`:

```env
DATABASE_URL="file:./prisma/dev.db"
ADMIN_PASSWORD="eai-hub-admin-2026"
JWT_SECRET="taipit-eai-hub-secret-key-2026"
```

### Полезные команды

```bash
npm run dev          # Dev-сервер с hot reload
npm run build        # Продакшен-сборка
npm run start        # Запуск продакшен-сборки
npm run lint         # Проверка кода (ESLint)
npm run db:push      # Применить схему к БД
npm run db:seed      # Заполнить БД тестовыми данными
npm run db:studio    # Открыть Prisma Studio (GUI для БД)
```

## Деплой на продакшен

### Как устроен деплой

Приложение работает в Docker-контейнере на сервере Hetzner (136.243.71.213):

- **Docker** собирает оптимизированный образ (multi-stage build, Node 20)
- **Контейнер** `taipit-eai-hub` слушает порт 3010
- **Nginx** проксирует `taipit.starec.ai` → `localhost:3010`
- **Cloudflare** обеспечивает DNS и CDN
- **SSL** через Let's Encrypt

### Внесение изменений

```bash
# 1. Внести изменения в код локально

# 2. Закоммитить и запушить в GitHub
git add .
git commit -m "описание изменений"
git push origin main

# 3. Подключиться к серверу
ssh root@136.243.71.213 -i ~/.ssh/id_ed25519

# 4. Обновить код и пересобрать контейнер
cd /root/taipit-eai-hub
git pull
docker compose up -d --build

# 5. Проверить что контейнер запустился
docker ps | grep taipit
```

### Быстрый деплой одной командой

```bash
ssh root@136.243.71.213 "cd /root/taipit-eai-hub && git pull && docker compose up -d --build"
```

### Логи контейнера

```bash
# Последние логи
ssh root@136.243.71.213 "docker logs taipit-eai-hub --tail 50"

# Логи в реальном времени
ssh root@136.243.71.213 "docker logs taipit-eai-hub -f"

# Логи nginx
ssh root@136.243.71.213 "tail -50 /var/log/nginx/taipit-access.log"
```

## База данных

SQLite-файл хранится внутри контейнера по пути `/app/prisma/dev.db`.

### Модели

| Модель | Описание |
|--------|----------|
| `Division` | 20 дивизионов холдинга |
| `User` | Сотрудники (employee, leader, moderator, admin) |
| `Application` | Заявки на конкурс (идея/прототип/внедрение) |
| `TeamMember` | Участники команды для групповых заявок |
| `Vote` | Голоса за заявки |
| `StatusChange` | История изменений статусов заявок |
| `Testimonial` | Истории успеха |
| `ForumTopic` / `ForumReply` | Форум |
| `PageVisit` / `DailyStat` | Аналитика посещений |

### Категории заявок

- `efficiency` — Оптимизация процессов
- `new_process` — Новый процесс
- `new_product` — Новый продукт
- `new_feature` — Новая функция
- `analytics` — Аналитика
- `content` — Контент

### Статусы заявок

`submitted` → `reviewing` → `finalist` → `winner` / `rejected`

## Призовой фонд

| Место | Сумма | Количество |
|-------|-------|------------|
| 1 место | 150 000 руб. | 5 премий |
| 2 место | 100 000 руб. | 10 премий |
| 3 место | 50 000 руб. | 15 премий |
| **Итого** | | **30 премий** |

## Важные файлы

| Файл | Что менять |
|------|-----------|
| `src/app/contest/page.tsx` | Этапы, призы, условия конкурса |
| `src/components/StatsSection.tsx` | Числа на главной (дивизионы, премии) и тултип |
| `src/components/HeroCarousel.tsx` | Слайды на главной |
| `src/data/testimonials.ts` | Истории успеха, список дивизионов, таймлайн |
| `src/app/why/page.tsx` | Письмо акционера, причины участвовать |
| `prisma/schema.prisma` | Схема базы данных |
| `Dockerfile` | Настройки сборки, переменные окружения |
| `docker-compose.yml` | Порт, настройки контейнера |
