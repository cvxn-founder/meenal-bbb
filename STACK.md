# BBB — Stack

## Frontend (apps/frontend)

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | SvelteKit 5 | Runes for reactive state, lightweight |
| Adapter | @sveltejs/adapter-cloudflare | Deploy to CF Pages |
| CSS | Pure CSS (no Tailwind) | Design token system, full control |
| Font | Montserrat 400/500 | Matches Ontologer brand |
| State | Svelte 5 `$state` + localStorage | Simple, no external deps |
| HTTP | Native fetch | No library needed |
| Build | Vite 6 | Fast dev, CF Pages compatible |

## Worker (workers/bbb-worker)

| Layer | Choice | Reason |
|-------|--------|--------|
| Runtime | Cloudflare Workers | Low latency, global edge |
| Framework | Hono | Lightweight, CF-native |
| AI | DashScope / Qwen-turbo | Cost-effective, good pharma knowledge |
| CORS | Manual headers | Simple, no middleware |

## External Services

| Service | Purpose | URL |
|---------|---------|-----|
| Ontologer GraphQL | Drug entity data | `api.ontologer.com/graphql` |
| Ontologer Search | Competitor + publication search | `api.ontologer.com/api/search/simple` |
| DashScope | Qwen LLM inference | `dashscope-intl.aliyuncs.com/compatible-mode/v1` |

## Data Flow

```
User fills form
  → wizardState ($state rune) updated
  → saveState() → localStorage
  → onBlur/onMount → backend.js → Ontologer API → data panel updates

User clicks "Analyze with AI"
  → ai.js → POST workers/bbb-worker/ai/analyze
  → ai.ts buildUserPrompt(step, wizardData)
  → callQwen() → DashScope API
  → narrative returned
  → displayed in AiPanel component
```

## Design System

Design tokens in `app.css :root`. Key:
- `--bg: #0d1118` — page background
- `--chrome-bg: #1b222c` — sidebar/headers
- `--panel-bg: #181f29` — data panels
- `--accent: #9ecbff` — interactive/highlight
- `--green/#34d399, --amber/#f59e0b, --red/#f87171` — status colors
