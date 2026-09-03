#!/usr/bin/env node
import { openDb } from '../lib/db.mjs';

const rows = openDb().prepare(`SELECT agent_label, system_prompt, user_content, output_json,
  validation_status, operator_correction_json, business_outcome_json
  FROM ai_training_examples ORDER BY id`).all();
for (const row of rows) {
  console.log(JSON.stringify({
    agent: row.agent_label,
    system: row.system_prompt,
    input: JSON.parse(row.user_content),
    output: JSON.parse(row.output_json),
    validation: row.validation_status,
    operator_correction: row.operator_correction_json ? JSON.parse(row.operator_correction_json) : null,
    business_outcome: row.business_outcome_json ? JSON.parse(row.business_outcome_json) : null,
  }));
}
