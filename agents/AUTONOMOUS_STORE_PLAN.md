# Autonomous Store Platform — Rearchitecture and Delivery Plan

**Goal:** Build an AI-operated ecommerce system that can take a new store from cold start to a repeatable path toward six-figure annual revenue. The operator supplies credentials and strategic constraints; agents perform routine research, sourcing, merchandising, publishing, distribution, measurement, and optimization.

Revenue is a target, not a software guarantee. The platform must guarantee disciplined execution, bounded risk, truthful merchandising, measurable experiments, recovery from failure, and allocation toward profitable activity.

## 1. Operating principles

1. **Commercial pages own SEO.** Category/collection and product pages are the primary targets for keywords, links, content, and authority. Blogs exist only when they earn links, answer a pre-purchase question, or measurably route users to commercial pages.
2. **External evidence bootstraps the store.** Before first-party data is statistically useful, decisions rely on SERPs, competitor offers, marketplaces, supplier economics, reviews, social demand, and delivery feasibility.
   The cold-start evidence gate is category-first: representative DataForSEO demand, live SERPs, Shopping offers, and comparable competitor pages may ground sibling products in the same category. Product-level evidence refines distinct mechanisms and long-tail positioning; it is not required once per near-identical SKU.
3. **One agent creates; another verifies.** A generator never approves its own copy, image, product, price, link, or campaign.
4. **Autonomous does not mean unconstrained.** Deterministic policy gates control truthfulness, margin, API spend, publishing, retries, and rollback.
5. **Every side effect is idempotent and reversible.** Shopify writes, media uploads, deployments, outreach, and later ad changes use durable operation IDs, version history, post-write verification, and rollback.
6. **Revenue outranks activity.** Rankings, impressions, posts, and products are intermediate metrics. Decisions ultimately optimize contribution profit, cash conversion, and repeat purchase.
7. **The system acts on the current constraint.** It does not produce content or add products merely to stay busy.

## 2. Store lifecycle

The control plane maintains one explicit lifecycle state. Signal changes state only when deterministic gates pass.

### BOOTSTRAP

Objective: create a trustworthy, technically complete commercial foundation.

- Validate credentials, Shopify configuration, checkout, payments, tax, shipping, analytics, Search Console, Merchant Center, and supplier access.
- Select a narrow initial assortment using external demand, competition, landed cost, delivery, reliability, and differentiation.
- Build category taxonomy and assign one search-intent owner per query cluster.
- Create unique product/category copy, structured data, feeds, and branded image sets.
- Verify the complete customer journey with synthetic orders and automatic refunds/cancellation where supported.

Exit gate: commercial pages are live, indexable, truthful, purchasable, measurable, and operationally fulfillable.

### DISCOVERY

Objective: earn qualified impressions and visits without paid acquisition.

- Submit and verify commercial URLs.
- Publish product-led organic social assets.
- Build internal links toward categories/products.
- Perform selective outreach for category and product authority.
- Use supporting content only for uncovered commercial questions or linkable assets.

Exit gate: sustained qualified impressions or social engagement exists on commercial offers; enough behavior exists to identify weak offers and landing pages.

### VALIDATION

Objective: prove that at least one offer converts and can be fulfilled reliably.

- Improve product proposition, assets, pricing, trust, shipping clarity, and checkout.
- Run controlled organic creative and offer experiments.
- Attribute product views, carts, checkouts, purchases, refunds, delivery outcomes, and contribution margin.
- Retire products that repeatedly fail demand, margin, or fulfillment gates.

Exit gate: at least one product/category has credible purchase intent, verified unit economics, accurate attribution, and acceptable fulfillment quality.

### PAID_TESTING

Objective: test whether qualified traffic can be acquired below the allowable CAC.

- Start with small, code-enforced budgets and stop-loss rules.
- Use only validated products and verified creative.
- Optimize against contribution profit, not platform ROAS alone.
- Separate creative, audience, landing-page, and offer experiments.

Exit gate: repeated cohorts acquire customers within the contribution-margin threshold and operational capacity.

### SCALING

Objective: increase profitable volume without degrading margin, fulfillment, or customer experience.

