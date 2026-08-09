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

Each agent has exactly **one responsibility** and writes to exactly **one resource** — no two
agents ever fight over the same field. **Signal is the only agent that decides *what* to do;**
every other agent only decides *how*. QA is a separate agent from Author (a generator is a bad
judge of its own work — same failure mode as the social pipeline's image verification: one mind
creates, another checks, nothing ships on a single opinion). CTR and Uplift are split even
though both "improve existing pages" — they optimize different metrics (clicks-per-impression
vs. position) on different cadences (titles can be iterated weekly; body content should change
at most monthly, since churning it too fast hurts with Google).

| Agent | Single responsibility | Owns (writes to) | Trigger | Autonomy | Status |
|-------|------------------------|-------------------|---------|----------|--------|
| **Market Validator** | Demand, competitors, margins, product picks | product-pipeline docs | ad hoc | full (read-only) | ✅ `product-pipeline/` |
| **Catalog/SEO** | Listings, handles, meta, per-scent SEO pages | `catalog.json`, Shopify products | ad hoc | human OK before publish | ✅ `product-pipeline/` |
| **Signal** | Interpret all incoming data, emit prioritized tasks | task queue only (`signal_tasks`, agents/state/agents.db) | daily/on-demand | full — writes nothing public | ✅ `agents/signal/` |
| **Index** | Keep every page crawlable, indexed, schema-valid | sitemap, schema, robots | daily coverage check | full | partial — `agents/analytics/index-coverage.mjs` audits; no auto-fix yet |
| **CTR** | Rewrite title+meta on pages with impressions but low CTR | title/meta fields only | Signal dispatches a `ctr` task | full | not built — waiting on `ctr_lane_active` |
| **Uplift** | Upgrade pages ranking 8–20 (depth, freshness, intent match) | body content of existing pages | Signal dispatches an `uplift` task | full | ✅ `agents/uplift/` |
| **Linker** | Maintain the internal link graph | internal links only | Signal dispatches a `linker` task, or new page published | full | ✅ `agents/linker/` |
| **Author** | Produce new pages from validated templates only | new pages | Signal dispatches an `author` task (gated on ≥10 page-one queries) | publish after QA gate | not built |
| **QA** | Verify content before it goes live (accuracy vs. product data, uniqueness, cannibalization) | approve/reject flag | any publish request | full — it's the gate | not built |
| **Envoy** | Find link prospects, draft outreach pitches | draft folder | weekly, or Signal dispatches an `envoy` task | propose-only, human sends | not built |
| **Social** | Product → verified image → caption → scheduled post | social accounts | daily quota + Signal's `social` tasks | full after week-one review | not built |
| **Ads** | Campaign structure, creatives, budget rec | ad platform drafts | ad hoc | **human approves every $** | not built |
| **Keeper** | Email capture + lifecycle flows (welcome, refill reminders) | email platform | new subscriber / order events | full within templates | not built |
| **Orchestrator** | Run the loop, sequence agents, escalate | all agent outputs | scheduling (cron) | — | not built (Signal can be scheduled directly for now) |

## Signal's task schema

Every task Signal emits carries the same shape: `agent` (who executes), `target_url` +
`target_query`, `evidence` (the actual numbers that triggered it), a falsifiable `hypothesis`,
`expected_effect` (a measurable threshold), and `check_back_on` (a date). Signal reads its own
past `check_back_on`s on the next run, scores whether the intervention worked
(`outcome_score` in [-1, 1]), and that score feeds `outcome_history` for the run after — this is
how the system's judgment improves over time, not just its output volume. Full schema and
per-agent caps: `agents/signal/README.md`.

## Build order (revised against real data, not the original assumption)

Zero sales on a handful of clicks isn't a failure signal yet — it's just not enough data to
measure conversion. But the original build order assumed CTR would be the immediate
highest-leverage lane once Signal shipped — the real numbers say otherwise: at 412 organic
impressions/28d, per-query CTR deltas aren't statistically readable (a 30-impression query
moving from 0 to 1 click isn't a signal). Signal encodes this itself —
`strategic_state.ctr_lane_active` gates the whole CTR lane off below ~1,500 organic
impressions/28d, and it's false today — but the build order should follow the same data:

