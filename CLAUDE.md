# PerfCompare — working notes

## Project
Static React/Redux SPA (webpack, MUI, react-router). Talks to Treeherder and
Taskcluster directly from the browser; there is no backend. Node 22 required.

- `npm run dev` — dev server
- `npm run build` — production bundle into `build/`
- `npm run test-all` — jest + prettier + eslint + tsc (run before pushing)

Official hosting is Netlify (see `Deployment.md`). The notes below are for the
prototype sandbox deployment, not production.

## Quick sandbox deployment (prototype branch)
The current branch (Cross-Platform Compare Prototype) is deployed to Mozilla's
Quick sandbox for sharing behind SSO:

    https://mgaudet-perfcompare.quick.mozilla.cloud/

`quick-site/` is gitignored and holds the deployable copy plus the Quick agent
skill (`quick-site/.claude/skills/quick/SKILL.md`) and a `/deploy` command.
If `quick-site/` is missing, recreate it with `quick init quick-site` and delete
the starter `index.html`.

### Redeploy after changes
    npm run build
    rsync -a --delete --exclude .claude --exclude AGENTS.md --exclude CLAUDE.md build/ quick-site/
    cd quick-site
    cp index.html 404.html
    sed -i '' -e 's#src="main\.#src="/main.#' -e 's#href="favicon\.svg"#href="/favicon.svg"#g' index.html 404.html
    quick deploy . mgaudet-perfcompare -y

If deploy fails with "Reauthentication failed", the user must run
`gcloud auth login` interactively (it opens a browser), then rerun the deploy.

### Known issues / gotchas
- Site name is deliberately `mgaudet-perfcompare`, not the bare `perfcompare`
  that `quick init` defaults to, so the prototype isn't mistaken for the real site.
- Quick ignores the Netlify `_redirects` file, so deep links (e.g.
  `/subtest-cross-platform-results`) 404'd on hard reload. Current workaround is
  the `404.html` copy of `index.html`. If that turns out not to be honoured,
  fall back to generating `<route>/index.html` copies for each route in
  `src/components/App.tsx` (or switch the router to hash URLs for this build only).
- Webpack emits relative asset paths; the `sed` step above makes them absolute
  so the bundle loads from nested routes. Consider setting
  `output.publicPath: '/'` in `webpack/webpack.common.js` to remove that step.
