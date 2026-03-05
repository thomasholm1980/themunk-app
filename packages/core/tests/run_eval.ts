// packages/core/tests/run_eval.ts
// Eval runner v1. Run with: npx ts-node packages/core/tests/run_eval.ts

import * as fs from 'fs';
import * as path from 'path';
import { computePolicy, assembleBrief, gatekeep, buildFallbackBrief } from '../index';

interface EvalCase {
  id: string;
  description: string;
  daily_state: {
    readiness_band: 'GREEN' | 'YELLOW' | 'RED';
    flags: string[];
  };
  expected: {
    template_id: string;
    fallback_used: boolean;
    allow: boolean;
  };
}

const casesPath = path.join(__dirname, 'eval_cases.v1.jsonl');
const lines = fs.readFileSync(casesPath, 'utf8').trim().split('\n');
const cases: EvalCase[] = lines.map(l => JSON.parse(l));

let passed = 0;
let failed = 0;

for (const c of cases) {
  const policy = computePolicy({
    readiness_band: c.daily_state.readiness_band,
    flags: c.daily_state.flags,
  });

  let brief = assembleBrief(
    c.daily_state.readiness_band,
    policy,
    'eval-user',
    '2026-01-01',
    c.daily_state.flags,
  );

  const decision = gatekeep(brief, policy);

  if (!decision.allow) {
    brief = buildFallbackBrief(
      policy,
      'eval-user',
      '2026-01-01',
      decision.blocked_reasons,
    );
  }

  const templateOk = brief.template_id === c.expected.template_id;
  const fallbackOk = brief.fallback_used === c.expected.fallback_used;
  const allowOk = decision.allow === c.expected.allow;
  const ok = templateOk && fallbackOk && allowOk;

  const status = ok ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} [${c.id}] ${c.description}`);
  if (!ok) {
    if (!templateOk) console.log(`  template_id: got ${brief.template_id}, expected ${c.expected.template_id}`);
    if (!fallbackOk) console.log(`  fallback_used: got ${brief.fallback_used}, expected ${c.expected.fallback_used}`);
    if (!allowOk) console.log(`  allow: got ${decision.allow}, expected ${c.expected.allow}`);
    failed++;
  } else {
    passed++;
  }
}

console.log(`\n${passed}/${passed + failed} cases passed.`);
if (failed > 0) process.exit(1);
