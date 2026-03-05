// packages/core/tests/test_disclaimer.ts
// Whitelist test for build_disclaimer(). Ensures only safe strings are returned.

import { buildDisclaimer } from '../renderer/build_disclaimer';

const ALLOWED_DISCLAIMERS = [
  '',
  'This is not medical advice. These suggestions are for general wellness only.',
  'This is not medical advice. If you are struggling, consider reaching out to a healthcare professional or someone you trust.',
  'If you are in crisis or need immediate support, please contact a local emergency service or crisis line now.',
];

const testCases: Array<{
  level: 'none' | 'general' | 'support_suggestion';
  escalation: 'none' | 'suggest_professional_support' | 'urgent_local_help';
}> = [
  { level: 'none', escalation: 'none' },
  { level: 'general', escalation: 'none' },
  { level: 'support_suggestion', escalation: 'none' },
  { level: 'support_suggestion', escalation: 'suggest_professional_support' },
  { level: 'none', escalation: 'urgent_local_help' },
];

let passed = 0;
let failed = 0;

for (const tc of testCases) {
  const result = buildDisclaimer(tc.level, tc.escalation);
  const ok = ALLOWED_DISCLAIMERS.includes(result);
  const status = ok ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} disclaimer(${tc.level}, ${tc.escalation})`);
  if (!ok) {
    console.log(`  Got: "${result}"`);
    failed++;
  } else {
    passed++;
  }
}

console.log(`\n${passed}/${passed + failed} disclaimer tests passed.`);
if (failed > 0) process.exit(1);
