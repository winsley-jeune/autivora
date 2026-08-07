#!/bin/bash
# Daily growth-loop run: analytics snapshot, then Signal's decision pass. Wired to launchd (see
# agents/scripts/com.autivora.daily-signal.plist) so this can't go stale from someone forgetting
# to run it manually — that's exactly what happened on 2026-07-26: Signal reasoned against a
# 2-day-old snapshot and reported $0 revenue while a real $42 order had already landed, because
# nobody had re-run `analytics:run` since. This script is the fix: it runs unattended every
# morning so the snapshot is never more than a day old.
#
# launchd invokes scripts with a minimal environment (no shell profile, no fnm shims) — every
# path below is absolute for that reason. Update NODE_BIN if fnm's default Node version changes.
#
# The repo lives under ~/Developer, not ~/Desktop, on purpose: macOS blocks background/launchd
# processes from touching Desktop/Documents/Downloads (TCC) unless the exact executing binary has
# Full Disk Access — and granting that to /bin/bash didn't actually take (it's a SIP-protected
# system binary, and TCC doesn't reliably honor manual FDA grants to those). Moving the repo out
# of a TCC-protected folder sidesteps the whole problem. Don't move it back under Desktop/
# Documents/Downloads without re-solving this.
set -euo pipefail

REPO_DIR="/Users/jeunewinsley/Developer/nextjs-shopify"
NODE_BIN="/Users/jeunewinsley/.local/share/fnm/aliases/default/bin"
LOG_DIR="/Users/jeunewinsley/Library/Logs/autivora-agents"
LOG_FILE="$LOG_DIR/daily-run-$(date +%Y-%m-%d).log"

mkdir -p "$LOG_DIR"
export PATH="$NODE_BIN:/usr/bin:/bin:/usr/sbin:/sbin"
cd "$REPO_DIR"

{
  echo "=== $(date -u +%Y-%m-%dT%H:%M:%SZ) — daily-run start ==="
  echo "--- analytics:run ---"
  npm run analytics:run
  echo "--- signal:run ---"
  npm run signal:run
  echo "--- herald:run ---"
  # Herald (social drafter). Tops the approval queue up to 3 unposted drafts; exits instantly
  # when topped up. Drafts only — the operator approves and posts.
  npm run herald:run || echo "herald:run FAILED — see above"
  echo "--- envoy:run ---"
  # Envoy (outreach drafter). Exits instantly when Signal has queued no envoy tasks; drafts
  # only — sending is always the operator. Guarded like Scout so a failure can't kill the loop.
  npm run envoy:run || echo "envoy:run FAILED — see above"
  echo "--- dropship:observe ---"
  # Market observatory: daily order-count snapshots across the keyword panel. Runs BEFORE
  # Scout so sourcing reasons over fresh demand velocity. Compounds daily — never skip.
  npm run dropship:observe || echo "dropship:observe FAILED — see above"
  echo "--- dropship:run ---"
  # Scout (sourcing agent). Guarded so a Scout failure (e.g. AliExpress re-auth needed — Test-
  # status refresh tokens die after ~2 missed daily runs) can't kill the SEO loop above it.
  npm run dropship:run || echo "dropship:run FAILED — see above (likely AliExpress re-auth needed)"
  echo "=== $(date -u +%Y-%m-%dT%H:%M:%SZ) — daily-run done ==="
} >> "$LOG_FILE" 2>&1
