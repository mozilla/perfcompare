# Dependency PR agent

Pull requests from dependabot and depfu are checked automatically:

1. A script checks that the PR looks like an ordinary dependency update.
2. The same checks as CircleCI run on the PR (lint, formatting, types, unit
   tests), plus the production build.
3. **If they fail**, an agent fixes the code, the workflow re-runs every check
   to verify the fix, and pushes it to the PR. Then everything runs again.
4. **If they pass**, the Playwright browser tests run in Firefox.
5. **If those pass**, the comment says **"Approve PR: safe to merge."** If they
   fail, the agent explains why and proposes a fix in the comment.

The workflow never approves or merges. Its only write to the code is pushing
fixes for failing CI checks to the PR branch.

## How it works

The workflow is `.github/workflows/dependency-pr-review.yml`.

| Job        | Runs PR code? | Secrets                | What it does                                                                                                                       |
| ---------- | ------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `context`  | No            | none                   | Reads the PR and counts the fix commits the agent already pushed.                                                                  |
| `triage`   | No            | none                   | Runs `triage-dependency-pr.mjs` from the base branch. Lists what changed, and stops everything if the PR shows signs of tampering. |
| `verify`   | Yes           | none                   | Runs the CI checks with `run-checks.mjs`, then the Playwright tests if the checks passed.                                          |
| `fix`      | Yes           | Anthropic key          | Only when something failed. The agent fixes or explains, then the workflow re-runs the checks on its changes.                      |
| `push-fix` | No            | write access to code   | Applies the verified patch to the PR branch and pushes it.                                                                         |
| `comment`  | No            | write access to the PR | Builds the comment with `build-review-comment.mjs`, posts it, and restarts the workflow after a push.                              |

### The verdict

The verdict is decided by `build-review-comment.mjs` from the check and test
results, never by the agent:

| Situation                                            | Comment                                                     |
| ---------------------------------------------------- | ----------------------------------------------------------- |
| Signs of tampering (see below)                       | 🛑 Needs human review. No code from the PR is run.          |
| CI checks fail, agent fixed them                     | 🔧 The agent pushed a fix, and a new run is checking it.    |
| CI checks fail, agent couldn't fix them              | ❌ Don't merge yet, with the agent's explanation.           |
| CI checks pass, browser tests fail or flaky          | ❌ Don't merge yet, with the agent's explanation and a fix. |
| CI checks pass, browser tests pass                   | ✅ Approve PR: safe to merge.                               |
| A report is missing (for example the install failed) | ⚠️ Needs human review.                                      |

When the PR includes fix commits from the agent, "safe to merge" also asks you
to review those commits before approving.

A major version bump that passes everything is "safe to merge" too: the
verdict follows the tests, not the size of the bump. The triage details in the
comment still show the risk of each package.

### The agent's two modes

- **Apply**: the CI checks fail. The agent changes the code until they pass.
  The workflow then runs every check itself and only pushes if they all pass
  and the change only touches allowed files (`fix-paths.mjs`): `src/`,
  `@types/`, `webpack/` and the ESLint, TypeScript, Jest and Babel
  configuration. Never `package.json`, the lockfile, `.github/` or
  `.circleci/`. The agent may push at most 2 fixes to a PR
  (`MAX_FIX_ATTEMPTS`).
- **Propose**: the browser tests fail, or the CI checks still fail after 2
  fixes. The agent explains the cause and changes the code to fix it, and the
  comment shows the diff and whether the checks pass with it. Nothing is
  pushed. A proposal may also change the browser tests in `e2e/`.

The instructions are in `.github/agent/dependency-pr-review.md`. The agent can
edit only the allowed files, run only the project's npm scripts, `git diff`,
`git status` and `gh pr view`, and has no web access.

### Signs of tampering

The triage blocks a PR, so that no code from it runs and a human has to look,
when:

