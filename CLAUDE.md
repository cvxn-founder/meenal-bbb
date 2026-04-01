# BBB — Brand Building Blueprint

## Quick Start

```bash
# Install all deps (from repo root)
bun install

# Run frontend dev server
cd apps/frontend && bun dev        # http://localhost:5173

# Run worker dev server
cd workers/bbb-worker && bun dev   # http://localhost:8787
```

## Env Setup

```bash
# apps/frontend/.dev.vars (copy from .dev.vars.example)
VITE_WORKER_URL=http://localhost:8787

# workers/bbb-worker/.dev.vars (copy from .dev.vars.example)
DASHSCOPE_API_KEY=sk-...
```

## Build & Deploy

```bash
# Frontend → Cloudflare Pages
cd apps/frontend && bun run build

# Worker → Cloudflare Workers
cd workers/bbb-worker && bun run deploy
```

## Architecture

- **Frontend**: SvelteKit 5, pure CSS (no Tailwind), adapter-cloudflare, Svelte 5 runes
- **Worker**: Hono on Cloudflare Workers, DashScope/Qwen AI
- **Data**: Ontologer GraphQL at `api.ontologer.com`, localStorage for wizard state
- **State key**: `bbb-wizard-v1` in localStorage

## Key Files

- `apps/frontend/src/lib/store.svelte.js` — Svelte 5 runes wizard state + localStorage
- `apps/frontend/src/lib/backend.js` — GraphQL + semantic search calls to Ontologer
- `apps/frontend/src/lib/ai.js` — Worker AI call helper
- `apps/frontend/src/lib/components/steps/` — 12 step components
- `workers/bbb-worker/src/ai.ts` — Step-specific Qwen prompts
- `workers/bbb-worker/src/index.ts` — Hono router with CORS

## Conventions

- All CSS via `<style>` blocks in components or `app.css`; no Tailwind
- Design tokens in `app.css :root` — use CSS vars everywhere
- Font: Montserrat 400/500 only
- No emojis in UI
- Step components import `wizardState` from store and call `saveState()` on every change

## CORS Origins (worker)

Set in `wrangler.toml` ALLOWED_ORIGINS var:
- `https://bbb.platforms.ontologer.com`
- `https://bbb-frontend.pages.dev`
- `http://localhost:5173`
