# PerfCompare

Performance Comparison Tool

![screenshot](screenshot.png)

## Setup

### Requirements

-   [nodejs](https://nodejs.org/en/download/)
-   [python](https://www.python.org/downloads/release/python-369/)
-   [pip](https://pip.pypa.io/en/stable/installation/)

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

# Or to automatically fix issues found (where possible):
npm run lint --fix
```
