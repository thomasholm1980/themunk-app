# The Munk — Deploy Guide

## Steg 1: GitHub

```bash
# På din maskin — én gang
git init
git add .
git commit -m "feat: MVP skeleton"

# Opprett nytt repo på github.com (themunk eller themunk-app)
git remote add origin https://github.com/DITT-BRUKERNAVN/themunk.git
git push -u origin main
```

---

## Steg 2: Koble GitHub til Netlify

1. Gå til **app.netlify.com → themunk.ai prosjektet**
2. Klikk **Deploys → Link to Git provider**
3. Velg GitHub → velg repoet du nettopp opprettet
4. Build-innstillinger (skal auto-detekteres fra `netlify.toml`):
   - Base directory: `apps/web`
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Klikk **Deploy site**

---

## Steg 3: Environment variables i Netlify

Gå til **Site configuration → Environment variables** og legg inn:

```
NEXT_PUBLIC_SUPABASE_URL        = https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY   = eyJ...
SUPABASE_SERVICE_ROLE_KEY       = eyJ...
```

Finn disse verdiene i Supabase → Project Settings → API.

---

## Steg 4: Supabase oppsett

1. Gå til **supabase.com** → New project
2. Opprett disse tabellene (SQL editor):

```sql
create table manual_logs (
  id           uuid default gen_random_uuid() primary key,
  user_id      text not null,
  day_key      date not null,
  energy_1_5   int  not null check (energy_1_5 between 1 and 5),
  mood_1_5     int  not null check (mood_1_5 between 1 and 5),
  stress_1_5   int  not null check (stress_1_5 between 1 and 5),
  notes        text,
  created_at   timestamptz default now()
);

create table brief_feedback (
  id          uuid default gen_random_uuid() primary key,
  user_id     text not null,
  day_key     date not null,
  agreed      boolean not null,
  felt_state  text check (felt_state in ('GREEN','YELLOW','RED')),
  comment     text,
  created_at  timestamptz default now()
);
```

---

## Steg 5: Test lokalt

```bash
# Installer avhengigheter
cd themunk
npm install

# Kopier env-fil
cp .env.example apps/web/.env.local
# Fyll inn Supabase-verdier i .env.local

# Start dev-server
npm run dev
# → http://localhost:3000/check-in

# Test API endpoints
curl -X GET http://localhost:3000/api/brief/today \
  -H "x-user-id: test-user"

curl -X POST http://localhost:3000/api/logs \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user" \
  -d '{"day_key":"2024-03-15","energy_1_5":4,"mood_1_5":3,"stress_1_5":2}'

curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user" \
  -d '{"day_key":"2024-03-15","agreed":true,"felt_state":"YELLOW"}'
```

---

## Acceptance criteria sjekkliste

- [ ] `git push` trigger auto-deploy på Netlify
- [ ] `https://themunk.ai/check-in` laster (UI stub)
- [ ] `GET /api/brief/today` returnerer 200 + mock brief
- [ ] `POST /api/logs` returnerer 201
- [ ] `POST /api/feedback` returnerer 201
- [ ] `packages/core` inneholder null LLM-kall
- [ ] Ingen medisinsk logikk i noen fil

---

## Hva som mangler til Phase 2

- [ ] Supabase Auth (erstatter x-user-id header)
- [ ] Persistent lagring av logs og feedback
- [ ] Oura API-integrasjon
- [ ] Real brief (trend + state fra faktiske data)
- [ ] One-Action Policy v1.0
