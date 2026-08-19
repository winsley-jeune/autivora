# Autonomous Store Migration — Implementation Status

## Implemented foundation (2026-08-17)

- `lib/control-plane.mjs` adds durable `workflow_runs` and `operations` tables.
- Workflow runs use unique run keys, expiring leases, completion/failure state, and recovery.
- External operations use stable idempotency keys, durable results, retry counts, and expiring reservations.
- Signal reserves its daily decision batch before the model call, preventing overlapping runs from producing duplicate batches.
- Executor task claims have two-hour leases; expired claims are automatically reopened before Signal builds its inputs.
- Scout reconciles an exact Shopify SKU before product creation and stores the create result as an idempotent operation.
- Shopify product HTML no longer contains internal supplier IDs, landed cost, shipping cost, margin, or review notes.
- Product image tooling is edit-only; no text-to-image product generation endpoint remains.
- Batch product imagery supports main, gallery, and U.S.-localized lifestyle roles while retaining supplier originals.
- Store lifecycle transitions are deterministic gates; paid testing cannot be enabled without a validated offer, attribution, positive allowable CAC, refund-path verification, and hard ad caps.
- Daily AI/ad limits and cost events are durable control-plane state.
- Commercial query clusters have exactly one owner; category/product intent is prohibited from being owned by a blog.
- Independent verification records enforce that an artifact producer cannot approve its own work.
- `lib/shopify-product-publisher.mjs` publishes only independently verified product patches, performs a live read-after-write check, versions the prior state, and automatically rolls back mismatches.
- `lib/evidence-store.mjs` durably records normalized evidence with source, observation/data horizons, expiry, payload, and explicit completeness; analytics runs persist GSC, GA4, and Shopify observations.
- Shopify order ingestion now has a deterministic pagination ceiling and reports page/row completeness instead of silently treating a truncated pull as complete.
- Every daily run now begins with a complete paginated Shopify catalog reconciliation across active, draft, and archived products, joining full descriptions, SEO metafields, variants, images, and collection membership into durable evidence consumed by Signal.
- A change-driven autonomous catalog loop audits a new Shopify catalog hash against live market evidence, applies deterministic content/economic/status gates, obtains an independent structured verification, then publishes title, description, SEO, image-alt, price, and status changes through idempotent version history with live read-after-write verification and rollback; rejected decisions are quarantined. Default run caps permit five mutations and one activation/archive per run.
- DataForSEO competitor intelligence now discovers domains sharing Autivara's SERPs and records the highest-visibility pages for Autivara plus the established competitor panel. Product/collection winners are joined to their ranking keywords, volume, positions, and Autivara gaps, then opportunity-scored for Signal; the sweep remains weekly and capped.
- Product SEO evidence now uses DataForSEO keyword suggestions/overview, commercial intent, difficulty, CPC, live SERPs, and asynchronous Google Shopping offers. Near-duplicate keyword wording is clustered before scoring, competitor-brand queries are excluded, and only priced seller offers become anchors; evidence is durable and injected into catalog audits.
- Commercial query ownership is reconciled from that evidence: broad product classes route to category pages, oil/refill demand routes to `/scents`, and specific mechanisms route to the strongest matching product. During cold start, autonomous catalog publishing requires fresh DataForSEO demand plus live competitor SERPs for every represented commercial category; sibling products may inherit matching category evidence while distinct mechanisms retain product-specific research. The daily refresh fills uncovered categories first and then rotates through product opportunities. All four current categories (`auto`, `home`, `industrial`, `scents`) now pass this evidence gate.
- A single managed-catalog scope now excludes archived and incomplete/unavailable products from SEO research, market audits, verifier calls, change detection, and Shopify mutations. The current live split is 19 managed products and 40 excluded records (28 archived; 12 unavailable drafts, with missing-image flags where applicable). Ready drafts enter scope automatically when their required listing assets, purchasable variant, and availability become complete. Partial/failed audits can no longer be recorded as complete or reach the publisher.
- Anthropic calls are cost-routed: Sonnet handles routine generation and market synthesis; Opus is reserved for independent high-risk catalog verification. Catalog audit ceilings are 8k output tokens and five searches per category, verification is capped at 4k output tokens, actual usage is recorded, and worst-case preflight reservations enforce default $1.50 daily and $15 monthly AI limits before a request is sent.

## Verification

Run:

```bash
node --test tests/*.test.mjs
```

The suite covers workflow mutual exclusion, expired workflow recovery, completed-operation replay,
failed-operation retry, expired task-claim recovery, lifecycle gates, budgets, commercial page
ownership, independent verification, Shopify HTML confidentiality, rollback publishing contracts,
analytics pagination, and the edit-only image contract.

## Next migration slice

1. Add commercial funnel and contribution-margin attribution to the evidence layer.
2. Add independent factual Content QA and Visual QA.
3. Extend versioned Shopify publishing from copy to media.
4. Convert Product and Category into autonomous commercial-page agents.
5. Rebuild Linker around category/product destinations.

The complete target and delivery sequence are in `AUTONOMOUS_STORE_PLAN.md`.
