# Understanding the runs-density graph (modes)

When you open a perfcompare URL and expand a result row, you get a **Runs
Density Distribution** graph. This page explains what it shows.

It has two parts:

- **[Part 1 — Reading a result](#part-1--reading-a-result)** is for a Firefox
  developer who has a perfcompare URL in front of them and wants to know what
  the graph and numbers mean, and whether to trust them.
- **[Part 2 — How it works](#part-2--how-it-works)** is for the curious: the
  maths and the implementation choices behind the modes.

The code is in [`src/utils/kde.js`](../src/utils/kde.js) (`fitGmmModes`) and
[`src/components/CompareResults/CommonGraph.tsx`](../src/components/CompareResults/CommonGraph.tsx).

---

## Part 1 — Reading a result

### Why there's a graph and not just a number

A benchmark is run many times. Those runs are rarely one tight blob. A test
often has a **fast path** (cache warm, branch predicted, no GC) and one or more
**slow paths** (cache miss, JIT deopt, a GC pause). Each path shows up as a
separate cluster — a **mode** — in the distribution of run values.

A single number (mean or median) blends those paths together. That can hide
what's really going on: a regression that only moves the slow path, or a result
where "the median went up" actually means "more runs fell onto the slow path."
The graph shows you the shape so you can see this.

### What's on the chart

- **Solid curve** — a smooth histogram of the runs (a kernel density estimate).
  Tall where runs cluster, low where they're sparse.
- **Dashed curve** — the fitted model the modes come from (see Part 2). It sits
  on top of the solid curve so each mode lines up with a visible bump.
- **Vertical mode lines** — one per detected mode, labelled `A`, `B`, …, where
  **A is the fastest (lowest) path**. Each is labelled with its centre value and
  a **percentage**.
- **Dots underneath** — the actual individual runs, so you can sanity-check the
  curve against the raw data.

Base and New are overlaid so you can compare them directly.

### Solid curve vs dashed curve

There are two curves of the same colour per series, and they answer two
different questions:

- The **solid curve is the data.** It's a smooth histogram of the actual runs
  (a kernel density estimate) — purely descriptive, no assumptions. It just
  shows where runs are dense and where they're sparse.
- The **dashed curve is the model's interpretation.** It's the fitted
  mixture-of-bell-curves that the mode lines come from: "I read these runs as
  *N* groups, each centred here with this spread." The mode lines and their
  percentages are read off the dashed curve, not the solid one.

**They usually track each other closely.** Where they *differ* is the
interesting part:

- A **bump in the dashed curve where the solid curve looks flat** is the
  feature, not a bug. A diffuse slow path — a handful of slow runs spread out —
  gets smeared into a near-flat tail by the smooth histogram, but the model
  recognises those runs as one wide group and draws a low, broad bump there.
  That's how a real-but-spread-out slow mode becomes visible.
- If the **dashed curve looks nothing like the solid curve** (peaks in the wrong
  places, or a wildly different shape), the model is fitting the data poorly —
  be skeptical of the modes for that series, and try the sensitivity slider.

In short: trust the **solid** curve for *what the runs look like*, and read the
**dashed** curve for *how they've been grouped into modes*.

### The percentage is the important bit

The percentage on a mode line is **the fraction of runs that landed in that
mode** — its share of the data, not its height.

> Example: `A: 6.2 ms (68%)` and `B: 9.5 ms (32%)` means about two-thirds of
> runs were on a ~6.2 ms fast path and about a third on a ~9.5 ms slower path.

This is what makes regressions legible. If Base is one mode at 6 ms and New is
*two* modes — 6 ms (70%) and 9.5 ms (30%) — then the change didn't make every
run slower, it pushed ~30% of runs onto a new slow path. That's a very different
story from "the median moved a little," and it's the kind of thing the single
number can't tell you.

### The "Mode sensitivity" slider

Detecting modes is a judgement call: where's the line between "two modes" and
"one lumpy mode"? The slider lets you set that.

- **Middle** — the principled default (standard model selection).
- **Right** — more eager: finer modes get split out.
- **Left** — more conservative: only strongly-supported modes survive.

If a result looks over-split or under-split for what you're investigating, reach
for the slider before doubting the data. The mode count is not a hard truth;
it's the most defensible grouping at the current setting.

### When to trust it (and when not to)

- **Few runs** → take modes with a grain of salt. With a handful of runs there
  isn't enough data to be confident about structure; the fit stays conservative
  (often a single mode), which is the honest answer.
- **One mode** doesn't mean "no noise" — it means the runs didn't separate into
  distinct clusters. A wide single mode is just a noisy-but-unimodal result.
- **Many modes on shapeless data** — if the dots are scattered everywhere with
  no clear clustering, nudge the sensitivity left; don't read meaning into
  modes that the slider can dissolve.

### The Mann–Whitney "Δ median" blurb

On the Mann–Whitney test version you'll also see a **Δ median** with a 95 %
confidence interval (e.g. `Δ median = +0.20 ms (+2.3%) 95% CI [0.1, 0.3]`).
That interval is a bootstrap estimate of how uncertain the median difference is.
If the interval **includes zero**, the direction of the change is uncertain.

If a result has **fewer than 2 runs per side**, there's no interval to compute
(a single measurement has no spread), so the blurb is omitted rather than
showing a meaningless range.

---

## Part 2 — How it works

This part assumes you're comfortable with a bit of statistics.

### The model: a Gaussian mixture

We model the run values as a mixture of `K` Gaussians:

```
f(x) = Σ_k  π_k · N(x ; μ_k, σ_k²)
```

- `π_k` — the **weight** of mode `k`: the fraction of runs in it (`Σ π_k = 1`).
  This is the percentage shown on the chart.
- `μ_k` — the **centre** (where the mode line is drawn).
- `σ_k` — the **width**. A diffuse, high-variance slow path is simply a
  component with a large `σ_k`.

This replaced an earlier approach that ran a kernel density estimate and split
it at the **valleys** between peaks, tuned by a "valley depth" slider.
Valley-carving has two failure modes a mixture model avoids:

1. **Mode count.** One valley-depth knob gives whatever count that threshold
   produces; the grouping a human would draw often isn't reachable at *any*
   setting. A mixture chooses the count by model selection (BIC, below).
2. **Diffuse groups.** A spread-out slow path has no sharp KDE peak, so
   valley-carving shatters it into ripples or absorbs it into the fast mode. A
   mixture captures it as one wide component, because it clusters the *samples*
   rather than smoothing the density and hunting for dips. (An adaptive-bandwidth
   KDE was also tried; it fills in the valleys between genuine modes — the
   opposite of what we want. See the git history.)

### Fitting a fixed K: EM

For a fixed `K`, the parameters are fit by **Expectation-Maximisation**
(`emGmm1D`):

- **E-step.** For each sample `xᵢ`, compute its *responsibility* under each
  component — the posterior that `xᵢ` came from component `k`:
  `rᵢₖ = π_k N(xᵢ; μ_k, σ_k²) / Σⱼ πⱼ N(xᵢ; μⱼ, σⱼ²)`.
- **M-step.** Re-estimate each component as the responsibility-weighted mean and
  variance of all samples; set `π_k` to the average responsibility.
- Iterate until the log-likelihood plateaus (max 300 iterations).

EM converges to a *local* optimum, so the starting point matters (see
robustness).

### Choosing K: BIC

We fit `K = 1 … Kmax` and pick the `K` minimising the **Bayesian Information
Criterion**:

```
BIC(K) = −2 · logL(K)  +  penalty · p(K) · ln(n)
```

- `logL(K)` always improves with more components, so alone it would keep adding
  modes.
- `p(K) = 3K − 1` is the free-parameter count (`K` means + `K` variances +
  `K−1` weights); `· ln(n)` is the per-parameter cost. A mode must pay for itself
  in likelihood to be kept.
- `Kmax = min(5, ⌊n/4⌋)` — never more modes than the data can support.

**The sensitivity slider** maps to `penalty` (`sensitivityToPenalty` in
`CommonGraph.tsx`):

```
penalty = 2^((0.5 − s) · 4)        // s = slider position in [0.1, 0.99]
```

Midpoint `s = 0.5` → `penalty = 1` → standard BIC. Right lowers the penalty
(finer modes), left raises it (fewer modes). It's a genuine complexity prior, so
every slider position is a coherent model-selection rule rather than a post-hoc
threshold.

### Robustness on small samples

Three details keep EM/BIC well-behaved on real (n ≈ 15–80) perf samples.

- **Two deterministic inits.** EM only finds a local optimum, so for each `K` we
  run it from two starts and keep the higher-likelihood fit: equal-count sorted
  **chunks** (`initChunks`, good for comparably-sized modes) and deterministic
  **k-means** (`initKmeans`: farthest-point seeding + Lloyd, robust when modes
  differ wildly in size — the diffuse-slow case). There is **no RNG** anywhere,
  so a given input always yields the same modes — important for a UI that re-fits
  on every slider tick.
- **Variance floor.** A component fit to identical values wants `σ → 0`, sending
  the likelihood to infinity (singular-component collapse). We floor variance at
  `max((span·0.01)², resolution²)`, where `resolution` is the smallest gap
  between distinct values. The `resolution²` term is essential for **quantised**
  data (e.g. ms-rounded timings): without it GMM — *and scikit-learn* — fit one
  razor-thin component per rounding level. Flooring `σ` at the rounding step
  collapses those into the single real mode.
- **Cleanup & boundaries.** Components holding < ~1.5 effective samples
  (`π_k·n < 1.5`) are dropped as outlier blips; components closer than 2% of the
  span are merged. The **boundary** between adjacent modes is the Bayes-optimal
  crossing where `π_k N_k(x) = π_{k+1} N_{k+1}(x)` (`componentCrossing`), i.e. a
  run is assigned to whichever mode is more responsible there — *not* the KDE
  valley floor (the two differ for asymmetric or unequal-weight modes).

Very small samples (n < 4, or all values identical) can't support a mixture; we
fall back to a single mode at the mean.

### Validation against scikit-learn

`fitGmmModes` was cross-checked against `sklearn.mixture.GaussianMixture`
(matched `reg_covar`, `n_init=10`, BIC selection) on real and synthetic cases.
With matched settings the two agree on the **mode count for every case**, means
within < 0.1%, weights matching. The robustness fixes above were driven by that
comparison: dual init brought our local optima in line with sklearn's
multi-restart behaviour, and the resolution-aware floor matches how the
reference must also be configured for quantised data.

### Related: the median-difference confidence interval

The Mann–Whitney blurb's interval is a **BCa bootstrap** CI for the difference
of medians (`bootstrapMedianDiffCI` in
[`src/utils/bootstrap-ci.ts`](../src/utils/bootstrap-ci.ts), validated against
`scipy.stats.bootstrap(method='BCa')`). BCa needs a leave-one-out jackknife for
its acceleration term, undefined for a single observation, so the function
returns `null` when either side has < 2 runs and the UI shows no interval
(rather than `[NaN, NaN]`).

---

## Noisy benchmarks and what the numbers really mean

Our benchmarks are noisy — not just natural run-to-run jitter, but infra
contamination: a noisy-neighbour VM, thermal throttling, a degraded machine, a
one-off GC or network stall. It's worth being explicit about how that squares
with the precise-looking maths above.

### Precise is not the same as accurate

Everything here is **precise about the sample, not about the truth.** The
percentages and the confidence interval quantify *sampling variability* under
the assumption that the runs are independent draws from a **stable process**.
Infra noise breaks exactly that assumption: it's non-stationary and often
correlated (a bad machine spoils a *batch* of runs, not one). So a number can be
precise and accurate-*looking* while being centred on a contaminated estimate —
a tight interval around the wrong value. Read these as **descriptive statements
about the runs you have**, conditional on those runs being representative — not
as verdicts about the performance of the change.

### Three things we call "noise"

- **Within-run jitter** — the natural spread. This is what the density curve and
  the interval legitimately describe.
- **Real multimodality** — genuine fast/slow code paths. This is the *signal*
  modal analysis exists to surface.
- **Infra contamination** — outliers and spurious clusters that are properties
  of the measurement environment, not the code.

The catch: **the second and third look identical in a single sample.** A small
second mode could be a real slow path, or three runs that happened to land on a
sick machine. No amount of maths on that one sample can tell them apart — it
isn't an estimation problem, it's an *identifiability* problem. Only context
resolves it: retriggers, cross-machine and cross-time consistency, job logs,
known-flaky lists.

### Why the robust stats lead, and modes are advisory

This is why the headline comparison uses the median, Mann–Whitney, and a BCa
interval: they're **robust to outliers by construction**, so a few
infra-poisoned runs barely move them. Mode detection is deliberately the *least*
robust layer — it actively hunts for structure, so it's the most likely to latch
onto an infra-induced cluster. That's only useful when treated as
**exploratory**, which is why it's an opt-in toggle: the default view (KDE plus
the raw scatter strip) is descriptive and lets you *see* the noise, and modal
analysis is the interpretive layer you reach for and can dial back with the
sensitivity slider. The BIC penalty, the minimum-samples floor, and the variance
floor are all there to *avoid* minting a mode out of a handful of bad runs.

### The reconciliation, and the real fix

In one line: **the maths surfaces candidate structure and quantifies the
uncertainty that's quantifiable; you supply the context it can't see.** Keep the
raw points in view, treat `n` and the interval as first-class, and don't let a
clean rendering imply more certainty than the data carries.

The biggest lever is not a better estimator — it's **replication**. Real modes
and real regressions reproduce across retriggers and machines; infra artifacts
usually don't. When a result looks surprising, more runs (or a check that the
effect holds across retriggers) buys more truth than any amount of statistical
refinement.
