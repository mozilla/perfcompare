// Says whether a Playwright run passed, by the same rule as the verdict in the
// PR comment (playwrightPassed in build-review-comment.mjs).
//
// Usage:
//   node .github/scripts/e2e-result.mjs --report test-results/results.json \
//     --exit-code <exit code of the test command>
//
// Prints "passed", "failed", or "missing" when there is no report.

import { existsSync, readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

import { parseExitCode, playwrightPassed } from './build-review-comment.mjs';

const { values } = parseArgs({
  options: {
    report: { type: 'string' },
    'exit-code': { type: 'string' },
  },
});
if (!values.report) {
  throw new Error('--report is required');
}

if (!existsSync(values.report)) {
  console.log('missing');
} else {
  const report = JSON.parse(readFileSync(values.report, 'utf8'));
  const exitCode = parseExitCode(values['exit-code']);
  console.log(playwrightPassed(report, exitCode) ? 'passed' : 'failed');
}
