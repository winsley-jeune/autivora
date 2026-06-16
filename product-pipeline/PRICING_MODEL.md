# Autivara Pricing Model v2 — competitor-anchored, channel-aware

v1 priced on "gross margin" and ignored ad spend + shipping — wrong. v2 anchors to **real 2026 competitor prices** and shows **contribution margin per channel** (the number that actually decides profit/loss). **Not live until you re-import the CSV.**

## Competitor benchmarks (researched June 2026)
| Category | Competitors & price | Their angle |
|---|---|---|
| Car (smart) | **Pura Car $34.99**, **Pura Car Pro $64.99**, **Drift vent clip ~$15–20** | Cheap device + **oil/scent subscription** (~$8/mo) |
| Disco-ball | **Scandinordica $40 (100ml) / $48 (300ml)** | Viral TikTok decor + diffuser |
| Volcano/flame | **YALEDI ~$25–40** | Amazon ambience/novelty |
| Commercial HVAC | **Aroma360: Mini Pro $99.95, Mini360 $199, DaVinci $599, VanGogh $999** | Device + **oil subscription** |

**The pattern:** every premium player makes its money on the **recurring oil/refill subscription**, not device margin — the device is the razor, the oil is the blade. Autivara's oil line is still "coming soon," so there's no blade yet. **Building the refill subscription is the highest-value pricing move there is.**

## The unit-economics reality (why v1's prices "go negative")
Contribution per unit = Price − COGS − shipping − fees − **CAC**. CAC is the killer: cold Meta/Shopify traffic runs ~**$30/unit** regardless of price. So a $30+ ad cost wipes out any sub-$50 product.

| Product | Price | **Organic** | **Amazon** (30% fee+$8 CAC) | **Paid Shopify** (+$30 CAC) |
|---|---|---|---|---|
| Astronaut / Riff / Orchard | $24 | +$15 | +$8 | **−$15** |
| Aviator (bear) | $24 | +$13 | +$5 | **−$17** |
| Solar | $29 | +$17 | +$8 | **−$13** |
| Disc / Grove | $34 | +$17–20 | +$6–9 | **−$10 to −$13** |
| Cabin | $39 | +$17 | +$6 | **−$13** |
| Hearth / Apollo | $39 | +$20–22 | +$8–10 | **−$8 to −$10** |
| Pulse / Ember / Express / Reservoir / Nimbus / Nova | $44 | +$16–25 | +$3–12 | **−$5 to −$14** |
| **Plug** | $79 | +$53 | +$33 | **+$23** ✅ |
| **Atmos Wi-Fi** | $149 | +$74 | +$44 | **+$44** ✅ |
| **Atmos Pro** | $349 | +$189 | +$119 | **+$159** ✅ |

**Read this as:** car/home SKUs are profitable on **organic + Amazon**, and **lose money on paid cold Shopify** — that's structural for the category at these market-capped prices, not a pricing mistake. Only the **commercial tier ($79+) survives paid ads.**

## Strategy this dictates
1. **Channel:** sell car/home on **Amazon** (your first sale was there) and **organic/SEO**. Do **not** run paid cold Shopify/Meta on sub-$50 SKUs — you'll burn money on every order.
2. **Paid ads:** allowed only on the **commercial tier** (Plug / Atmos Wi-Fi / Atmos Pro), which clears CAC with room to spare.
3. **Build the oil-refill subscription** — that's where every competitor's profit lives, and it turns a break-even device sale into a profitable customer over time.
4. **Raise AOV with bundles** (device + starter oils) to clear the $100 free-shipping line and dilute per-order CAC.

## Prices applied (price / compare-at)
Car: Astronaut/Riff/Orchard/Aviator **$24/$34**, Solar **$29/$39**, Disc **$34/$49**, Cabin **$39/$54**, Pulse **$44/$59**.
Home: Grove **$34/$44**, Apollo/Hearth **$39/$49**, Ember/Express/Reservoir/Nimbus/Nova **$44/$59**.
Commercial: Plug **$79/$99**, Atmos Wi-Fi **$149/$199**, Atmos Pro **$349/$499**.

Re-run via `/tmp/autiv_img/pricing.py` → `node build-novelty-csv.mjs`.
