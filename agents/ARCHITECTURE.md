# Autivora Agent Platform — Architecture

A system of Claude agents that take the store **zero → scale**: validate market & products,
generate SEO & ads, read results, and decide what to scale — with a human approving anything
that spends money or touches the physical/legal world.

> **Core principle:** this is **one compounding growth loop**, not a pile of task-bots.
> Agents only create value when they validate against **real signal** (sales, ad CTR, search
> impressions). Real signal requires a **live store**. So "going live" is the fuel, not a detour.

---

## The loop

```
        ┌───────────────────────────────────────────────────────┐
        │                                                       │
   ┌────▼─────┐   ┌──────────┐   ┌─────────┐   ┌──────────┐   ┌─▼────────┐
   │ RESEARCH │──▶│ PROPOSE  │──▶│ APPROVE │──▶│ EXECUTE  │──▶│ MEASURE  │
   │ (agents) │   │ (agents) │   │ (HUMAN) │   │ (agents) │   │ (agents) │
   └──────────┘   └──────────┘   └─────────┘   └──────────┘   └────┬─────┘
                                                                   │ LEARN
                                                                   ▼
                                                            (feeds next cycle)
```

The **Orchestrator** runs this on a cadence (e.g. daily/weekly) and escalates approvals to you.

---

## Agent roster

| Agent | Owns | Inputs / data | Tools | Output | Approval gate | Success metric |
|-------|------|---------------|-------|--------|---------------|----------------|
| **Market Validator** ✅ | Demand, competitors, margins, product picks | web search, competitor sites | WebSearch, WebFetch | ranked product+SEO opportunities (`PRODUCT_ANALYSIS.md`) | — (read-only) | % of picks that later sell |
| **Catalog/SEO** ✅ started | Listings, handles, meta, per-scent SEO pages | `catalog.json`, Search Console | Shopify Admin API, Sanity | products live + SEO pages | human OK before publish | organic impressions → clicks |
| **Ads** | Campaign structure, creatives, ad copy, budget rec | product data, past ROAS | Meta/TikTok/Google Ads API | draft campaigns + a **proposed** daily budget | **HUMAN approves every $** | ROAS, CPA |
| **Analytics/Decision** | Read results, decide double-down vs kill | GA4, Shopify Analytics, ad stats | GA4 API, Shopify API | "scale X, kill Y, test Z" report | — (advisory) | accuracy of calls over time |
| **Support** (later) | Answer product/shipping/order questions | order data, FAQ | Shopify Inbox/API | drafted replies | human OK on edge cases | response time, CSAT |
| **Orchestrator** | Run the loop, sequence agents, escalate | all agent outputs | scheduling (cron) | a daily/weekly digest + approval queue | — | loop throughput |

✅ = already exists in `product-pipeline/`.

---

## Guardrails (non-negotiable — bootstrap budget < $50K)

1. **Human approves all spend.** Ads agent *proposes*; it never spends. Hard daily caps configured
   at the ad-platform level as a second backstop. A bad autonomous loop must not be able to burn
   the budget.
2. **Human owns physical + legal.** Sourcing, sample QA, photography, fulfillment, and final
   IP/compliance calls stay with you. (The Market Validator already caught a Nike trade-dress risk
   and $-trap products — keep that judgment layer.)
3. **Draft → review → publish** for anything customer-facing until trust is earned per agent.
4. **Every agent reports its uncertainty + sources.** No silent claims; cite the signal.

---

## Data layer (what the agents read/write)

- **Shopify Admin API** — products, inventory, orders, sales. *(needs `read/write_products`,
  `read_orders` scopes — currently blocked on scope grant.)*
- **GA4 Data API** — sessions, conversion, funnel drop-off.
- **Google Search Console API** — impressions, clicks, queries (SEO signal).
- **Ad platform APIs** — Meta / TikTok / Google Ads (spend, CTR, ROAS).
- **Repo state** — `product-pipeline/catalog.json` (source of truth), analysis docs.

---

## How to build it IN THIS environment (Claude Code)

- **Each agent = a Claude agent** with a scoped system prompt + the tools above (MCP/API).
  We already ran 5 research subagents live for `PRODUCT_ANALYSIS.md` — same pattern.
- **Multi-step fan-out = a Workflow** (deterministic orchestration of many agents).
- **Cadence = scheduled runs** (the `/schedule` skill creates cron routines; the Orchestrator
  is a scheduled agent that runs the loop and posts an approval digest).
- **Tools = API scripts** like `product-pipeline/shopify-sync.mjs` (the Catalog agent's hands).
  Build one small, well-tested script per capability; agents call them.

Suggested repo layout:
```
agents/
  ARCHITECTURE.md          # this file
  market-validator/        # prompts + run script  (uses product-pipeline output)
  catalog-seo/             # uses catalog.json + shopify-sync.mjs
  ads/                     # campaign/creative generation, budget proposals
  analytics/               # GA4 + Shopify readers, decision reports
  orchestrator/            # the scheduled loop + approval digest
product-pipeline/          # already the Catalog/SEO + Market Validator toolchain
```

---

## Build phases (each ships something real)

**Phase 1 — Loop v1 around ONE live product.**
Market Validator (✅) → Catalog/SEO publishes it live → Ads agent proposes a $10/day test →
you approve → it runs → Analytics agent reads ROAS → decides. *Getting this loop to work once is
the proof the platform works — and it produces your first sales as a byproduct.*
👉 **Prerequisite: the store must be live** (Shopify scope or manual import + one real product).

**Phase 2 — Tighten each stage.** Add Search Console SEO feedback; improve ad creatives from
real CTR; Analytics agent starts auto-recommending kills/scales.

**Phase 3 — Replicate & scale.** Run the loop across products/segments; add the Support agent
when order volume justifies it; Orchestrator runs daily with an approval queue.

---

## The honest dependency
Every agent past "Research" needs a **live store with traffic**. Until one real product is live
and a little traffic/spend is flowing, the loop has no signal to learn from. So **Phase 1's first
task is the same store-live task we keep hitting** — fix the Shopify scope (or manual-import the
CSV) and get one product sellable. That single step unblocks the entire platform.
