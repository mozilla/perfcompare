# PerfCompare

PerfCompare is Mozilla's Performance Comparison Tool: a React single-page app that compares Firefox performance test results between two builds ("Base" vs "New"). It reads from Treeherder's perf APIs and renders comparison tables, distribution graphs, and statistical analysis. Deployed on Netlify (`main` → staging, `production` → https://perf.compare/).

## Stack

React 19 + TypeScript on Webpack (`webpack/`), served by `webpack serve` in dev and `server.js` (Express) in production. Redux Toolkit, `react-router` v8, MUI 7 + `typestyle`, `echarts` + `fast-kde`, `react-virtuoso` for long lists, and `moize` for memoization — prefer it or `useMemo`/`useCallback`/`React.memo` over hand-rolled caches. Node 22 (`.nvmrc`).

## Commands

`npm run test-all` (jest + prettier + eslint + tsc) is the gate and must pass before a PR is ready; `npm run fix-all` is its counterpart. Also `npm run test:update` for snapshots and `npm run dev` for localhost:3000. CI (CircleCI) runs tests-with-coverage, lint + prettier, and `tsc` as three jobs.

## Architecture

**Routing and data loading.** All routes are declared in `src/components/App.tsx` via `createBrowserRouter`, each pairing a view with a **react-router `loader`** that fetches and sanitizes data before render (the loader files in `src/components/CompareResults/`). Data fetching belongs in a loader or in `src/logic/`, never in component effects.

**Statistical test strategies — read this before touching results rendering.** Each supported statistical test owns its columns, cells, and expanded-row content via a strategy pattern in `src/common/testVersions/`. `index.ts` defines the `TestVersionStrategy` interface and a `registry` mapping each `TestVersion` (`'student-t'`, `'mann-whitney-u'`) to `studentT.tsx` / `mannWhitney.tsx`. Components call `getStrategy(testVersion)` instead of branching on the test type. To add a version: write a strategy file, register it, and extend the `TestVersion` union in `src/types/types.ts`.

**External APIs.** `src/logic/` wraps all outbound calls — `treeherder.ts` (perf data), `taskcluster.ts` + `credentials-storage.ts` (auth, retriggers), `lando.ts`.

**Redux.** Four slices in `src/reducers/`: `ComparisonSlice`, `SelectedRevisionsSlice`, `ColumnPrefsSlice` (column/panel visibility), `ThemeSlice`. The store in `src/common/store.ts` exports `RootState` and `AppDispatch`; always use the typed `useAppSelector` / `useAppDispatch` from `src/hooks/app.ts`.

**URL as state.** Filters, sorting, and advanced column/expanded-row selections are encoded into the URL so a shared link reproduces a view (`src/utils/advancedColumnsUrl.ts`, `expandedRowUrl.ts`, `tableStatePersistence.ts`, plus the `useRawSearchParams` / `useSeedAdvancedOptionsFromUrl` hooks). New view options follow those serializers rather than a new scheme.

## Project layout

```
src/components/  Views. CompareResults/ is the largest (tables, graphs,
                 expanded rows, subtests); also Search/, Shared/
src/common/      store.ts, constants.ts, testVersions/ strategies
src/logic/       API clients (treeherder, taskcluster, lando)
src/reducers/    Redux slices          src/hooks/  Shared hooks
src/utils/       Pure helpers: statistics, formatting, sorting, URL state
src/types/       Shared types          src/styles/, src/theme/  Styling
src/resources/   Strings.tsx — user-facing copy and external links
src/__tests__/   Jest tests, mirroring src/
```

Config sits at the root: `tsconfig.json`, `jest.config.ts`, `eslint.config.mjs`, `.prettierrc.js`, `.circleci/config.yml`, `CODEOWNERS`.

## Code conventions

- **Match the surrounding pattern** for file naming, where types live, and how slices are organized, rather than introducing a new convention.
- **TypeScript is type-checked by ESLint** (`recommendedTypeChecked`). Avoid `any`; prefix intentionally-unused args with `_`.
- **Import order is enforced**: builtin → external → internal, `react` first, blank line between groups, alphabetized. Use `npm run lint:fix`, don't hand-sort.
- **Prettier**: 2-space indent, single quotes **including JSX**, trailing commas, LF. It checks the whole repo, Markdown included.
- **Styling**: `sx` props and `typestyle` modules are both common — follow the surrounding file. Theme values come from `src/theme/protocolTheme.ts`.

## Performance

Re-render cost is real here, not theoretical: results tables are long enough to need virtualization, and each expanded row builds an `echarts` chart and runs KDE and statistics over raw run data. Memoize accordingly and route large lists through `react-virtuoso` — but optimize where it plausibly matters, not reflexively.

## Testing

Jest + React Testing Library, with `jest-axe` for accessibility and `@fetch-mock/jest` for network mocking. Tests live in `src/__tests__/`, mirroring the source tree, under somewhat relaxed ESLint rules. Tests accompany behavioral changes; **snapshots are only updated after confirming the UI change is intentional**, never to make a failing test pass.

## What to flag in review

These are the mistakes that recur here. Prefer a concrete violation below over generic style commentary, and name the rule the change breaks.

**Architecture**

- A shared component branching on the statistical test (`if (testVersion === 'mann-whitney-u')`, or checking for test-specific fields) instead of going through `getStrategy()` and the `TestVersionStrategy` interface.
- Data fetched in a `useEffect` or inside a component, rather than in the route's loader or a client in `src/logic/`.
- A new view option (column, panel, filter, sort) held only in component state or Redux, not encoded in the URL via the existing serializers — shared links must reproduce the view.
- Raw `useSelector` / `useDispatch` from react-redux instead of the typed `useAppSelector` / `useAppDispatch` in `src/hooks/app.ts`.
- New logic duplicating a helper that already exists in `src/utils`, `src/hooks`, or `src/common` — and, conversely, an abstraction introduced for a single call site.
- Hardcoded user-facing copy or external URLs in a component where `src/resources/Strings.tsx` is the established home.

**Performance**

- Derived state returning a fresh object or array each call, defeating reference-equality checks. The convention here is a memoized hook — see `useAdvancedColumns`.
- Unmemoized callbacks or object props passed into `react-virtuoso` item renderers or `React.memo` children.
- `echarts` option objects or KDE/statistics computations built inline in the render path instead of behind `useMemo` / `moize`.
- Context provider values constructed inline on each render.
- `useEffect` / `useMemo` / `useCallback` dependency arrays that are missing deps (bugs) or overly broad (needless reruns).

**Types and tests**

- `any`, non-null assertions, or type assertions used to silence `recommendedTypeChecked` rather than modeling the type. Test files are intentionally more permissive here.
- A behavioral change with no added or updated test.
- Accessibility coverage (`jest-axe`) removed from a component that had it, or absent from a new interactive component where nearby components have it.
- Network calls in tests not mocked through `@fetch-mock/jest`.
- **Large snapshot diffs with no UI change described in the PR** — a sign snapshots were regenerated to make tests pass. Ask what the visual change was.

**Process**

- PR title missing its Bugzilla reference. The convention is `Bug-XXX: Short description`, with `Fixes [Bug-XXX](https://bugzilla.mozilla.org/show_bug.cgi?id=XXX)` in the body.
