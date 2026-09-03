#!/usr/bin/env node
import { ollamaHealth } from '../lib/ollama-fetch.mjs';

try {
  const health = await ollamaHealth();
  console.log(`Local AI ready: ${health.model} at ${health.url}`);
} catch (error) {
  console.error(`Local AI unavailable: ${error.message}`);
  process.exit(1);
}
