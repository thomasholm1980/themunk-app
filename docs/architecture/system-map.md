# System Map

## Core pipeline
## Tech stack

- Frontend: Next.js 14, Tailwind CSS
- Backend: Vercel serverless
- Database: Supabase (manual_logs, daily_state tables)
- Repo: github.com/thomasholm1980/themunk-app (monorepo)
  - apps/web — Next.js app
  - packages/core — deterministic logic

## Key API routes

- POST /api/state/today — compute and return DecisionContract
- All stateful routes require: force-dynamic, revalidate=0, Cache-Control: no-store

## Deferred / separate systems

- Oura ring integration (future)
- SHI / knowledge layer (future, must remain separate from core physiology engine)
- Objective lab tracking (future)
- Multi-agent content OS (separate department)
