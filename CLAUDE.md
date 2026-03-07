# CLAUDE.md

## Project Overview

Taipit EAI Hub — внутренний портал холдинга Тайпит для конкурса идей EAI Challenge.
Next.js 16 + Prisma + SQLite + Docker. Полная AI-система оценки заявок через Claude API.

**Production:** https://taipit.starec.ai
**Server:** Hetzner 136.243.71.213, SSH: `ssh root@136.243.71.213 -i ~/.ssh/id_ed25519`

---

## Quick Reference

### Tech Stack
- Next.js 16.1.6, React 19, TypeScript, App Router
- Prisma ORM 5.22.0 + SQLite (`prisma/dev.db`)
- TailwindCSS 4 (dark theme)
- JWT auth (jsonwebtoken)
- Docker multi-stage build (Node 20)
- Claude API (`@anthropic-ai/sdk`)
- Telegram Bot API (fetch)
- Resend API (fetch) для email

### Key Commands

```bash
# Local dev (NO .env file — передавай DATABASE_URL inline)
DATABASE_URL="file:./prisma/dev.db" npm run dev
DATABASE_URL="file:./prisma/dev.db" npm run build

# DB operations (используй LOCAL npx prisma, не глобальный)
DATABASE_URL="file:./prisma/dev.db" npx prisma db push
DATABASE_URL="file:./prisma/dev.db" npx prisma db seed
DATABASE_URL="file:./prisma/dev.db" npx prisma studio

# Deploy to production
ssh root@136.243.71.213 -i ~/.ssh/id_ed25519 "cd /root/taipit-eai-hub && git pull && docker compose up -d --build"

# Direct DB access on server
ssh root@136.243.71.213 -i ~/.ssh/id_ed25519 "sqlite3 /var/lib/docker/volumes/taipit-eai-hub_db_data/_data/dev.db 'SELECT id,title,status FROM Application;'"

# Container logs
ssh root@136.243.71.213 -i ~/.ssh/id_ed25519 "docker logs taipit-eai-hub --tail 30"
```

---

## Architecture

### Authentication (два независимых механизма)
1. **Admin auth** — пароль → JWT, кука `admin_token` (24h)
   - endpoints: `/api/admin/login`, `/api/admin/verify`, `/api/admin/logout`
   - helper: `verifyAdminToken(request)` из `@/lib/auth`
2. **Forum auth** — имя + email + дивизион (без пароля), кука `forum_token` (7 days)
   - endpoints: `/api/forum/auth/login`, `/api/forum/auth/verify`, `/api/forum/auth/logout`
   - helper: `verifyForumToken(request)` из `@/lib/auth`

### Forum Flow
- Сотрудник создаёт тему → статус `pending`
- Модератор в `/admin/forum` → одобряет/отклоняет/удаляет
- Ответ модератора → автоматически публикует ответ И тему
- Ответ сотрудника → уходит в модерацию
- Публичный форум: `published` темы + свои `pending` для автора

### Database
- SQLite файл в Docker volume `taipit-eai-hub_db_data` → `/app/prisma/dev.db`
- Volume переживает `docker compose up --build` (данные не теряются)
- Schema migrations: `prisma db push --accept-data-loss`

### Docker
- Multi-stage: `base` → `deps` → `builder` → `runner`
- Builder: `prisma generate` → `prisma db push` → `prisma db seed` → `next build`
- `entrypoint.sh` запускает `prisma db push` при старте контейнера (для production volume)
- Volume: `db_data:/app/prisma`

### AI System
- **Full eval**: `claude-sonnet-4-20250514`, max_tokens: 4000
- **Preview/News**: `claude-haiku-4-5-20251001`, max_tokens: 2500
- JSON strip перед parse: `.replace(/^\`\`\`(?:json)?\s*/i, "").replace(/\s*\`\`\`\s*$/i, "").trim()`
- Key files: `src/lib/evaluation-prompt.ts`, `src/lib/content-generator.ts`

---

## Environment Variables

Задаются в `docker-compose.yml` на сервере. В репозитории `.env` файла нет.

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | `file:/app/prisma/dev.db` |
| `JWT_SECRET` | ✅ | Секрет для JWT токенов |
| `ADMIN_PASSWORD` | ✅ | Пароль для `/admin` |
| `ANTHROPIC_API_KEY` | ✅ | Claude API key |
| `TELEGRAM_BOT_TOKEN` | ⚡ | Telegram bot token |
| `TELEGRAM_CHAT_ID` | ⚡ | Group chat ID (negative number) |
| `RESEND_API_KEY` | ⚡ | Resend API key для email |
| `EMAIL_FROM` | — | Sender address (default: `eai@taipit.starec.ai`) |

---

