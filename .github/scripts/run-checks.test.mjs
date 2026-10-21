import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import { CHECKS, summarize, tail } from './run-checks.mjs';

describe('CHECKS', () => {
  it('covers every command CircleCI runs', () => {
    const circleci = readFileSync(
      new URL('../../.circleci/config.yml', import.meta.url),
      'utf8',
    );
    const commands = CHECKS.map((check) => check.args.join(' '));
    for (const script of [
      'lint',
      'format:check',
      'tsc',
      'test:agent-scripts',
    ]) {
      assert.match(circleci, new RegExp(`npm run ${script}\\b`));
      assert.ok(commands.includes(`run ${script}`), script);
    }
    assert.match(circleci, /npm run test:coverage/);
    assert.ok(commands.some((command) => command.startsWith('test ')));
  });
});

describe('tail', () => {
  it('keeps the last lines and strips colors', () => {
    const output = ['a', 'b', '\x1b[31mc\x1b[0m', ''].join('\n');
    assert.equal(tail(output, 2), 'b\nc');
  });
});

describe('summarize', () => {
  it('passes only when every check passed', () => {
    assert.deepEqual(
      summarize([
        { name: 'lint', passed: true },
        { name: 'types', passed: false },
      ]).failed,
      ['types'],
    );
    assert.equal(summarize([{ name: 'lint', passed: true }]).passed, true);
  });
});