- Increase budgets gradually based on confidence intervals and cash constraints.
- Expand winning query clusters, creatives, products, channels, and retention flows.
- Forecast inventory/supplier risk and throttle demand before service failures.
- Protect proven pages and offers from unnecessary model churn.

### DEFENSE

Objective: preserve winners and improve resilience.

- Monitor competitors, SERP changes, supplier reliability, policy changes, creative fatigue, and margin compression.
- Maintain redundant suppliers and rollback-ready assets/content.
- Prioritize retention, referrals, brand search, and direct traffic.

## 3. Target architecture

```text
External APIs and storefront events
  Shopify · GA4 · GSC · Merchant Center · suppliers · SERPs · social · ads
                              │
                              ▼
                     Evidence ingestion layer
             normalized facts + freshness + completeness
                              │
                              ▼
                      Durable control plane
       lifecycle · workflows · leases · budgets · policies · versions
                              │
                              ▼
                        Signal strategist
              identifies the current business constraint
                              │
                 ┌────────────┼────────────┐
                 ▼            ▼            ▼
             Specialist   Independent   Execution
             generator      verifier     adapter
                 │            │            │
                 └────────────┴─────┬──────┘
                                    ▼
                      Shopify / site / channels
                                    │
                                    ▼
                       Live-state verification
                                    │
                          pass ──────┴────── fail
                           │                  │
                        measure       retry/quarantine/
                           │             rollback
                           └──────────┬───────┘
                                      ▼
                              outcome learning
```

## 4. Agent responsibilities

### Signal — portfolio strategist

- Determines lifecycle state and current constraint.
- Allocates work and budgets across sourcing, catalog, SEO, creative, distribution, conversion, retention, and ads.
- Uses external evidence heavily during cold start and progressively weights first-party profit data.
- Does not write storefront content or call publishing APIs.

### Market and Sourcing

- Finds demand territories and product candidates.
- Verifies supplier, freight, stock, landed cost, delivery, restrictions, competition, and price anchors.
- Proposes products only within deterministic economic and compliance policies.
- Maintains multiple-source options and retires unreliable offers.

### Category

- Owns taxonomy, category assortment, broad commercial query clusters, category copy, filters, merchandising order, and category schema.
- Prevents category/product keyword cannibalization.
- Measures product discovery, category-to-product CTR, and category-assisted revenue.

### Product

- Owns product-specific query clusters, titles, descriptions, FAQs, structured data, offer clarity, trust information, and conversion experiments.
- Uses verified product facts, SERPs, competitors, reviews, and sibling differentiation.
- Publishes directly through a versioned Shopify adapter after independent verification.

### Visual

- Accepts arrays of existing supplier images classified as main, gallery, detail, and lifestyle.
- Edits each real source into consistent Autivara assets; never invents the product from a description.
- Localizes lifestyle context for the target market without inventing features or claims.
- Produces Shopify, Merchant Center, social, and optional supporting-content derivatives.

### Visual QA

- Compares every derivative with its source for product fidelity.
- Checks text/claim accuracy, artifacts, cultural fit, crop, resolution, consistency, and channel policy.
- Retries within a cost cap; otherwise quarantines the asset/product.

### Technical SEO / Index

- Owns sitemap, canonicals, robots, schema, Merchant Center feed health, redirects, crawlability, and index monitoring.
- Verifies live pages after every publish and remediates technical defects automatically.

### Linker

- Maintains a full graph across categories, products, guides, and supporting articles.
- Routes authority and users toward the correct commercial owner.
- Measures commercial click-through and assisted revenue, not number of links inserted.

### Supporting Content

- Creates or retains an article only when it serves a defined commercial query gap, backlink purpose, or pre-purchase objection.
- Every article has a commercial destination and measurable routing threshold.
- Merges, redirects, or removes content that produces no authority or commercial progression.

### Herald / Distribution

- Selects products and offers, requests verified assets, writes channel-native copy, publishes, and measures outcomes.
- Uses platform APIs rather than maintaining a human approval queue.
- Feeds creative performance back to Product, Visual, and Signal.

### Envoy / Authority

- Discovers, qualifies, personalizes, sends, and follows up on outreach within reputation and volume controls.
- Uses a dedicated sending domain, deliverability monitoring, opt-out handling, and domain-level cooldowns.
- Optimizes for earned links/referrals, not email volume.

