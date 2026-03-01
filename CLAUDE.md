# CLAUDE.md

## Project Overview

Taipit EAI Hub — внутренний портал холдинга Тайпит для конкурса идей по внедрению Enterprise AI. Next.js 16 + Prisma + SQLite + Docker.

**Production:** https://taipit.starec.ai
**Server:** Hetzner 136.243.71.213

## Quick Reference

### Tech Stack
- Next.js 16.1.6, React 19, TypeScript, App Router
- Prisma ORM 5.22.0 + SQLite (`prisma/dev.db`)
- TailwindCSS 4 (dark theme)
- JWT auth (jsonwebtoken)
- Docker multi-stage build (Node 20)

### Key Commands
```bash
# Local dev
DATABASE_URL="file:./prisma/dev.db" npm run dev
DATABASE_URL="file:./prisma/dev.db" npm run build

# DB operations (use local prisma, NOT global)
DATABASE_URL="file:./prisma/dev.db" npx prisma db push
DATABASE_URL="file:./prisma/dev.db" npx prisma db seed

# Deploy to production
ssh root@136.243.71.213 -i ~/.ssh/id_ed25519 "cd /root/taipit-eai-hub && git pull && docker compose up -d --build"

# Direct DB access on server
ssh root@136.243.71.213 -i ~/.ssh/id_ed25519 "sqlite3 /var/lib/docker/volumes/taipit-eai-hub_db_data/_data/dev.db 'SELECT ...'"
```

### Important: No .env file
There is no `.env` file in the project. Always pass `DATABASE_URL` inline when running prisma or build commands locally.

## Architecture

### Authentication (two separate systems)
1. **Admin auth** — password-based, cookie `admin_token` (24h), endpoints `/api/admin/login|verify|logout`
2. **Forum auth** — passwordless (name + email + division), cookie `forum_token` (7 days), endpoints `/api/forum/auth/login|verify|logout`

### Forum Flow
- Employee creates a topic → status `pending`
- Moderator sees it in `/admin/forum` → approves/rejects/deletes
- Moderator writes a reply → auto-publishes reply AND auto-approves topic
- Employee replies → goes to moderation (pending)
- Public forum shows: `published` topics + own `pending` topics for the author

### Database
- SQLite file persisted via Docker volume `taipit-eai-hub_db_data` → `/app/prisma/`
- Volume survives container rebuilds; schema changes need `prisma db push` in Dockerfile
- To reset forum data on server: delete directly via sqlite3 on the volume path

### Docker
- Multi-stage: `base` → `deps` → `builder` → `runner`
- Builder runs: `prisma generate` → `prisma db push` → `prisma db seed` → `next build`
- Volume maps `db_data:/app/prisma` so DB persists across rebuilds
- If container name conflicts: `docker rm -f taipit-eai-hub` then `docker compose up -d`

## Coding Conventions

### Style
- Dark theme: background `#0a0e1a`, cards with `rgba(99, 130, 255, 0.05)` borders
- Primary color: `#6382ff`, text muted: `#8898b8`, text dim: `#5a6a8a`
- Components use inline styles for colors (not Tailwind color classes) to match the theme
- CSS classes: `.card`, `.btn-primary`, `.btn-secondary`, `.badge-pending`, `.badge-published`

### API Patterns
- Admin endpoints: check `verifyAdminToken(request)` from `@/lib/auth`
- Forum endpoints: check `verifyForumToken(request)` from `@/lib/auth`
- All API routes return JSON; errors include `{ error: "message" }`
- Next.js 16 params: `{ params }: { params: Promise<{ id: string }> }` with `const { id } = await params;`

### Language
- UI text in Russian
- Code comments and variable names in English
- Commit messages in English

## Key Files

| Area | Files |
|------|-------|
| Schema | `prisma/schema.prisma` |
| Seed | `prisma/seed.ts` |
| Auth helpers | `src/lib/auth.ts` |
| Prisma client | `src/lib/prisma.ts` |
| Forum auth | `src/components/ForumAuth.tsx` |
| Forum pages | `src/app/forum/page.tsx`, `src/app/forum/[id]/page.tsx` |
| Forum API | `src/app/api/forum/topics/route.ts`, `src/app/api/forum/topics/[id]/route.ts`, `src/app/api/forum/replies/route.ts` |
| Admin forum | `src/app/admin/forum/page.tsx` |
| Admin forum API | `src/app/api/admin/forum/topics/`, `src/app/api/admin/forum/replies/` |
| Docker | `Dockerfile`, `docker-compose.yml` |

## Common Pitfalls

1. **No .env** — always pass `DATABASE_URL` inline
2. **Prisma version** — project uses 5.22.0, don't use global prisma (may be v7+)
3. **Docker volume** — DB persists in volume; schema changes in `schema.prisma` need `prisma db push --accept-data-loss` in Dockerfile before seed
4. **Container name conflict** — if `docker compose up` fails with name conflict, run `docker rm -f taipit-eai-hub` first
5. **Next.js 16 params** — route params are `Promise`, must be awaited