- it changes files other than `package.json` and `package-lock.json` (commits
  marked as agent fixes are checked separately, against the allowed files);
- it changes `package.json` outside the dependency sections (scripts, engines,
  overrides, ...);
- the lockfile resolves packages from outside `registry.npmjs.org`;
- the lockfile changes the tarball or integrity hash of a package without
  changing its version.

If someone pushes their own commits to a bot PR, the triage sees files other
than the dependency files and blocks it: once a human is involved, a human
reviews it.

## Security trade-offs

Fixing failing checks means the agent has to run code from the updated
packages, and it needs the Anthropic key to work. So:

- **The `fix` job exposes the Anthropic key to the updated packages' code.** A
  malicious package version could read it while the tests run. Use a dedicated
  key in its own workspace with a low spending limit, and rotate it if a
  package you updated turns out to be compromised.
- The `fix` job's GitHub token is read-only. Only `push-fix` can write, and it
  runs no code from the PR: it applies the patch, re-checks the file list, and
  pushes.
- Install scripts are never run (`npm ci --ignore-scripts`).
- A fix is verified in the job that made it, then verified again from a clean
  install by the run that follows the push, before anything can say "safe to
  merge".
- Release notes and changelogs can contain instructions aimed at the agent.
  They can't change the verdict, and anything the agent changes because of
  them shows up as a commit or a diff you review.

## Setup

1. **Check that GitHub Actions is allowed.** CI runs on CircleCI today. Ask
   whoever administers the organization whether Actions is enabled and whether
   `anthropics/claude-code-action` is on the allowed actions list.
2. **Add the API key twice.** Add `ANTHROPIC_API_KEY` under _Settings > Secrets
   and variables > Actions_ **and** under _Dependabot_ in the same place.
   Dependabot-triggered runs can only read Dependabot secrets, and the run
   started after a push can only read Actions secrets. Without the key, CI
   failures are reported but not fixed.
3. **Let the workflow push to bot branches.** The workflow asks for
   `contents: write` in `push-fix` only. If branch protection or rulesets cover
   `dependabot/**` branches, allow GitHub Actions to push to them.
4. Merge the workflow into the default branch. The run that checks a pushed fix
   is started with `workflow_dispatch`, which only works once the workflow file
   is on the default branch.

Good to know: once someone else pushes to a Dependabot PR, Dependabot stops
rebasing it. Commenting `@dependabot recreate` rebuilds the PR from scratch,
without the agent's fix, and the cycle starts again.

## Running things locally

```
npm run build
npx playwright install firefox
npm run test:e2e
```

The browser tests serve `build/` with `e2e/serve-build.mjs` and mock
Treeherder, so they need no network. To use a browser you already have, set
`PLAYWRIGHT_FIREFOX_EXECUTABLE` to its path. Use `E2E_BUILD_DIR` to test a
different build directory.

A browser test fails if the page logs a console error, throws an uncaught
error, or requests a Treeherder endpoint that is not mocked in
`e2e/fixtures.ts`. In CI a failing test is retried once; a test that only
passes on retry is reported as flaky, and flaky counts as a failure for the
verdict.

Other commands:

- `node .github/scripts/run-checks.mjs --out checks.json`: run the CI checks
  the way the workflow does.
- `npm run test:agent-scripts`: unit tests for the workflow scripts.
- `npx tsc -p e2e/tsconfig.json`: type-check the Playwright tests.

## Known limits

- The browser tests mock Treeherder, so they can't catch problems that only
  show with real data or real network behavior. Taskcluster sign-in and
  retriggering are not covered.
- A package only used on a path the tests don't visit can break without the
  tests noticing, and the PR would still be "safe to merge". Add a Playwright
  test when a regression slips through.
- `run-checks.mjs` mirrors `.circleci/config.yml` by hand (a unit test checks
  the commands still match). CircleCI still runs on every push, including the
  agent's fixes, and stays the source of truth for branch protection.
