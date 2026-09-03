import { readOptionalEnv } from './env.mjs';
import { openDb } from './db.mjs';

const env = readOptionalEnv(['OLLAMA_URL', 'OLLAMA_MODEL', 'OLLAMA_CONTEXT_TOKENS', 'OLLAMA_TIMEOUT_MS']);
export const OLLAMA_URL = process.env.OLLAMA_URL ?? env.OLLAMA_URL ?? 'http://127.0.0.1:11434';
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? env.OLLAMA_MODEL ?? 'qwen3.5:9b';
const CONTEXT_TOKENS = Number(process.env.OLLAMA_CONTEXT_TOKENS ?? env.OLLAMA_CONTEXT_TOKENS ?? 49152);
const TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS ?? env.OLLAMA_TIMEOUT_MS ?? 20 * 60 * 1000);
const MAX_ATTEMPTS = 3;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function recordTrainingExample({ label, model, systemPrompt, userContent, output }) {
  const db = openDb();
  db.exec(`CREATE TABLE IF NOT EXISTS ai_training_examples (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    agent_label TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    user_content TEXT NOT NULL,
    output_json TEXT NOT NULL,
    validation_status TEXT NOT NULL,
    operator_correction_json TEXT,
    business_outcome_json TEXT
  )`);
  db.prepare(`INSERT INTO ai_training_examples
    (created_at, provider, model, agent_label, system_prompt, user_content, output_json, validation_status)
    VALUES (?, 'ollama', ?, ?, ?, ?, ?, 'schema_valid')`)
    .run(new Date().toISOString(), model, label, systemPrompt, JSON.stringify(Array.isArray(userContent)
      ? userContent.map((part) => part?.type === 'image' ? { type: 'image', omitted_from_training_log: true } : part)
      : userContent), JSON.stringify(output));
}

export function ollamaUserMessage(userContent) {
  if (!Array.isArray(userContent)) return { role: 'user', content: String(userContent) };
  const text = userContent.filter((part) => part?.type === 'text').map((part) => part.text).join('\n');
  const images = userContent.filter((part) => part?.type === 'image' && part.source?.data).map((part) => part.source.data);
  return { role: 'user', content: text, ...(images.length ? { images } : {}) };
}

export function assertSchema(value, schema, path = '$') {
  if (!schema) return;
  const type = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
  if (schema.type === 'integer' && !Number.isInteger(value)) throw new Error(`${path} must be an integer`);
  if (schema.type === 'number' && (type !== 'number' || !Number.isFinite(value))) throw new Error(`${path} must be a finite number`);
  if (schema.type && !['integer', 'number'].includes(schema.type) && type !== schema.type) throw new Error(`${path} must be ${schema.type}, received ${type}`);
  if (schema.enum && !schema.enum.includes(value)) throw new Error(`${path} is not an allowed value`);
  if (schema.type === 'object') {
    for (const key of schema.required ?? []) if (!(key in value)) throw new Error(`${path}.${key} is required`);
    for (const [key, child] of Object.entries(schema.properties ?? {})) if (key in value) assertSchema(value[key], child, `${path}.${key}`);
  }
  if (schema.type === 'array') {
    if (schema.minItems != null && value.length < schema.minItems) throw new Error(`${path} needs at least ${schema.minItems} items`);
    if (schema.maxItems != null && value.length > schema.maxItems) throw new Error(`${path} allows at most ${schema.maxItems} items`);
    value.forEach((item, index) => assertSchema(item, schema.items, `${path}[${index}]`));
  }
}

export async function ollamaHealth({ model = OLLAMA_MODEL } = {}) {
  const response = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error(`Ollama health returned HTTP ${response.status}`);
  const body = await response.json();
  if (!(body.models ?? []).some((item) => item.name === model || item.model === model)) throw new Error(`Ollama model ${model} is not installed`);
  return { provider: 'ollama', model, url: OLLAMA_URL };
}

export async function callOllamaStructured({ model = OLLAMA_MODEL, systemPrompt, userContent, schema, maxTokens = 8000, label = 'agent' }) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          model,
          stream: false,
          think: false,
          keep_alive: '30m',
          format: schema,
          messages: [
            { role: 'system', content: `${systemPrompt}\nReturn only JSON matching the supplied schema. Do not invent facts absent from the input.` },
            ollamaUserMessage(userContent),
          ],
          options: { temperature: 0.1, num_ctx: CONTEXT_TOKENS, num_predict: Math.min(maxTokens, 8192), seed: 42 },
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(`Ollama HTTP ${response.status}: ${body.error ?? JSON.stringify(body).slice(0, 300)}`);
      const output = JSON.parse(body.message?.content ?? '');
      assertSchema(output, schema);
      recordTrainingExample({ label, model, systemPrompt, userContent, output });
      return {
        output,
        usage: { input_tokens: body.prompt_eval_count ?? 0, output_tokens: body.eval_count ?? 0 },
        costUsd: 0,
        provider: 'ollama',
        model,
      };
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS) {
        console.warn(`${label}: local model attempt ${attempt}/${MAX_ATTEMPTS} failed (${error.message.slice(0, 140)}), retrying...`);
        await wait(1000 * attempt);
      }
    }
  }
  throw new Error(`${label}: local model failed after ${MAX_ATTEMPTS} attempts: ${lastError?.message ?? 'unknown error'}`);
}
