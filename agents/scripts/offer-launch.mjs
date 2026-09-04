#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readAiEnv, readEnv } from '../lib/env.mjs';
import { loadStoreState, recordCost, costToday } from '../lib/store-state.mjs';
import { loadCatalog, mutateCatalog } from '../dropship/lib/catalog-store.mjs';
import { initShopify, shopifyApi } from '../lib/shopify.mjs';
import { editImage } from '../content/lib/openai-image.mjs';
import { verifyVisual } from '../visual/lib/anthropic.mjs';
import { ensureOfferLaunchSchema, activeLaunch, selectLaunchCandidate, reserveLaunch, launchDecision } from '../lib/offer-launch.mjs';

const CREATIVE_KINDS = [
  ['clean-product','premium clean studio product photograph on a warm neutral background, generous negative space'],
  ['lifestyle','product used naturally by an adult in an aspirational but believable home setting'],
  ['problem-solution','single editorial scene showing the product solving its intended customer problem, no diagrams or text'],
  ['feature','close editorial detail demonstrating the product’s visible construction and primary physical feature'],
  ['category-hero','wide premium category hero scene with the product as the clear focal point'],
  ['social','vertical-feeling high-energy lifestyle composition suitable for social discovery, without text or logos'],
];
const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,55);
const dollars = (n) => Number(Number(n).toFixed(2));

async function observeExisting(launch, state) {
  const snapshot = await import('../lib/db.mjs').then(({ openDb }) => openDb().prepare('SELECT doc FROM analytics_snapshots ORDER BY day DESC LIMIT 1').get());
  if (!snapshot) return;
  const analytics = JSON.parse(snapshot.doc);
  const route = `/product/${launch.product_handle}`;
  const sessions = analytics.ga4?.byLandingPage?.find((x) => x.landingPage === route)?.sessions ?? 0;
  const productResult = analytics.shopify?.topProducts?.find((x) => String(x.productId) === String(launch.product_key) || x.title === launch.product_title);
  const productRevenue = (productResult?.revenue ?? 0) - (productResult?.refundAmount ?? 0);
  const orders = Math.max(0,(productResult?.quantity ?? 0) - (productResult?.refundedQuantity ?? 0));
  const refunds = productResult?.refundedQuantity ?? 0;
  const economics = JSON.parse(launch.economics);
  const realizedVariableCost = economics.complete ? economics.variableCost - (economics.components?.expectedRefundCost ?? 0) : null;
  const contribution = economics.complete ? dollars(productRevenue - realizedVariableCost * orders) : null;
  const db = ensureOfferLaunchSchema();
  db.prepare(`INSERT INTO offer_observations(launch_id,day,sessions,orders,revenue,contribution_profit,refunds,complete,evidence)
    VALUES(?,?,?,?,?,?,0,?,?) ON CONFLICT(launch_id,day) DO UPDATE SET sessions=excluded.sessions,orders=excluded.orders,revenue=excluded.revenue,contribution_profit=excluded.contribution_profit,complete=excluded.complete,evidence=excluded.evidence`)
    .run(launch.id,analytics.generatedAt.slice(0,10),sessions,orders,productRevenue,contribution,refunds,contribution == null ? 0 : 1,JSON.stringify({ source:'daily analytics snapshot' }));
  const decision = launchDecision({ sessions,orders,contributionProfit:contribution,refunds,fulfilledOrders:orders+refunds },state.limits);
  if (decision.status === 'kill') {
    await initShopify();
    await shopifyApi('PUT',`products/${launch.product_key}.json`,{product:{id:Number(launch.product_key),status:'draft'}});
  }
  if (decision.status !== 'testing') db.prepare('UPDATE offer_launches SET status=?,decision_reason=?,decided_at=?,updated_at=? WHERE id=?')
    .run(decision.status,decision.reason,new Date().toISOString(),new Date().toISOString(),launch.id);
  console.log(`Offer launch: ${launch.product_title} remains ${decision.status} (${sessions} sessions, ${orders} orders, contribution ${contribution ?? 'unknown'}).`);
}

async function findOrCreateCollection(handle, title, imageAttachment) {
  const list = await shopifyApi('GET','custom_collections.json?limit=250');
  let collection = (list.custom_collections ?? []).find((x) => x.handle === handle);
  if (!collection) collection = (await shopifyApi('POST','custom_collections.json',{custom_collection:{title,handle,body_html:`<p>Purpose-built products selected for ${title.toLowerCase()}, verified for supply, delivery, and contribution margin.</p>`,published:true,...(imageAttachment ? {image:{attachment:imageAttachment,alt:`${title} collection`}} : {})}})).custom_collection;
  return collection;
}