1. **Signal + Index** ✅ built. `Index` still means `index-coverage.mjs`'s audit only —
   auto-fix (resubmitting to indexing, generating missing schema) isn't built.
2. **Uplift + Linker** ✅ built and proven on real production edits — see below. `unindexed_pages`
   ∩ `link_graph_gaps.orphaned` is Linker's highest-priority queue; Uplift pulls a page's
   pre-SEO-rewrite sourced version as mandatory competitor-pricing grounding when one exists
   (`resolveOriginalArticle()` in `agents/lib/blog-source.mjs`) instead of estimating.
3. **CTR** — still not built; waiting on `ctr_lane_active` to flip true (Uplift/Linker doing
   their job should get it there). Signal simply stops proposing `ctr` tasks until then.
4. **Author + QA** — template expansion, gated on Signal's page-one threshold so more pages
   aren't produced before Google has decided to trust the ones that exist.
5. **Envoy + Social**, then **Ads** and **Keeper** once there's traffic and a first-sale loop to
   feed them. Envoy in particular is qualitatively different work (real outreach/prospecting,
   not editing a repo file) — don't reuse the Uplift/Linker pattern for it uncritically.

**Proven in production (2026-07-26):** both agents have shipped real, merged PRs — Uplift
restored real, sourced competitor pricing onto two pages after an earlier version had fabricated
numbers (that PR was closed unmerged, not shipped); Linker landed 20+ internal links across the
orphaned/unindexed cluster. See `agents/uplift/prompt.md` (rule 3, "competitor pricing is the
strictest rule here") and `agents/lib/blog-source.mjs`'s `resolveOriginalArticle()` for the
guardrail that came out of the fabrication incident.

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
5. **No implicit destructive operations against the live store.** `product-pipeline/shopify-sync.mjs`
   used to delete every product and recreate the catalog from scratch — correct for pre-launch
   bootstrap, a live hazard once real orders exist (breaks order line-item references, resets
   inventory, can 404 an indexed URL). It now upserts by handle and never deletes without an
   explicit `--delete-missing` flag, previewed first in dry-run. Any future agent that touches
   the live store should default the same way: match-and-update over destroy-and-recreate.

---

## Data layer (what the agents read/write)

- **Shopify Admin API** ✅ — orders/revenue via `agents/analytics/shopify.mjs` (read-only,
  OAuth client credentials). Product catalog sync is a separate app (`product-pipeline/`).
- **GA4 Data API** ✅ — sessions/conversions via `agents/analytics/ga4.mjs`.
- **Google Search Console API** ✅ — impressions/clicks/queries/pages via
  `agents/analytics/search-console.mjs`, plus real indexing status via `index-coverage.mjs`.
- **Ad platform APIs** — Meta / TikTok / Google Ads (spend, CTR, ROAS). Not wired yet.
- **Repo state** — `product-pipeline/catalog.json` (source of truth), analysis docs,
  the `signal_tasks` table in `agents/state/agents.db` (Signal's decision queue + history).

Snapshots aren't just "latest" — the `analytics_snapshots` table (agents/state/agents.db) archives
one dated file per day, never overwritten. This is load-bearing: Signal's checkback scoring
(14/28 days after a task ships) needs the actual metric trail for that page+query between task
creation and today, not a guess reconstructed from whatever `snapshot-latest.json` happens to
show on the day it re-runs.

---

## Execution write-path (decided, applies to CTR/Uplift/Linker/Author)

**Git, PR-per-task.** On headless Next.js, blog titles/metas/body content live in repo files
(`lib/blog-*.ts`), not Shopify metafields — so for every content-editing agent, git *is* the
hands. One branch + one PR per task (`agents/lib/git-task-pr.mjs`), branch named after the
task ID, PR body carries Signal's evidence/hypothesis/expected_effect verbatim. This gives two
things for free: git history is the audit log and rollback mechanism, and a PR-per-task *is*
the "draft → review → publish" guardrail from the Guardrails section — no separate approval-
queue system to build. Trust ramp per agent: auto-merge after one-click operator approval for
the first two weeks, then let that agent commit directly once it's earned trust.

**Single-writer rule for the task store.** `agents/signal/lib/task-store.mjs` is the *only* code
allowed to mutate the `signal_tasks` table in `agents/state/agents.db` — every executor goes
through its `mutateTaskStore()` (one SQLite write transaction around the whole read-modify-write)
instead of hand-rolling one. Without this, two processes racing on shared state produce a lost
update: a task silently reverts to `open` and gets executed twice. Task status flow is
`open → in_progress → done → scored` — an executor calls `claimTask()` then `completeTask()`;
Signal owns the `open`→append step and the `done`→`scored` step, never the middle.

**Caps and cooldowns are enforced in code, not the prompt.** `agents/signal/run.mjs` clamps
Signal's output against per-agent daily caps *and* a per-page cooldown (`isOnCooldown()` in
task-store.mjs, same duration as that agent's `check_back_on` offset — 14d for `ctr`, 28d
`uplift`, 21d `linker`, 35d `author`) before anything is persisted. Same "model proposes, code
disposes" rule the Guardrails section already applies to spend, applied to Signal itself.

---

## How to build it IN THIS environment (Claude Code)

- **Each agent = a Claude agent** with a scoped system prompt + the tools above (MCP/API).
  We already ran 5 research subagents live for `PRODUCT_ANALYSIS.md` — same pattern.
- **Multi-step fan-out = a Workflow** (deterministic orchestration of many agents).
- **Cadence = scheduled runs.** `analytics:run` → `signal:run` are now genuinely scheduled —
  daily via macOS `launchd` (see `agents/scripts/README.md`). This isn't optional polish: Signal
  only ever reads whatever `snapshot-latest.json` last said, and on 2026-07-26 a 2-day-stale
  snapshot made it report $0 revenue while a real order had landed. No Orchestrator exists yet —
  a `launchd` job is the orchestrator at this scale; build the real one only once sequencing
  more than these two scripts is actually needed.
- **Tools = API scripts** like `product-pipeline/shopify-sync.mjs` (the Catalog agent's hands).
  Build one small, well-tested script per capability; agents call them.

Repo layout (current):
```
agents/
  ARCHITECTURE.md          # this file
  analytics/                # MEASURE stage — GA4 + GSC + Shopify readers → snapshot-latest.json (+ dated history/)
  signal/                    # DECIDE stage — reads the snapshot, emits the daily task queue
  uplift/                    # EXECUTE — strengthens existing page body content per an `uplift` task
  linker/                    # EXECUTE — inserts internal links per a `linker` task
  lib/                       # shared EXECUTE-stage infra: git-task-pr.mjs, blog-source.mjs, anthropic-fetch.mjs
  scripts/                   # daily-run.sh + the launchd plist — see agents/scripts/README.md
  content/                   # blog image generation (manual, not wired into the loop)
product-pipeline/            # Catalog/SEO + Market Validator toolchain
```

The store is live at autivara.com and can take real orders — but has zero *bona fide* customer
sales to date (a couple of orders in Shopify are the operator's own checkout-flow tests, excluded
from Signal's numbers via `SIGNAL_TEST_CUSTOMER_EMAILS`). The platform's constraint is no longer
"get a store live," it's working the traffic-and-conversion loop above to earn the first one.

---

## Scout — the sourcing & merchandising agent (added 2026-07-30)

The dropship catalog's brain. Where Signal decides how to grow traffic to what the store already
sells, **Scout decides what the store should sell next** — and it must do that from *market*
data (AliExpress order volumes, ratings, price distributions, competitive saturation), never
from the site's own analytics: a new site's analytics only describe the catalog it already has.
The two loops will eventually connect (site demand signals as advisory input to sourcing), but
Scout is designed to run standalone first.

Born from a real failure mode: the first sourcing pass (2026-07-29) was operator-steered one-off
scripts — every keyword, criteria change, and pricing pivot came from the human in chat, and four
near-identical import scripts accumulated in a day. Scout replaces that with the same
architecture Signal proved: deterministic data gathering → one Claude reasoning pass with a
forced-tool schema → deterministic execution against caps, all on the daily `launchd` schedule.

**The run** (`agents/dropship/run.mjs`, daily after signal:run):
1. **auth** — refresh AliExpress OAuth (Test-status tokens: 24h access / 48h refresh; daily runs
   keep the window alive; the only human-required failure is a dead refresh token → loud error
   with the re-auth URL).
2. **re-verify** — live `freight.query` on every catalog item. Core doctrine: *search results
   and listing stock lie; freight against a real address is the only truth* (dozens of
   "1000-stock ships-from-US" listings failed freight everywhere). Thin-stock items go stale in
   days; drafts that fail get auto-marked `stale`.
3. **scan** — rotate keyword territories per tier from a self-maintained queue.
4. **verify** — freight-check the highest-order-volume unseen candidates (capped/run).
5. **think** — Claude (agents/dropship/prompt.md) makes the merchandising judgments the schema
   forces: for each import, the **price multiple it can command (20x/50x/100x) and why**, the
   competition read (saturated vs emerging), the marketing angle/challenge, and **channel
   eligibility** (Amazon hazmat/brand-gating, TikTok restricted categories, or autivara-only).
   Plus keyword expansions (how it steers its own future sourcing) and catalog flags.
6. **act** — create Shopify **drafts only** (publishing and touching live products stays human —
   same model-proposes/code-disposes guardrail as Signal), update the catalog store, record
   rejects with 30-day cooldowns, persist the run's lesson.

**State** (`dropship_*` tables in `agents/state/agents.db`, single-writer transactions like Signal's task store):
products with full merchandising rationale + verification history, rejected/cooldown list,
keyword queue + per-keyword yield history, lessons. **Economics floors** live in
`lib/policy.mjs` (per-tier landed-cost/delivery caps, minimum viable multiples: `us-fast` ≥3x,
`value-china` ≥15x — Scout proposes the multiple, code clamps the floor).

Two tiers with deliberately different economics: `us-fast` (US warehouse, 2-6d, thin expensive
pool — premium/considered purchases) and `value-china` (China origin, 7-15d, $1-10 landed, deep
social proof — the classic impulse-buy tier whose margin funds paid acquisition).

Not built yet, in dependency order: **order-relay** (Shopify webhook → `ds.order.create` →
tracking sync — blocked on the PayPal/auto-pay whitelist, itself blocked on the operator's
PayPal being Argentina-domiciled), Amazon API as a second sourcing/selling channel, and the
**social publication lane** (operator-identified as the actual growth constraint for a new site:
impressions/clicks + social distribution — next lane to build after Scout).

---

## Product roadmap — three modules on one sourcing engine (operator, 2026-07-30)

| Module | Constraint profile | Monetization | Status |
|---|---|---|---|
| **1. Autivara sourcing** | delivery flexible; profit **7–10x** landed (floor 7x, `dropship/lib/policy.mjs`) | first-party store margin | **live** (Scout) |
| **2. Shopify app** | merchants bring NOTHING but their Shopify store — they must never know the supplier exists; install + connect from the Shopify dashboard, pick a niche, products appear | app is **free**; **+1–2% on each product's price**, collected only when a merchant sells | future — full intermediary model (decided 2026-07-30): WE are merchant-of-record with the supplier (our accounts/payment); charge merchant FIRST (Stripe: landed + 1-2%), then place supplier order; opaque merchant-visible SKUs (current `AE-{id}-{sku}` format leaks supplier — mapping moves to our DB); GPT retouch is a MANDATORY white-labeling stage; delivery framed as "our fulfillment network," honest on time, silent on source |
| **3. Amazon layer** | **strict 2–5 day delivery**; any niche, not just scent/car | Amazon sales | future — blocked on seller approval (SP-API, category ungating) |

Cross-cutting: **GPT image retouch** (supplier photos are not brand-usable; reuse the
`agents/content` gpt-image-2 plumbing as a shared service for all three modules).
Autivara's growth layer continues in parallel: Signal/SEO (live), better descriptions/images,
and the **social publication lane** — the operator-identified constraint (impressions/clicks)
for a new site — is the next Autivara-side build.

Never conflate module constraints: delivery strictness, niche breadth, and margin targets are
per-module. The strict 2–5d requirement briefly (wrongly) applied to Module 1 belongs to
Module 3 only.
