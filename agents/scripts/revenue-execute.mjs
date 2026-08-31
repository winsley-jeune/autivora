#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { loadTasks } from '../signal/lib/task-store.mjs';

const tasks = loadTasks().tasks.filter((task) => task.status === 'open').sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
const task = tasks.find((item) => ['uplift', 'author'].includes(item.agent) && ['/auto', '/home', '/industrial'].includes(item.target_url))
  ?? tasks.find((item) => item.agent === 'linker');
if (!task) {
  console.log('Revenue executor: no supported open revenue task.');
  process.exit(0);
}
const script = task.agent === 'linker' ? 'agents/linker/run.mjs' : 'agents/collection/run.mjs';
console.log(`Revenue executor: task #${task.id} (${task.agent} → ${task.target_url}).`);
const result = spawnSync(process.execPath, [script, String(task.id)], { stdio: 'inherit' });
process.exit(result.status ?? 1);
