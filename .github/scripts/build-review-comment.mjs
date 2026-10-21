// Builds the pull request comment for the dependency PR review workflow.
//
// The verdict is decided here, from files the workflow produced, never by the
// agent:
//
//   - the triage found signs of tampering      -> needs human review
//   - the CI checks fail                        -> the agent fixes them (or says
//                                                  why it couldn't)
//   - the CI checks pass, Playwright passes     -> approve PR: safe to merge
//   - the CI checks pass, Playwright fails      -> the agent explains why and
//                                                  proposes a fix
//
// The agent only contributes explanations and patches, so text it read in
// third-party release notes can't change the verdict.
//
// Usage:
//   node .github/scripts/build-review-comment.mjs --triage triage.json \
//     [--checks checks.json] [--playwright results.json] \
//     [--playwright-exit-code <n>] \
//     [--fix-mode apply|propose] \
//     [--fix-result fixed|not-fixed|rejected|failed|skipped-no-key] \
//     [--pushed-sha <sha>] [--fix-limit-reached true|false] \
//     [--agent-summary summary.md] [--patch fix.patch] \
//     [--agent-fix-commits <n>] [--run-url <url>] [--out comment.md]

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { stripVTControlCharacters } from 'node:util';

export const MARKER = '<!-- dependency-pr-agent -->';
const MAX_ROWS = 25;
const MAX_AGENT_CHARS = 15000;
const MAX_PATCH_CHARS = 20000;
const MAX_LOG_CHARS = 4000;

function escapeCell(text) {
  return String(text ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\n/g, ' ');
}

function truncate(text, max) {
  return text.length > max ? text.slice(0, max) + '\n…(truncated)' : text;
}

