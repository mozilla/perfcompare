# PerfCompare

[![CircleCI](https://circleci.com/gh/mozilla/perfcompare/tree/master.svg?style=shield)](https://circleci.com/gh/mozilla/perfcompare/tree/master)
[![codecov](https://codecov.io/gh/mozilla/perfcompare/branch/master/graph/badge.svg?token=XHP440JFDQ)](https://codecov.io/gh/mozilla/perfcompare)

Performance Comparison Tool

![screenshot](screenshot.png)

## Setup

### Requirements

- [nodejs](https://nodejs.org/en/download/)
- [python](https://www.python.org/downloads/release/python-369/)
- [pip](https://pip.pypa.io/en/stable/installation/)

### Installation

```
# Clone the repo
git clone https://github.com/mozilla/perfcompare.git
cd perfcompare

# Install node modules
npm install

# Runs on localhost:3000 by default
npm start
```

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
`jest --updateSnapshot`

Snapshot files should be included in your pull request(s).