## Key Files

| Area | Files |
|---|---|
| Schema | `prisma/schema.prisma` |
| Seed | `prisma/seed.ts` |
| Auth helpers | `src/lib/auth.ts` |
| Prisma client | `src/lib/prisma.ts` |
| AI evaluation prompt | `src/lib/evaluation-prompt.ts` |
| AI evaluation runner | `src/lib/evaluate.ts` |
| Content generator (news) | `src/lib/content-generator.ts` |
| Email builder + sender | `src/lib/email.ts` |
| Telegram sender | `src/lib/telegram.ts` |
| Docker | `Dockerfile`, `docker-compose.yml`, `entrypoint.sh` |
| Public header nav | `src/components/Header.tsx` |
| Application form | `src/components/ApplicationForm.tsx` |
| Forum auth context | `src/components/ForumAuth.tsx` |

### Pages

| Route | File |
|---|---|
| `/` | `src/app/page.tsx` |
| `/news` | `src/app/news/page.tsx` |
| `/my-application` | `src/app/my-application/page.tsx` |
| `/forum` | `src/app/forum/page.tsx` |
| `/forum/[id]` | `src/app/forum/[id]/page.tsx` |
| `/admin` | `src/app/admin/page.tsx` |
| `/admin/applications` | `src/app/admin/applications/page.tsx` |
| `/admin/applications/[id]` | `src/app/admin/applications/[id]/page.tsx` |
| `/admin/news` | `src/app/admin/news/page.tsx` |
| `/admin/forum` | `src/app/admin/forum/page.tsx` |

### API Routes

| Route | Method | Description |
|---|---|---|
| `/api/admin/login` | POST | Вход в админку |
| `/api/admin/verify` | GET | Проверка сессии |
| `/api/admin/dashboard` | GET | Данные дашборда |
| `/api/admin/evaluate` | POST | AI-оценка одной заявки |
| `/api/admin/batch-evaluate` | POST | AI-оценка всех необработанных заявок |
| `/api/admin/batch-telegram` | POST | Отправить все оценки в Telegram |
| `/api/admin/batch-news` | POST | Генерировать новости по всем оценкам |
| `/api/admin/notify-author` | GET/POST | Превью/отправка email автору |
| `/api/admin/notify-commission` | POST | Email-рассылка комиссии |
| `/api/admin/news` | GET/PATCH/DELETE | Управление постами новостей |
| `/api/applications` | GET/POST | Список/создание заявок |
| `/api/applications/[id]` | GET | Одна заявка |
| `/api/applications/[id]/resubmit` | POST | Переотправка заявки |
| `/api/applications/my-evaluation` | GET | AI-оценка для автора (по email) |
| `/api/applications/preview` | POST | AI-превью черновика |
| `/api/news` | GET | Лента новостей (публичная) |
| `/api/forum/topics` | GET/POST | Темы форума |
| `/api/forum/replies` | POST | Ответ на форуме |
| `/api/divisions` | GET | Список дивизионов |

---

## Coding Conventions

### Style
- Dark theme: background `#0a0e1a`, cards `rgba(99, 130, 255, 0.05)` border
- Primary: `#6382ff`, muted: `#8898b8`, dim: `#5a6a8a`
- Inline styles для цветов (не Tailwind color-классы)
- CSS-классы: `.card`, `.btn-primary`, `.btn-secondary`

### API Patterns
- Admin endpoints: `if (!verifyAdminToken(request)) return 401`
- Все роуты возвращают JSON; ошибки: `{ error: "message" }`
- Next.js 16 params: `{ params }: { params: Promise<{ id: string }> }` + `await params`
- API-роуты без `NextRequest` — добавлять `export const dynamic = "force-dynamic"`

### Language
- UI text: русский
- Code/comments/variables: английский
- Commit messages: английский

---

## Common Pitfalls

1. **No .env** — `DATABASE_URL` передавать inline при локальной работе
2. **Prisma version** — 5.22.0, не использовать глобальный `prisma` (может быть v7+)
3. **Docker volume** — DB в volume, переживает ребилды. Schema-изменения требуют `db push` в `entrypoint.sh`
4. **Container name conflict** — `docker rm -f taipit-eai-hub`, затем `docker compose up -d`
5. **Next.js 16 params** — Promise, нужен `await`
6. **force-dynamic** — API без `NextRequest` статически рендерится при билде (пустая БД = пустой ответ)
7. **git push перед деплоем** — сервер тянет из GitHub, локальные коммиты нужно запушить
8. **Claude JSON** — иногда приходит в ```json ``` — всегда strip перед parse
9. **max_tokens** — для полной оценки нужно ≥ 4000, для превью ≥ 2500 (меньше → truncated JSON)
