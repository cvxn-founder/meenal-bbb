# BBB — Project Plan

## Goal

A 12-step pharma brand strategy wizard for Indian pharma products. Guides marketing teams through structured analysis using the Brand Building Blueprint (BBB) framework.

## Target User

Pharma brand managers and marketing strategists working on Indian pharmaceutical products. Example use case: VIRILEX (TTK Healthcare) in the Sex Tonics & Stimulants category.

## Status: v1 Complete

### Built
- [x] Full 12-step wizard UI (SvelteKit 5 + pure CSS)
- [x] Persistent wizard state (localStorage, Svelte 5 runes)
- [x] Sidebar navigation with step locking
- [x] Cloudflare Worker with Qwen AI integration
- [x] Step-specific AI prompts for all 12 steps
- [x] Ontologer GraphQL integration (drug lookup)
- [x] Semantic search for competitor drugs and publications
- [x] Patient funnel visualization (CSS-based)
- [x] SWOT pre-fill from AI
- [x] AWACS leaderboard with market share bars
- [x] Design system: Ontologer GitHub Dark Slate theme

### Step Coverage
1. Product Orientation — brand/drug data + Ontologer lookup
2. Environment Understanding — India pharma data + attractiveness ratings
3. Market Definition — AWACS code, market sizing, competitor search
4. Patient Funnel — 4-level funnel with % calc + visual
5. Patient Journey Mapping — 6 stages with descriptions
6. Leverage Point — matrix with toggle + auto-recommend
7. KSH — stakeholder table + India doctor universe
8. Contested Categories — competitor grid + segment matrix
9. Brand Wheel — features/evidence/SMP/essence + publications
10. Segmentation — HCP tier table with MMM calculation
11. SWOT — 4-quadrant editable + AI generation + auto-fill
12. AWACS View — leaderboard from pasted data + market share bars

### Planned / Future
- [ ] Export to PDF (full BBB report)
- [ ] Multi-brand support (save/load different brands)
- [ ] Cloudflare Pages deployment
- [ ] SSE streaming AI responses (worker endpoint ready)
- [ ] Print-friendly report view
