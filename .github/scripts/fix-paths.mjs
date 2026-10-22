// Decides which files the agent may change when it fixes a dependency PR.
//
// The agent fixes the code to work with the updated packages. It must never
// change the dependencies themselves, CI, or this workflow: a fix touching
// those is rejected and nothing is pushed.
//
// Usage:
//   git diff --cached --name-only | node .github/scripts/fix-paths.mjs --mode apply|propose
//
// Exits with status 1 and lists the offending files if any are not allowed.

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// Application code, its tests and type declarations, and the tool
// configuration that dependency updates most often require changing.
const ALLOWED = [
  /^src\//,
  /^@types\//,
  /^webpack\//,
  /^eslint\.config\.mjs$/,
  /^tsconfig\.json$/,
  /^jest\.config\.ts$/,
  /^babel\.config\.json$/,
];

// Proposed fixes are only shown in the comment, never pushed, so they may also
// touch the browser tests (for example when a selector legitimately changed).
const ALLOWED_IN_PROPOSALS = [/^e2e\//];

export function disallowedPaths(files, mode) {
  const allowed =
    mode === 'propose' ? [...ALLOWED, ...ALLOWED_IN_PROPOSALS] : ALLOWED;
  return files.filter((file) => !allowed.some((pattern) => pattern.test(file)));
}

function main() {
  const modeIndex = process.argv.indexOf('--mode');
  const mode = modeIndex === -1 ? 'apply' : process.argv[modeIndex + 1];
  const files = readFileSync(0, 'utf8').split('\n').filter(Boolean);
  const rejected = disallowedPaths(files, mode);
  if (rejected.length > 0) {
    console.log(
      `The fix changes files it may not change:\n${rejected.join('\n')}`,
    );
    process.exit(1);
  }
  console.log(`${files.length} changed file(s), all allowed.`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