### Conversion

- Diagnoses product-view, cart, checkout, and purchase friction.
- Runs isolated experiments on offer, price presentation, trust, shipping clarity, merchandising, and checkout.
- Protects winners using minimum sample and confidence rules.

### Keeper / Retention

- Operates welcome, browse/cart abandonment, post-purchase, refill/replenishment, win-back, and referral flows.
- Enforces consent, frequency, suppression, and deliverability rules.
- Measures incremental repeat contribution profit.

### Ads

- Disabled until the paid-readiness gate passes.
- Creates campaigns only for validated products with verified attribution and allowable CAC.
- Enforces account-level daily caps, experiment budgets, automatic stops, and gradual scaling.

## 5. Automated publish contract

Every external mutation follows the same state machine:

```text
proposed → policy_checked → generated → independently_verified
→ reserved → published → live_verified → measuring
                     ↘ failure: retry → quarantine → rollback
```

Required properties:

- Stable operation ID and idempotency key.
- Expected source version to prevent stale writes.
- Before/after artifact and API response.
- Generator and verifier identities/model versions.
- Policy decisions and confidence scores.
- Retry count, cost, timestamps, and error category.
- Live read-after-write verification.
- Previous version retained until verification completes.
- Automatic rollback or quarantine on failure.

## 6. Data and control plane

Replace output JSON as the internal handoff with a durable database API. JSON remains an optional human/debug export.

Core entities:

- `store_state`: lifecycle, current constraint, objectives, risk limits.
- `workflow_runs` and `workflow_steps`: durable execution, leases, retries, dependencies.
- `operations`: idempotency keys and external side-effect state.
- `evidence`: source, observed time, freshness, completeness, payload reference.
- `products`, `categories`, `query_clusters`, `page_owners`.
- `supplier_offers` and `fulfillment_verifications`.
- `assets`, `asset_sources`, `asset_variants`, `verification_results`.
- `content_versions`, `shopify_versions`, `deployments`, `rollbacks`.
- `experiments`, `variants`, `exposures`, `outcomes`.
- `budgets`, `cost_events`, `unit_economics`.
- `incidents`, `quarantines`, `alerts`.

Use constrained columns for identity, ownership, status, and dates; retain flexible evidence in JSON. Production storage needs migrations, encryption, backups, restore tests, and least-privilege access.

## 7. Measurement hierarchy

### North-star metrics

- Contribution profit.
- Net revenue.
- Cash conversion and refund-adjusted margin.
- Repeat purchase contribution.

### Commercial funnel

- Qualified category/product sessions.
- Category-to-product CTR.
- Product-view-to-cart rate.
- Cart-to-checkout and checkout-to-purchase rate.
- Revenue and contribution per landing page/query/channel.
- Blog-to-commercial CTR and assisted revenue.

### Operational health

- Delivery success/time, cancellations, refunds, chargebacks.
- Supplier stock and price volatility.
- Indexation, feed disapprovals, API failures, workflow latency.
- Agent/API cost per successful outcome.

No task is considered successful merely because it was published.

## 8. Ad-readiness gate

Ads remain unavailable until all conditions pass:

- At least one product has verified stock, delivery, pricing, and fulfillment feasibility.
- Product and category pages pass content, visual, technical, and live-store QA.
- Checkout and purchase attribution are verified end to end.
- Refund, cancellation, and support paths function.
- Allowable CAC is computed from conservative economics:

```text
allowable CAC = selling price
              - landed cost
              - fulfillment and payment costs
              - expected refunds/chargebacks
              - required contribution margin
```

- Organic/social behavior provides evidence of purchase intent, or an explicit low-cost discovery experiment is justified.
- Hard account budgets and automatic stop rules are active.

## 9. Delivery sequence

### Phase 0 — Freeze unsafe expansion and establish baselines

- Back up SQLite and external configuration.
- Inventory all live Shopify products, assets, content, feeds, analytics events, and credentials.
- Scan and remove internal supplier/cost comments from customer-facing HTML.
- Record current indexation, traffic routing, conversion, revenue, and operational health.
- Stop building new blog-first agents and avoid autonomous ads.