// A code fence longer than any run of backticks inside the text, so that the
// text can't close it early.
function fenced(text, language = '') {
  const longest = Math.max(
    2,
    ...[...text.matchAll(/`+/g)].map((match) => match[0].length),
  );
  const fence = '`'.repeat(longest + 1);
  return `${fence}${language}\n${text.trimEnd()}\n${fence}`;
}

// Walks the nested suites of a Playwright JSON report and returns the titles of
// the tests that did not pass (including flaky ones, reported separately).
export function summarizePlaywright(report) {
  const failed = [];
  const flaky = [];
  const visit = (suite, trail) => {
    const here = suite.title && !suite.file ? [...trail, suite.title] : trail;
    for (const spec of suite.specs ?? []) {
      const title = [...here, spec.title].join(' › ');
      for (const test of spec.tests ?? []) {
        if (test.status === 'unexpected') {
          failed.push(title);
        } else if (test.status === 'flaky') {
          flaky.push(title);
        }
      }
    }
    for (const child of suite.suites ?? []) {
      visit(child, here);
    }
  };
  for (const suite of report.suites ?? []) {
    visit(suite, []);
  }
  const stats = report.stats ?? {};
  return {
    // Errors outside any test, such as the web server not starting.
    errors: (report.errors ?? []).map((error) =>
      truncate(
        stripVTControlCharacters(String(error.message ?? error)).split('\n')[0],
        300,
      ),
    ),
    passed: stats.expected ?? 0,
    failed: stats.unexpected ?? failed.length,
    flaky: stats.flaky ?? flaky.length,
    skipped: stats.skipped ?? 0,
    failedTitles: failed,
    flakyTitles: flaky,
  };
}

// Whether a Playwright run passed. A run that broke before running the tests
// (the web server didn't start, a spec didn't compile) still writes a report
// with no failed tests, so that alone is not enough: the command must succeed,
// the report must have no errors, and at least one test must pass, with none
// failed, flaky or skipped.
export function playwrightPassed(report, exitCode) {
  if (!report || exitCode !== 0) {
    return false;
  }
  const summary = summarizePlaywright(report);
  return (
    summary.errors.length === 0 &&
    summary.passed > 0 &&
    summary.failed === 0 &&
    summary.flaky === 0 &&
    summary.skipped === 0
  );
}

// An exit code passed on the command line; anything else, including an empty
// string, is unknown (null), which never counts as success.
export function parseExitCode(value) {
  return /^\d+$/.test(value ?? '') ? Number(value) : null;
}

// Returns the state of the PR and the headline shown at the top of the comment.
export function decide({
  triage,
  checks,
  playwright,
  playwrightExitCode = null,
  fix = {},
}) {
  if (triage.blocked) {
    return {
      state: 'blocked',
      headline:
        "🛑 **Needs human review: this doesn't look like an ordinary dependency update.**",
    };
  }
  if (!checks) {
    return {
      state: 'no-checks',
      headline:
        "⚠️ **Needs human review: the CI checks didn't run to completion** (the install probably failed).",
    };
  }
  if (!checks.passed) {
    if (fix.result === 'fixed' && fix.pushedSha) {
      return {
        state: 'fix-pushed',
        headline: `🔧 **CI checks failed. The agent pushed a fix (${fix.pushedSha.slice(0, 7)}), and a new run is checking it.**`,
      };
    }
    return {
      state: 'checks-failed',
      headline:
        "❌ **CI checks fail, and the agent didn't fix them. Don't merge yet.**",
    };
  }
  if (!playwright) {
    return {
      state: 'no-e2e',
      headline:
        "⚠️ **Needs human review: CI checks pass, but the browser tests didn't produce a report.**",
    };
  }
  if (!playwrightPassed(playwright, playwrightExitCode)) {
    return {
      state: 'e2e-failed',
      headline:
        "❌ **CI checks pass, but the browser tests failed. Don't merge yet.**",
    };
  }
  return { state: 'safe', headline: '✅ **Approve PR: safe to merge.**' };
}

// Why the agent didn't fix failing CI checks, in words.
function fixFailureReason(fix) {
  switch (fix.result) {
    case 'fixed':
      return "The agent's fix passed the checks, but pushing it failed. See the workflow run.";
    case 'not-fixed':
      return "The agent's changes didn't make every check pass, so nothing was pushed.";
    case 'rejected':
      return 'The agent changed files a fix may not touch (dependencies, CI or workflow files), so nothing was pushed.';
    case 'skipped-no-key':
      return '`ANTHROPIC_API_KEY` is not available to this workflow, so the agent did not run. For Dependabot PRs it must be added under Dependabot secrets.';
    case 'skipped-limit':
      return 'The agent already pushed the maximum number of fixes to this PR, so it only explains the failure below.';
    default:
      return 'The agent did not run or failed. See the workflow run.';
  }
}

export function buildComment({
  triage,
  checks,
  playwright,
  playwrightExitCode = null,
  fix = {},
  agentFixCommits = 0,
  runUrl,
}) {
  const { state, headline } = decide({
    triage,
    checks,
    playwright,
    playwrightExitCode,
    fix,
  });
  const lines = [MARKER, '## Dependency update review', '', headline, ''];

  if (state === 'blocked') {
    lines.push(
      'No code from this PR was run. The triage found:',
      '',
      ...triage.blockers.map((reason) => `- ${reason}`),
      '',
    );
  } else if (state === 'safe' && agentFixCommits > 0) {
    lines.push(
      `CI checks and browser tests pass. This PR includes ${agentFixCommits} fix commit${agentFixCommits === 1 ? '' : 's'} from the agent: review ${agentFixCommits === 1 ? 'it' : 'them'} before approving.`,
      '',
    );
  } else if (state === 'safe') {
    lines.push('CI checks and browser tests pass.', '');
  } else if (state === 'checks-failed') {
    lines.push(
      fix.limitReached
        ? fixFailureReason({ result: 'skipped-limit' })
        : fixFailureReason(fix),
      '',
    );
  }

  if (checks) {
    lines.push('### CI checks', '');
    for (const check of checks.checks) {
      lines.push(`- ${check.passed ? '✅' : '❌'} ${check.name}`);
    }
    lines.push('');
    for (const check of checks.checks.filter((entry) => !entry.passed)) {
      lines.push(
        `<details><summary>Output of ${escapeCell(check.name)} (end)</summary>`,
        '',
        fenced(truncate(check.outputTail ?? '', MAX_LOG_CHARS)),
        '',
        '</details>',
        '',
      );
    }
  }

  if (state !== 'blocked') {
    lines.push('### Browser tests (Playwright)', '');
    if (playwright) {
      const summary = summarizePlaywright(playwright);
      lines.push(
        `${summary.passed} passed, ${summary.failed} failed, ${summary.flaky} flaky, ${summary.skipped} skipped.`,
      );
      for (const title of summary.failedTitles) {
        lines.push(`- failed: ${title}`);
      }
      for (const title of summary.flakyTitles) {
        lines.push(`- flaky (passed only on retry): ${title}`);
      }
      for (const error of summary.errors) {
        lines.push(`- error: ${escapeCell(error)}`);
      }
      if (
        state === 'e2e-failed' &&
        summary.failed === 0 &&
        summary.flaky === 0
      ) {
        lines.push(
          '',
          `The test run itself didn't succeed (${playwrightExitCode === null ? 'no exit code' : `exit code ${playwrightExitCode}`}${summary.passed === 0 ? ', no test passed' : ''}${summary.skipped > 0 ? `, ${summary.skipped} skipped` : ''}). See the workflow run.`,
        );
      }
    } else if (checks && !checks.passed) {
      lines.push('Not run: they run once the CI checks pass.');
    } else {
      lines.push('No report is available. See the workflow run.');
    }
    lines.push('');
  }

  const agentSummary = fix.agentSummary?.trim();
  const patch = fix.patch?.trim();
  if (agentSummary || patch) {
    lines.push(
      fix.mode === 'apply' && state === 'fix-pushed'
        ? '### What the agent fixed'
        : '### What went wrong, and a proposed fix',
      '',
    );
    if (agentSummary) {
      lines.push(truncate(agentSummary, MAX_AGENT_CHARS), '');
    }
    if (patch) {
      const verified =
        fix.result === 'fixed'
          ? 'The checks pass with this change.'
          : "The checks still fail with this change, so it's a starting point, not a finished fix.";
      lines.push(
        `<details><summary>${fix.mode === 'apply' && state === 'fix-pushed' ? 'The pushed change' : 'Proposed change'}</summary>`,
        '',
        verified,
        '',
        fenced(truncate(patch, MAX_PATCH_CHARS), 'diff'),
        '',
        '</details>',
        '',
      );
    }
  }

  lines.push(
    `<details><summary>Triage: risk ${triage.risk}, ${triage.changeCount} package${triage.changeCount === 1 ? '' : 's'} changed</summary>`,
    '',
  );
  for (const reason of triage.reasons ?? []) {
    lines.push(`- ${reason}`);
  }
  if (triage.reasons?.length) {
    lines.push('');
  }
  if (triage.changes?.length) {
    lines.push(
      '| Package | From | To | Bump | Scope | Risk |',
      '| --- | --- | --- | --- | --- | --- |',
    );
    for (const change of triage.changes.slice(0, MAX_ROWS)) {
      const name = change.critical ? `${change.name} ⚠️` : change.name;
      lines.push(
        `| ${escapeCell(name)} | ${escapeCell(change.from ?? '—')} | ${escapeCell(change.to ?? '—')} | ${change.bump} | ${change.scope}${change.direct ? '' : ' (transitive)'} | ${change.risk} |`,
      );
    }
    if (triage.changes.length > MAX_ROWS) {
      lines.push('', `…and ${triage.changes.length - MAX_ROWS} more.`);
    }
    lines.push('');
  }
  lines.push('</details>', '');

  lines.push(
    '---',
    `_Automated. This workflow never approves or merges; it only pushes fixes for failing CI checks.${runUrl ? ` [Workflow run](${runUrl})` : ''}_`,
  );
  return lines.join('\n') + '\n';
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    if (!argv[i].startsWith('--') || argv[i + 1] === undefined) {
      throw new Error(`Unexpected argument: ${argv[i]}`);
    }
    args[argv[i].slice(2)] = argv[i + 1];
  }
  return args;
}

function readIfExists(path) {
  return path && existsSync(path) ? readFileSync(path, 'utf8') : null;
}

function readJsonIfExists(path) {
  const text = readIfExists(path);
  return text ? JSON.parse(text) : null;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.triage) {
    throw new Error('--triage is required');
  }
  const comment = buildComment({
    triage: JSON.parse(readFileSync(args.triage, 'utf8')),
    checks: readJsonIfExists(args.checks),
    playwright: readJsonIfExists(args.playwright),
    playwrightExitCode: parseExitCode(args['playwright-exit-code']),
    fix: {
      mode: args['fix-mode'] || null,
      result: args['fix-result'] || null,
      pushedSha: args['pushed-sha'] || null,
      limitReached: args['fix-limit-reached'] === 'true',
      agentSummary: readIfExists(args['agent-summary']),
      patch: readIfExists(args.patch),
    },
    agentFixCommits: Number(args['agent-fix-commits'] ?? 0),
    runUrl: args['run-url'],
  });
  if (args.out) {
    writeFileSync(args.out, comment);
  } else {
    process.stdout.write(comment);
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
