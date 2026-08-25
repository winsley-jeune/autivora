# Daily scheduling

`scheduler.mjs` invokes `daily-run.sh`, which delegates to the resumable `daily-pipeline.mjs`,
every morning at 7:00 AM local time. This exists because of a real
incident: on 2026-07-26, Signal reported $0 revenue and reasoned as if there were no organic
orders, while a real $42 order had actually landed — `agents/analytics/output/snapshot-latest.json`
was 2 days stale because nobody had re-run `analytics:run` since. Signal only ever reads whatever
that file last said; it doesn't pull fresh data itself. This job makes sure that file is never
more than a day old.

## Why the repo lives under `~/Developer`, not `~/Desktop`

It used to live under `~/Desktop/hobby/nextjs-shopify`. macOS blocks background/`launchd`
processes from touching Desktop, Documents, or Downloads (TCC — TeamID/privacy protection)
unless the *exact executing binary* has Full Disk Access. Granting FDA to `/bin/bash` (System
Settings → Privacy & Security → Full Disk Access) did **not** fix it — `/bin/bash` is a
SIP-protected system binary, and TCC doesn't reliably honor manual FDA grants to those on modern
macOS. Moving the repo out of a TCC-protected folder sidesteps the problem entirely. **Don't move
it back under Desktop/Documents/Downloads without re-solving this.**

## Files

| File | Purpose |
|---|---|
| `daily-run.sh` | The shell entry point: sets up a `launchd`-safe environment, invokes the orchestrator, and writes summary plus per-attempt logs. |
| `daily-pipeline.mjs` | Durable orchestrator: one daily lease, per-stage checkpoints, retries and deadlines. Completed stages are not repeated after a partial failure. |
| `com.autivora.daily-signal.plist` | The `launchd` job definition. **Canonical copy lives in this repo** — the one in `~/Library/LaunchAgents/` is just an installed copy. If you edit the schedule/paths, edit here, then reinstall (see below). |

## Operating it

```sh
# Check it's loaded and see its last exit code (0 = success)
launchctl list | grep autivora

# Trigger a run right now, without waiting for 7am
launchctl start com.autivora.daily-signal

# Watch today's run
tail -f ~/Library/Logs/autivora-agents/daily-run-$(date +%Y-%m-%d).log

# launchd-level errors (e.g. the script failed to even start) — should normally be empty
cat ~/Library/Logs/autivora-agents/launchd.err.log

# Temporarily stop it firing (survives until you load it again)
launchctl unload ~/Library/LaunchAgents/com.autivora.daily-signal.plist

# After editing the plist or daily-run.sh, reinstall + reload:
cp agents/scripts/com.autivora.daily-signal.plist ~/Library/LaunchAgents/
launchctl unload ~/Library/LaunchAgents/com.autivora.daily-signal.plist 2>/dev/null
launchctl load ~/Library/LaunchAgents/com.autivora.daily-signal.plist
```

If the Mac is asleep or off at 7:00 AM, `launchd`'s `StartCalendarInterval` catches the run up
automatically the next time it wakes — no separate retry logic needed.

## What it does NOT do

Signal's Uplift/Linker/Author tasks still require their executor and review flow. The daily
catalog lane can publish only through the existing deterministic audit, independent verification,
mutation-cap, idempotency, and rollback gates. A catalog failure never suppresses the independent
analytics, reindex, Signal, Herald, Envoy, observation, Scout, or scoreboard stages.

## Failure and retry behavior

- `daily-pipeline:<local-day>` is a durable SQLite lease, so scheduler, launchd, and manual starts
  cannot overlap.
- Every stage has its own completed/failed workflow record. A retry resumes failed work and skips
  completed paid or mutating stages.
- Catalog sync retries transient failures three times with 5s/20s backoff. A recent complete
  catalog snapshot (at most 26 hours old) can support the SEO lane, while publication retains all
  of its own freshness and completeness gates.
- Each attempt has its own detailed log. The dated summary log is only for scheduler status; the
  database is authoritative workflow state.
