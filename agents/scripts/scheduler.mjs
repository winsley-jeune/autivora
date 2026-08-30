#!/usr/bin/env node
// In-code daily scheduler — replaces launchd for the 7am pipeline (operator call, 2026-08-10:
// scheduling is owned by code, not delegated to the OS — macOS BTM silently disabled the
// launchd job for days with exit 78 and no log). Run it once, leave it running:
//
//   npm run scheduler
//
// Every TICK it checks: is it past RUN_HOUR local time, and is today's dated log file absent?
// If so it executes daily-run.sh (which writes that log file — the natural run-marker, so no
// extra state and no double runs). A missed morning (laptop asleep, scheduler restarted later)
// is caught on the first tick after wake — the property that keeps the AliExpress 48h refresh
// token alive. All pipeline output still lands in ~/Library/Logs/autivora-agents/.
import { existsSync, readFileSync } from "node:fs";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(__dir, "daily-run.sh");
const LOG_DIR = `${process.env.HOME}/Library/Logs/autivora-agents`;
const RUN_HOUR = 7;
const TICK_MS = 5 * 60 * 1000;

let running = false;

function localDay() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const MAX_ATTEMPTS_PER_DAY = 5;

async function networkReady() {
  try {
    const response = await fetch("https://autivara.com/robots.txt", { method: "HEAD", signal: AbortSignal.timeout(15_000) });
    return response.ok;
  } catch { return false; }
}

async function tick() {
  if (running) return;
  const day = localDay();
  if (new Date().getHours() < RUN_HOUR) return;
  // A day only counts as done when its log says so — a run that died on the wake-race
  // ("fetch failed" before Wi-Fi is up) or mid-pipeline gets retried on a later tick.
  // Capped so a persistently broken day can't burn API calls all day; Signal's own
  // one-batch-per-day guard makes retries safe against double-emitting.
  const logPath = join(LOG_DIR, `daily-run-${day}.log`);
  if (existsSync(logPath)) {
    const log = readFileSync(logPath, "utf8");
    if (log.includes("daily-run done")) return;
    if ((log.match(/daily-run start/g) ?? []).length >= MAX_ATTEMPTS_PER_DAY) return;
    console.log(`[scheduler ${new Date().toISOString()}] previous attempt for ${day} incomplete — retrying.`);
  }
  running = true;
  if (!(await networkReady())) {
    running = false;
    console.log(`[scheduler ${new Date().toISOString()}] network not ready — retrying next tick without consuming a run attempt.`);
    return;
  }
  console.log(`[scheduler ${new Date().toISOString()}] starting daily run for ${day}...`);
  // The pipeline owns per-stage deadlines and a durable 100-minute lease. This outer timeout is
  // only a final failsafe and must be longer than that lease so recovery cannot overlap a live run.
  execFile(SCRIPT, { timeout: 130 * 60 * 1000 }, (err) => {
    running = false;
    console.log(`[scheduler ${new Date().toISOString()}] daily run ${err ? `FAILED: ${err.message.slice(0, 200)}` : "done"} — see ${LOG_DIR}/daily-run-${day}.log`);
  });
}

console.log(`Scheduler up: daily pipeline at ${RUN_HOUR}:00 local (checks every ${TICK_MS / 60000}min, catches up missed mornings). Ctrl-C to stop.`);
tick();
setInterval(tick, TICK_MS);
