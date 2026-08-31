# Signal — the analyst agent

Signal is the DECIDE stage of the growth loop described in `agents/ARCHITECTURE.md`. It reads
the analytics agent's data, scores its own past decisions, and emits a small, capped set of
tasks for the specialist agents (`ctr`, `uplift`, `linker`, `envoy`, `author`, `social`) to
execute. **It never publishes anything itself** — it only decides *what* to do; the specialists
decide *how*.

## Setup

1. Everything in `agents/analytics/` must already be configured (Search Console, GA4, Shopify —
   see that agent's env vars in `.env.example`). Signal reads its snapshot; it doesn't pull its
   own analytics data. If you've placed any of your own checkout-flow test orders, set
   `SIGNAL_TEST_CUSTOMER_EMAILS` too — otherwise Signal reads your own test purchases as
   market/demand signal.
2. Add `ANTHROPIC_API_KEY` to `.env` (platform.claude.com → API keys).
3. Run the analytics snapshot first, then Signal:

   ```sh
   npm run analytics:run
   npm run signal:run
   ```

`npm run signal:run -- --skip-crawl` skips the internal-link-graph crawl (it's cached for 6
days anyway — only useful to force a faster run). `npm run signal:run -- --dry-run` calls
Claude and prints the result without writing to the task store or query history — use it to
preview a run. `npm run signal:run -- --force` overrides the one-decision-batch-per-day guard
(see below) — normally you shouldn't need this.

**This is scheduled** — `analytics:run` → `signal:run` fire automatically every morning via
`launchd`. See `agents/scripts/README.md` for how that job works, how to check on it, and why it
runs from `~/Developer` rather than `~/Desktop`. Manual runs are still safe alongside the
schedule: a same-day guard in `run.mjs` makes a second real Signal run on a day it already ran a
no-op (costs nothing, emits nothing) rather than double-emitting tasks — this was a real incident
(a duplicate manual run created a second batch of tasks the same day) and is now caught in code,
not left to memory.

## What it reads and writes

| | Path | Committed? |
|---|---|---|
| Reads | `agents/analytics/output/snapshot-latest.json` | no (real traffic data) |
| Reads | `agents/state/agents.db` `analytics_snapshots` — one dated snapshot per day, never overwritten; feeds `metric_series` on checkbacks | no |
| Reads/writes | `agents/state/agents.db` `signal_tasks` — the task queue + decision history (writes are SQLite transactions; no lock files) | no (real traffic data as task evidence) |
| Reads/writes | `agents/state/agents.db` `signal_query_history` — last-seen query impressions, for week-over-week `new_queries` | no |
| Reads/writes | `agents/state/agents.db` kv `signal.link_graph_cache` — live crawl of blog internal links, cached 6 days | no |
| Writes | `agents/signal/output/signal-latest.json` — the day's full result (tasks, scores, note) | no |

All of the above are gitignored for the same reason as the analytics agent's output: they're
real business data, not code.

## Task schema

Each task in the `signal_tasks` table (agents/state/agents.db):

```json
{
  "id": 1,
  "status": "open",
  "created_at": "2026-07-21T...",
  "agent": "ctr",
  "action": "rewrite_title_meta",
  "target_url": "/blog/best-car-diffuser",
  "target_query": "best car diffuser 2026",
  "evidence": { "impressions_28d": 210, "ctr": 0.011, "avg_position": 6.2, "expected_ctr": 0.048 },
  "hypothesis": "...",
  "expected_effect": "CTR >= 0.03 on this query within 14 days",
  "priority": 1,
  "check_back_on": "2026-08-04"
}
```

## Calibration — thresholds are tuned to real traffic, not an assumed higher-volume site

- `CTR_IMPRESSION_MIN` (inputs.mjs) — 20, not 50. At current traffic the best page+query row
  tops out in the 30s; a 50-impression floor meant `ctr_candidates` was permanently empty.
- `ctr_lane_active` (`strategic_state`) — gates the *entire* CTR lane off below ~1,500 organic
  impressions/28d, independent of the per-candidate threshold above. Below that volume,
  per-query CTR deltas aren't statistically readable at all — the binding constraint is
  authority/indexation/position, not snippet click-through. `prompt.md` instructs Signal not
  to emit any `ctr` tasks while this is false, even if `ctr_candidates` is non-empty.
- Brand/domain queries (`"autivara.com"`, misspellings) are excluded from both candidate lanes
  and from the `organic_*` totals in `strategic_state` — they rank #1 trivially and are mostly
  rank-tracker/bot traffic, not demand. Reason from `organic_impressions`/`organic_clicks`,
  not the raw `search_console_*` totals (kept alongside for reference).

Revisit both numbers as real traffic grows — they're a snapshot of today's volume, not a
permanent constant.

## Task status lifecycle

`open` (Signal created it) → `in_progress` (an executor claimed it) → `done` (executor finished
— PR opened/merged) → `scored` (Signal read the check-back and scored the outcome), **or**
`open` → `expired` if no executor claims it within 14 days (`expireStaleTasks`, called at the
start of every Signal run) — without this, a queue with no executor consuming it fills up with
stale opens that never get scored and never release their target for re-targeting. 14, not a
tighter number, because no executor exists yet — tighten it once one is built and actually
claiming tasks same-day/next-day. Expired tasks don't feed `outcome_history` (only `scored`
tasks do) and don't count toward cooldown (nothing was actually executed). Signal only ever moves a task `open`→ (via `appendTasks`),
`open`→`expired` (via `expireStaleTasks`), and `done`→`scored` (via `applyCheckbackScores`);
the `in_progress`/`done` transitions belong to whichever executor is working the task.

