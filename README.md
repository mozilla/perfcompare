# PerfCompare

[![CircleCI](https://circleci.com/gh/mozilla/perfcompare/tree/master.svg?style=svg)](https://circleci.com/gh/mozilla/perfcompare/tree/master)

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

### Contributions

In order to contribute to PerfCompare we recommend the following workflow:
1. [Set an upstream remote](https://docs.github.com/en/get-started/getting-started-with-git/managing-remote-repositories/) that points to the Mozilla PerfCompare's Github [repository](https://github.com/mozilla/perfcompare.git), in addition to ```origin``` that points to your fork. 
2. You should then frequently use ```git rebase upstream``` rather than merging from your fork to keep your branch up to date. There are less conflicts this way and the git history is cleaner.
```
# Git commands for keeping your branch up to date with the lastest master
git fetch upstream
git rebase upstream/master
git push --force origin <local branch>
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
