#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readAiEnv } from '../lib/env.mjs';
import { loadTasks, claimTask, completeTask, releaseTask } from '../signal/lib/task-store.mjs';
import { startTaskBranch, finishTaskPR, abandonTaskBranch, assertCleanFor } from '../lib/git-task-pr.mjs';
import { latestShopifyCatalogSnapshot } from '../lib/shopify-catalog.mjs';
import { callCollection } from './lib/anthropic.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const contentPath = 'data/collection-growth.json';
const taskId = Number(process.argv[2]);
const allowedPaths = new Set(['/auto', '/home', '/industrial']);
const git = (args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();

(async () => {
  const task = loadTasks().tasks.find((item) => item.id === taskId);
  if (!task || task.status !== 'open') throw new Error(`Task ${taskId} is not open`);
  if (!['uplift', 'author'].includes(task.agent) || !allowedPaths.has(task.target_url)) throw new Error(`Task ${taskId} is not a supported collection revenue task`);
  assertCleanFor([contentPath], root);
  const { ANTHROPIC_API_KEY } = readAiEnv();
  let startBranch; let branchStarted = false; let claimed = false;
  try {
    ({ startBranch } = startTaskBranch(task, root)); branchStarted = true;
    const all = JSON.parse(readFileSync(join(root, contentPath), 'utf8'));
    const snapshot = latestShopifyCatalogSnapshot();
    if (!snapshot?.complete || !Array.isArray(snapshot.products)) throw new Error('No complete Shopify catalog snapshot for grounding');
    const catalog = snapshot.products.filter((p) => p.status === 'active').map((p) => ({ handle: p.handle, title: p.title, price: p.variants?.[0]?.price, tags: p.tags, description: p.body_html }));
    const { output } = await callCollection({ apiKey: ANTHROPIC_API_KEY, task, existing: all[task.target_url] ?? null, catalog });
    if (output.comparison.rows.some((row) => row.length !== output.comparison.columns.length)) throw new Error('comparison row width mismatch');
    const validRoutes = new Set(catalog.map((p) => `/product/${p.handle}`));
    if (output.chooser.some((item) => !validRoutes.has(item.href))) throw new Error('collection output contains a non-live product route');
    await claimTask(taskId, 'collection-revenue-agent'); claimed = true;
    const { change_summary, ...content } = output;
    all[task.target_url] = content;
    writeFileSync(join(root, contentPath), `${JSON.stringify(all, null, 2)}\n`);
    execFileSync('npx', ['tsc', '--noEmit'], { cwd: root, stdio: 'inherit' });
    const prUrl = finishTaskPR({ task, files: [contentPath], commitMessage: `${task.agent}: strengthen ${task.target_url} for revenue`, cwd: root, startBranch });
    await completeTask(taskId, { prUrl, note: change_summary });
    console.log(`Collection: task #${taskId} opened ${prUrl}`);
    if (process.env.AUTONOMOUS_PR_MERGE !== 'false') {
      try {
        execFileSync('gh', ['pr', 'merge', prUrl, '--auto', '--squash'], { cwd: root, stdio: 'inherit' });
      } catch {
        console.log('Collection: repository auto-merge is unavailable; waiting for required checks.');
        execFileSync('gh', ['pr', 'checks', prUrl, '--watch', '--interval', '10'], { cwd: root, stdio: 'inherit', timeout: 12 * 60 * 1000 });
        execFileSync('gh', ['pr', 'merge', prUrl, '--squash'], { cwd: root, stdio: 'inherit' });
      }
    }
  } catch (error) {
    if (branchStarted) { try { git(['checkout', '--', contentPath]); } catch {} try { git(['checkout', startBranch]); } catch {} abandonTaskBranch(task, root); }
    if (claimed) await releaseTask(taskId, error.message);
    throw error;
  }
})().catch((error) => { console.error('FATAL:', error.message); process.exit(1); });