**Once a task reaches `check_back_on` and is `done`,** the next Signal run computes its
`metric_series` — the real day-by-day trail from dated snapshot history between the task's
creation date and today (see `lib/snapshot-history.mjs`) — scores it (`outcome_score` in
[-1, 1], `outcome_notes`), and folds it into `outcome_history` for future runs. This is what
lets Signal's judgment improve over time instead of just its output volume. A task stuck at
`open` or `in_progress` past its check-back date is never scored — nothing executed it, so
there's nothing to measure.

## Single-writer rule (read before building an executor)

`agents/signal/lib/task-store.mjs` is the **only** code allowed to touch
the task store (`signal_tasks` in agents/state/agents.db). Every executor must go through it:

```js
import { claimTask, completeTask } from "../signal/lib/task-store.mjs";

await claimTask(taskId, "ctr-agent");     // open -> in_progress
// ...do the work, open a PR via agents/lib/git-task-pr.mjs...
await completeTask(taskId, { prUrl });     // in_progress -> done
```

Both go through `mutateTaskStore()` internally — the whole read-modify-write cycle runs inside
one SQLite write transaction (`agents/lib/db.mjs`), so concurrent writers queue instead of
clobbering each other. Never call `loadTasks()`, mutate the result, and write it back yourself
from outside `task-store.mjs` — with more than one process touching the store, that's a
lost-update bug (a claim silently reverts, the task runs twice).

## Enforcement lives in code, not the prompt

`run.mjs`'s `enforceCaps()` applies, in order: the total/8 and per-agent caps, the `author` gate,
and a **per-page cooldown** (`isOnCooldown()` in `task-store.mjs`) before anything is persisted
— so Signal re-targeting a page it already touched 3 days ago gets dropped even if the model
forgets to check `open_tasks` itself. Cooldown duration equals that agent's `check_back_on`
offset: `ctr` 14d, `uplift` 28d, `linker` 21d, `author` 35d (`CHECK_BACK_DAYS` in
`task-store.mjs`). `envoy`/`social` have no defined cooldown — they target prospects/themes, not
a single page.

## Standing policy (operator-set, lives in `prompt.md`)

Priority order: `uplift` → `author` → `linker` → `ctr` → `social` → `envoy`. `author` tasks are
gated until ≥10 tracked queries hold page-one (position ≤10) — computed automatically from live
Search Console data, not hand-maintained.

To change the policy (priority order, caps, gate threshold, judgment guidance), edit
`agents/signal/prompt.md` — it's the only place Signal's actual decision-making instructions
live. `run.mjs`'s `CAPS` constant and `task-store.mjs`'s `CHECK_BACK_DAYS` should stay in sync
with the prompt's hard rules.

## Specialist agents (not yet built)

`ctr`, `uplift`, `linker`, `envoy`, `author`, `social`, and `qa` don't exist yet — Signal emits
tasks for them into the task store, but nothing currently consumes that queue. Per
`agents/ARCHITECTURE.md`'s revised build order: `uplift`+`linker` are next — not `ctr`, since
`ctr_lane_active` is false on real data today and will stay false until Uplift/Linker earn
enough organic impressions for CTR deltas to be measurable. Then `author`+`qa`, then
`envoy`/`social`.

The write path for any content-editing executor (CTR first) is decided: git, one branch + one
PR per task, via `agents/lib/git-task-pr.mjs` — see `agents/ARCHITECTURE.md`'s "Execution
write-path" section for the reasoning. That module is scaffolded but unexercised (no real
executor has run it yet) — expect to debug it against CTR's actual first task, not trust it
blind.
