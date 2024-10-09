# PerfCompare

[![CircleCI](https://circleci.com/gh/mozilla/perfcompare/tree/main.svg?style=shield)](https://circleci.com/gh/mozilla/perfcompare/tree/main)
[![codecov](https://codecov.io/gh/mozilla/perfcompare/branch/main/graph/badge.svg?token=XHP440JFDQ)](https://codecov.io/gh/mozilla/perfcompare)
![GitHub issues](https://img.shields.io/github/issues/mozilla/perfcompare)
![GitHub pull requests](https://img.shields.io/github/issues-pr/mozilla/perfcompare)

Performance Comparison Tool

![screenshot](screenshot.png)

## Documentation

Documentation for how to use PerfCompare can be found at [PerfCompare Documentation](https://docs.google.com/document/d/1cpQEZXw0M5QjmNL2F1S9NKjWmz6A9Ks7zELVNTXLeB4/edit).

## Deployments

PerfCompare is hosted on Netlify, and is updated every time commits are pushed to the following branches:

| Branch Name | URL                                            | Description                                 |
| ----------- | ---------------------------------------------- | ------------------------------------------- |
| production  | https://perf.compare/                          | Production branch, updated every 1-2 weeks. |
| main        | https://main--mozilla-perfcompare.netlify.app/ | This is the current development branch.     |

[More information about our deployment process](./Deployment.md)

## Setup

### Requirements

- [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [nodejs](https://nodejs.org/en/download/)

### Installation

```
# Clone the repo
git clone https://github.com/mozilla/perfcompare.git
cd perfcompare

# Install node modules
npm install

# Runs on localhost:3000 by default
npm run dev
```

### Contributing

We welcome contributions to our project.

If you find an issue that you'd like to work on that is not assigned to anyone, leave a comment on the issue and request that it be assigned to you.

If you do not receive a response within 2-3 days, you can follow up in the #PerfCompare matrix channel.

After addressing the issue, ensure both tests and linting pass before submitting a pull request.

When submitting a pull request, please mention the issue number to link the pull request and issue to one another. You can do this by typing # following immediately by the issue number, i.e., `#123`

---

#### Contributors

> Submit your pull requests to the `main` branch.

---

We recommend the following workflow to contribute to PerfCompare:

1. [Set an upstream remote](https://docs.github.com/en/get-started/getting-started-with-git/managing-remote-repositories/) that points to the project [repository](https://github.com/mozilla/perfcompare.git), and an 'origin' remote that points to your fork.
2. To keep your fork up-to-date, use `git rebase upstream` rather than merging. This causes fewer merge conflicts and keeps the git history cleaner.

```
# Git commands for keeping your branch up to date with the latest main
git fetch upstream
git rebase upstream/main
git push --force origin <local branch>
```

### Running all validators and tests

The following command will run nearly all the checks we have:

```
npm run test-all
```

It's handy to run before pushing your code to a pull request, so that you're
sure that it obeys the rules we have in place.

The following command:

```
npm run fix-all
```

will automatically fix some of the errors.

If you want to run just specific tests, please read below.

### Validating JavaScript

We run our JavaScript code in the frontend through [ESLint](https://eslint.org/) to ensure that new code has a consistent style and doesn't suffer from common errors.

```
# To run ESLint by itself, you may run the lint task:
npm run lint

# Automatically fix linting issues found (where possible):
npm run lint:fix

# Checking formatting issues with Prettier:
npm run format:check

# Automatically fix format issues found (where possible):
npm run format
```

ESLint and Prettier are usually integrated within your code editor and should
run automatically when you edit a file.

### Running Tests

Tests can be run with the following commands:

```
npm run test

# Run tests and watch for changes
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

#### Snapshot Tests

When making changes to the UI, snapshots should also be updated to match. Snapshot tests
ensure no UI changes occur unexpectedly.

After manually verifying the UI renders as intended, run the following command to update
snapshots:
`npm run test:update`

Snapshot files should be included in your pull request(s).

## Feedback

You can submit feedback by [filing a bug on Bugzilla, on the component Testing::PerfCompare](https://bugzilla.mozilla.org/enter_bug.cgi?product=Testing&component=PerfCompare&status_whiteboard=[pcf]). You can also find us on Element (ex-Matrix) on the [#perfcompare](https://matrix.to/#/#perfcompare:mozilla.org) or [#perfcompare-user-research](https://matrix.to/#/#perfcompare-user-research:mozilla.org) channels, as well as on Slack on the [#perfcompare](https://join.slack.com/share/enQtNDEwODYxNzEwMTE3MC1hZWM0NzkwZjZmYjkyNTBhNDRlYTIxNWMxNDMzNjQ1OWEwYmVhMDBmYjM4OWVlZDg4NjE5NWJhMmQ5NGFjMDll) channel.
