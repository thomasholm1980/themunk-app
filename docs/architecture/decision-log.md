# Decision Log

Format: Date | Decision | Reason | Status

---

2026-03-09 | Remove signals auto-reveal animation
Reason: Caused render flicker and violated calm UX principle
Impact: Signals now appear through natural scroll only
Status: Active

---

2026-03-09 | Remove introIdle gate from showForecast
Reason: Forecast was blocked behind HeroMunk animation timing — violated deterministic render rule
Impact: Content renders immediately when contract arrives
Status: Active

---

2026-03-09 | Replace dark gradient bg with flat warm surface #e9e6e0
Reason: Dark gradient to zinc-950 killed contrast on Reflection, WeeklyStatePath, Why This Today
Impact: All content sections now fully legible on mobile
Status: Active

---

2026-03-09 | Add state_trace jsonb to daily_state table
Reason: Observability — trace threshold decisions for debugging and audit
Status: Active

---

2026-03-09 | All stateful API routes require force-dynamic + Cache-Control no-store
Reason: Vercel serverless caching caused stale state responses
Status: Active policy — apply to all new routes

---

2026-03-09 | SHI and knowledge layer must remain separate from core physiology engine
Reason: Mixing probabilistic knowledge with deterministic state engine violates core design
Status: Hard constraint
