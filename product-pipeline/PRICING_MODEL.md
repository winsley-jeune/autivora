# Autivara Pricing Model

Replaces the sheet's illustrative retail figures with a defensible, premium-positioned model. Re-run via `/tmp/autiv_img/pricing.py` → `node build-novelty-csv.mjs`. **Prices are not live until you re-import the CSV to Shopify.**

## Principles
1. **Value-based, not cost-plus.** Price is set by positioning and the market, not by COGS. COGS only sets a *margin floor* — the large gross margin is the budget that funds the premium (photography, brand, CX, CAC).
2. **Anchor to the premium end of the real market band.** For each product we pulled the actual Amazon/retail comp range and priced at or just above its ceiling — premium, but still credible (a new brand can't price 3× over the category without authority).
3. **Psychological endings** (`$X9`) and a **compare-at anchor ~40% above** the price for a built-in "sale" perception.
4. **Coherent tiers** so the catalog reads as a deliberate range, not random numbers.
5. **Gross margin floor ≥ 55%** on every SKU (most are 70–95%).

## Tiers
| Tier | Price band | Products |
|---|---|---|
| Car · entry novelty | $19–24 | Astronaut, Riff (guitar), Orchard (pear), Aviator (bear) |
| Car · premium | $29–34 | Solar, Disc (magnet) |
| Car · premium smart | $39 | Cabin (rechargeable), Pulse (spray) |
| Home · minimal/statement | $34–49 | Grove, Apollo, Hearth, Ember, Express, Reservoir |
| Home · hero | $49–59 | Nimbus (jellyfish), Nova (disco-ball) |
| Commercial | $49 / $129 / $299 | Plug, Atmos Wi-Fi, Atmos Pro |

## Prices (price / compare-at — gross margin vs landed COGS)
| Product | COGS | Market comp | Price | Compare-at | Margin |
|---|---|---|---|---|---|
| Astronaut | $0.90 | $9–15 | **$19** | $29 | 95% |
| Riff (guitar) | $2.66 | $10–15 | **$19** | $29 | 86% |
| Orchard (pear) | $2.65 | $10–15 | **$19** | $29 | 86% |
| Aviator (bear) | $3.73 | $10–16 | **$24** | $34 | 84% |
| Solar | $4.79 | $12–18 | **$29** | $39 | 83% |
| Disc (magnet) | $6.53 | $15–35 | **$34** | $49 | 81% |
| Grove (wood-grain) | $9.68 | $15–22 | **$34** | $49 | 72% |
| Cabin (rechargeable) | $13.69 | $18–25 | **$39** | $54 | 65% |
| Pulse (smart spray) | $10.50 | $25–30 | **$39** | $54 | 73% |
| Apollo (rocket) | $8.92 | $18–28 | **$39** | $54 | 77% |
| Hearth (fireplace) | $11.17 | $20–30 | **$44** | $59 | 75% |
| Ember (volcano) | $13.28 | $25–40 | **$49** | $69 | 73% |
| Express (steam-train) | $14.16 | $22–30 | **$49** | $69 | 71% |
| Nimbus (jellyfish) | $18.07 | $25–35 | **$49** | $69 | 63% |
| Reservoir (4L) | $13.23 | $30–45 | **$49** | $69 | 73% |
| Plug (wall smart) | $14.31 | $30–60 | **$49** | $69 | 71% |
| Nova (disco-ball) | $19.35 | $36–59 | **$59** | $84 | 67% |
| Atmos Wi-Fi | $52.40 | $50–100 | **$129** | $179 | 59% |
| Atmos Pro (HVAC) | $117.78 | $50–250 | **$299** | $399 | 61% |

## Levers to tune
- **Free-shipping threshold is $100.** Car/home SKUs sit below it on purpose (nudges 2-item baskets); commercial clears it alone. Consider bundles (device + future oils) to lift AOV over $100.
- **Compare-at** is a perception anchor — keep it credible (don't inflate beyond ~40%) to avoid looking like a permanent fake sale.
- **Test, don't set-and-forget.** These are defensible starting points; once you have traffic, A/B the hero SKUs (Nova, Ember, Atmos Pro) — premium demand is often price-*inelastic*, so test up before down.