async function main() {
  const state = loadStoreState();
  const existing = activeLaunch();
  if (existing) return observeExisting(existing,state);
  const catalog = loadCatalog();
  const selected = selectLaunchCandidate(catalog.products,{limits:state.limits});
  if (!selected) { console.log('Offer launch: no fresh margin-qualified Shopify draft candidate; no-op.'); return; }
  const candidate = selected.candidate;
  const categoryHandle = slugify(candidate.collection || candidate.demandHypothesis || 'new-arrivals');
  if (process.argv.includes('--dry-run')) {
    console.log(JSON.stringify({candidate:{shopifyId:candidate.shopifyId,title:candidate.title,category:categoryHandle},evaluation:selected.evaluation},null,2));
    return;
  }
  const launchId = reserveLaunch({candidate,evaluation:selected.evaluation,categoryHandle});
  if (!launchId) { console.log('Offer launch: another offer is already preparing/testing.'); return; }
  const db = ensureOfferLaunchSchema();
  try {
    const { OPENAI_API_KEY } = readEnv(['OPENAI_API_KEY']);
    const { ANTHROPIC_API_KEY } = readAiEnv();
    await initShopify();
    const live = (await shopifyApi('GET',`products/${candidate.shopifyId}.json`)).product;
    if (live.status !== 'draft' || !(live.images?.length)) throw new Error('Candidate must remain a Shopify draft with a real supplier image');
    if (!String(live.body_html).match(/ships? in|delivery/i)) throw new Error('Product copy lacks verified delivery disclosure');
    const referenceUrl = live.images[0].src;
    const referenceResponse = await fetch(referenceUrl,{signal:AbortSignal.timeout(30000)});
    if (!referenceResponse.ok) throw new Error(`Supplier reference image returned ${referenceResponse.status}`);
    const reference = Buffer.from(await referenceResponse.arrayBuffer());
    const referenceMediaType = referenceResponse.headers.get('content-type')?.split(';')[0] || 'image/jpeg';
    const generated = [];
    const creativeLimit = Math.min(6,Math.max(1,Number(process.env.OFFER_CREATIVE_LIMIT ?? 6)));
    const estimatedImageCost = Number(process.env.OFFER_IMAGE_ESTIMATED_USD ?? .08);
    if (costToday('ai') + creativeLimit * estimatedImageCost > state.limits.max_daily_ai_usd) throw new Error('Creative set would exceed the daily AI spend limit');
    for (const [kind,scene] of CREATIVE_KINDS.slice(0,creativeLimit)) {
      const prompt = `Use the supplied real product photograph as an immutable identity reference. Preserve the exact product shape, proportions, materials, controls, colors, and branding. Do not invent accessories, features, text, claims, packaging, or logos. Create a ${scene}. Premium Autivara editorial photography, photorealistic, commercially clear.`;
      const image = await editImage(OPENAI_API_KEY,reference,'supplier-reference.jpg',prompt,{quality:'medium'});
      const verification = await verifyVisual({apiKey:ANTHROPIC_API_KEY,referenceImageBase64:reference.toString('base64'),referenceMediaType,generatedImageBase64:image.toString('base64')});
      const passed = verification.output.product_preserved && !(verification.output.discrepancies?.length);
      db.prepare(`INSERT INTO offer_creatives(launch_id,kind,status,prompt,verification,created_at) VALUES(?,?,?,?,?,?)`)
        .run(launchId,kind,passed?'verified':'rejected',prompt,JSON.stringify(verification.output),new Date().toISOString());
      recordCost({kind:'ai',amountUsd:estimatedImageCost,operationKey:`offer:${launchId}:${kind}`,detail:{model:'gpt-image-2',subtype:'image'}});
      if (!passed) throw new Error(`${kind} creative did not preserve the real product`);
      generated.push({kind,image});
    }
    for (const creative of generated) {
      const result = await shopifyApi('POST',`products/${candidate.shopifyId}/images.json`,{image:{attachment:creative.image.toString('base64'),filename:`${slugify(live.handle)}-${creative.kind}.jpg`,alt:`${live.title} — ${creative.kind.replaceAll('-',' ')}`}});
      db.prepare('UPDATE offer_creatives SET status=?,shopify_image_id=? WHERE launch_id=? AND kind=?').run('published',String(result.image.id),launchId,creative.kind);
    }
    const title = String(candidate.collection || 'New Arrivals').replace(/(^|[-_ ])\w/g,(m) => m.toUpperCase());
    const collection = await findOrCreateCollection(categoryHandle,title,generated.find((x) => x.kind === 'category-hero')?.image.toString('base64'));
    try { await shopifyApi('POST','collects.json',{collect:{product_id:Number(candidate.shopifyId),collection_id:collection.id}}); } catch (error) { if (!/already|exists|422/i.test(error.message)) throw error; }
    await shopifyApi('PUT',`products/${candidate.shopifyId}.json`,{product:{id:Number(candidate.shopifyId),status:'active',tags:[...(Array.isArray(live.tags)?live.tags:String(live.tags).split(',')),categoryHandle,'profit-validation'].filter(Boolean).join(',')}});
    await mutateCatalog((store) => { const p=store.products.find((x) => String(x.shopifyId)===String(candidate.shopifyId)); if (p) p.status='active'; });
    const now = new Date(); const review = new Date(now.getTime()+28*86400000);
    db.prepare(`UPDATE offer_launches SET product_handle=?,shopify_collection_id=?,status='testing',launched_at=?,review_after=?,updated_at=? WHERE id=?`)
      .run(live.handle,String(collection.id),now.toISOString(),review.toISOString(),now.toISOString(),launchId);
    console.log(`Offer launch: LIVE ${live.title} → /product/${live.handle}, category /category/${categoryHandle}, score ${selected.evaluation.score}.`);
  } catch (error) {
    db.prepare("UPDATE offer_launches SET status='failed',decision_reason=?,decided_at=?,updated_at=? WHERE id=?").run(error.message,new Date().toISOString(),new Date().toISOString(),launchId);
    throw error;
  }
}

main().catch((error) => { console.error(`Offer launch failed: ${error.message}`); process.exit(1); });
