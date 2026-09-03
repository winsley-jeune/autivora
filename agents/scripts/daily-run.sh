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
ATTEMPT_LOG="$LOG_DIR/daily-run-$(date +%Y-%m-%d)-$(date +%H%M%S)-$$.log"

mkdir -p "$LOG_DIR"
# Homebrew provides gh on Apple Silicon. Executor agents need it to open their PRs; launchd
# does not inherit the interactive shell's Homebrew PATH.
export PATH="$NODE_BIN:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
cd "$REPO_DIR"

if node agents/scripts/daily-pipeline.mjs > "$ATTEMPT_LOG" 2>&1; then
  echo "=== $(date -u +%Y-%m-%dT%H:%M:%SZ) — daily-run start ($ATTEMPT_LOG) ===" >> "$LOG_FILE"
  echo "=== $(date -u +%Y-%m-%dT%H:%M:%SZ) — daily-run done ($ATTEMPT_LOG) ===" >> "$LOG_FILE"
else
  status=$?
  if [ "$status" -eq 75 ]; then
    echo "=== $(date -u +%Y-%m-%dT%H:%M:%SZ) — daily-run lease-busy ($ATTEMPT_LOG) ===" >> "$LOG_FILE"
    exit 0
  fi
  echo "=== $(date -u +%Y-%m-%dT%H:%M:%SZ) — daily-run start ($ATTEMPT_LOG) ===" >> "$LOG_FILE"
  echo "=== $(date -u +%Y-%m-%dT%H:%M:%SZ) — daily-run incomplete status=$status ($ATTEMPT_LOG) ===" >> "$LOG_FILE"
  exit "$status"
fi
