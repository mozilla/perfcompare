# Deployments

PerfCompare is hosted on Netlify, and is updated every time commits are pushed to the following branches:

| Branch Name | URL                                            | Description                                 |
| ----------- | ---------------------------------------------- | ------------------------------------------- |
| production  | https://perf.compare/                          | Production branch, updated every 1-2 weeks. |
| main        | https://main--mozilla-perfcompare.netlify.app/ | This is the current development branch.     |

Every pull request will be deployed as well to a separate domain, whose link will be added automatically to the PR in a comment.

## How to deploy main to production

The easiest by far is to
[create a pull request on GitHub](https://github.com/mozilla/perfcompare/compare/production...main?expand=1).
It would be nice to write down the main changes in the PR description.

After the PR is created all checks should run. When it's ready the PR can be
merged. Be careful to always use the **create a merge commit** functionality,
not _squash_ or _rebase_, to keep a better history.

Once it's done the new version should be deployed automatically. You can follow the
process on [Netlify's dashboard](https://app.netlify.com/sites/mozilla-perfcompare/deploys)
if you have access.

## How to revert to a previous version

The easiest way is to reset the production branch to a previous version, and
force push it. You'll need to enable force-pushing for the branch production,
using the [Branch Settings on GitHub](https://github.com/mozilla/perfcompare/settings/branches).

You can use the following script:

```
sh bin/revert-last-deployment.sh
```

When you're ready with a fix landed on `main`, you can push a new version to the
`production` branch as described in the first part.