**Completion:** current state is recoverable and measurable.

### Phase 1 — Durable autonomous control plane

- Add workflow runs/steps, leases, idempotency, operations, costs, incidents, and lifecycle state.
- Centralize typed configuration and secrets; remove machine-specific paths.
- Add structured logs, health checks, alerting, backups, and restore tests.
- Replace whole-pipeline shell retries with per-step durable retries.
- Add unit, concurrency, API-contract, and recovery tests plus CI.

**Completion:** crashes and duplicate runs cannot create duplicate external side effects.

### Phase 2 — Evidence layer and commercial ownership

- Paginate and normalize Google, Shopify, supplier, SERP, and competitor inputs.
- Record freshness and completeness for every observation.
- Build category/product/query ownership and cannibalization checks.
- Add full funnel and contribution-margin attribution.
- Introduce lifecycle-aware Signal constraint diagnosis.

**Completion:** Signal can explain what limits growth and why, including during cold start.

### Phase 3 — Autonomous catalog and asset publishing

- Upgrade Product and create Category as primary commercial agents.
- Turn Visual into the array-based commercial asset service.
- Add independent Content QA and Visual QA.
- Build versioned Shopify copy/media publishing with read-after-write verification and rollback.
- Add technical SEO and Merchant Center verification.

**Completion:** a validated supplier candidate can become a truthful, branded, indexed, purchasable offer without a human step.

### Phase 4 — Commercial SEO and organic distribution

- Rebuild Linker around category/product destinations.
- Audit every blog for commercial routing, authority value, merge, redirect, or removal.
- Connect Herald to verified assets and platform publishing APIs.
- Connect Envoy to controlled sending and deliverability monitoring.
- Measure every channel through commercial progression and contribution.

**Completion:** the system can generate qualified discovery and learn which offers and creatives deserve investment.

### Phase 5 — Conversion and retention

- Add offer/page experimentation with isolation, sample gates, and rollback.
- Automate merchandising order using demand and profit.
- Add lifecycle messaging with consent and frequency controls.
- Incorporate delivery, refund, and support outcomes into sourcing and promotion decisions.

**Completion:** traffic is converted and retained systematically rather than merely increased.

### Phase 6 — Paid testing and scale

- Implement ad platform adapters only after the readiness gate passes.
- Begin capped product/creative tests with contribution-based stop rules.
- Scale only repeated profitable cohorts; automatically contract on deterioration.
- Expand channels, categories, and suppliers based on proven economics.

**Completion:** acquisition can grow without violating cash, margin, or operational constraints.

## 10. Immediate build backlog

Build in this order:

1. Remove sensitive supplier/economic data from Shopify HTML and audit live pages.
2. Add durable operations/idempotency for Shopify product and media creation.
3. Add workflow runs, per-step leases, retries, and lifecycle state.
4. Replace Signal's daily race with a unique run lease.
5. Add complete pagination, freshness, and completeness metadata to evidence ingestion.
6. Add commercial page/query ownership and funnel attribution.
7. Implement independent product/content factual QA.
8. Complete array-based Visual transformation plus independent visual QA.
9. Implement versioned autonomous Shopify copy/media publishing and rollback.
10. Build Category and upgrade Product around external SERP/demand plus conversion evidence.
11. Rebuild Linker for category/product authority routing.
12. Integrate Herald publishing and creative feedback.
13. Audit/merge/redirect low-value blogs.
14. Add conversion and retention experimentation.
15. Build ads only after the readiness gate is demonstrably satisfied.

## 11. Definition of success

The rearchitecture is successful when:

- Routine operation requires credentials and policy configuration, not manual approvals.
- Every live product is sourced, branded, verified, published, measured, and recoverable through the platform.
- Category and product pages own commercial search demand.
- Blogs either contribute authority/revenue routing or are removed.
- Signal consistently identifies and addresses the current commercial constraint.
- No failed retry creates duplicate Shopify products, media, posts, outreach, or spend.
- Every external action has lineage, cost, verification, and rollback.
- Paid acquisition cannot activate before readiness or exceed unit-economic limits.
- The platform can demonstrate a repeatable progression from evidence to profitable outcomes.
