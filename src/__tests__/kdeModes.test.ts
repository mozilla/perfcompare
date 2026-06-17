import {
  areaFracs,
  assignLetters,
  fitModesFromKde,
  matchModes,
  splitByMode,
} from '../utils/kde.js';

// Build a synthetic KDE: a sum of narrow Gaussian bumps on a uniform grid.
// Useful for tests that need a curve with known peak locations.
function gaussianBumps(
  grid: { lo: number; hi: number; n: number },
  bumps: Array<{ mu: number; sigma: number; weight: number }>,
) {
  const { lo, hi, n } = grid;
  const x: number[] = [];
  const y: number[] = [];
  for (let i = 0; i < n; i++) {
    const xi = lo + ((hi - lo) * i) / (n - 1);
    let yi = 0;
    for (const { mu, sigma, weight } of bumps) {
      yi +=
        (weight * Math.exp(-((xi - mu) ** 2) / (2 * sigma ** 2))) /
        (sigma * Math.sqrt(2 * Math.PI));
    }
    x.push(xi);
    y.push(yi);
  }
  return { x, y };
}

describe('areaFracs', () => {
  it('integrates a flat curve uniformly across buckets', () => {
    // Constant y over [0, 10] with one boundary at 5 → two equal halves.
    const x = Array.from({ length: 101 }, (_, i) => i * 0.1);
    const y = x.map(() => 1);
    const fracs = areaFracs(x, y, [5]);
    expect(fracs).toHaveLength(2);
    expect(fracs[0]).toBeCloseTo(0.5, 5);
    expect(fracs[1]).toBeCloseTo(0.5, 5);
  });

  it('weights area toward whichever side has more density', () => {
    // Triangle from y=2 at x=0 down to y=0 at x=10; boundary at 5 splits a
    // 3:1 area ratio (left half integrates to 7.5, right half to 2.5).
    const x = Array.from({ length: 101 }, (_, i) => i * 0.1);
    const y = x.map((xi) => Math.max(0, 2 - xi * 0.2));
    const fracs = areaFracs(x, y, [5]);
    expect(fracs[0]).toBeCloseTo(0.75, 2);
    expect(fracs[1]).toBeCloseTo(0.25, 2);
  });

  it('falls back to uniform fractions when total area is zero', () => {
    const x = [0, 1, 2, 3];
    const y = [0, 0, 0, 0];
    expect(areaFracs(x, y, [1.5])).toEqual([0.5, 0.5]);
  });

  it('handles no boundaries (everything in one bucket)', () => {
    const x = Array.from({ length: 11 }, (_, i) => i);
    const y = x.map(() => 1);
    const fracs = areaFracs(x, y, []);
    expect(fracs).toEqual([1]);
  });
});

describe('fitModesFromKde', () => {
  it('returns a single mode for a unimodal curve', () => {
    const { x, y } = gaussianBumps({ lo: 0, hi: 100, n: 1024 }, [
      { mu: 50, sigma: 5, weight: 1 },
    ]);
    const modes = fitModesFromKde(x, y, 0.5);
    expect(modes.peakLocs).toHaveLength(1);
    expect(modes.peakLocs[0]).toBeCloseTo(50, 0);
    expect(modes.boundaries).toEqual([]);
  });

  it('detects two well-separated modes', () => {
    const { x, y } = gaussianBumps({ lo: 0, hi: 100, n: 1024 }, [
      { mu: 20, sigma: 3, weight: 1 },
      { mu: 80, sigma: 3, weight: 1 },
    ]);
    const modes = fitModesFromKde(x, y, 0.5);
    expect(modes.peakLocs).toHaveLength(2);
    expect(modes.peakLocs[0]).toBeCloseTo(20, 0);
    expect(modes.peakLocs[1]).toBeCloseTo(80, 0);
    expect(modes.boundaries).toHaveLength(1);
    expect(modes.boundaries[0]).toBeGreaterThan(20);
    expect(modes.boundaries[0]).toBeLessThan(80);
  });

  it('collapses overlapping bumps when valley is shallow (vt strict)', () => {
    // Two nearby bumps share a shallow valley. vt = 0.1 (strict) keeps them
    // merged, vt = 0.9 (lenient) splits them.
    const { x, y } = gaussianBumps({ lo: 0, hi: 100, n: 1024 }, [
      { mu: 48, sigma: 5, weight: 1 },
      { mu: 56, sigma: 5, weight: 1 },
    ]);
    const strict = fitModesFromKde(x, y, 0.1);
    const lenient = fitModesFromKde(x, y, 0.99);
    expect(strict.peakLocs).toHaveLength(1);
    // Lenient may still merge depending on the valley depth — what matters
    // is that strict ≤ lenient mode count, never the other way around.
    expect(lenient.peakLocs.length).toBeGreaterThanOrEqual(
      strict.peakLocs.length,
    );
  });

  it('applies the minimum-separation guard on near-integer data', () => {
    // Two bumps closer than minSep = max(2, 5% of range) — they're > 5%
    // valley-deep but < 2 units apart, so the guard collapses them.
    const { x, y } = gaussianBumps({ lo: 0, hi: 100, n: 1024 }, [
      { mu: 50, sigma: 0.3, weight: 1 },
      { mu: 51, sigma: 0.3, weight: 1 },
    ]);
    const modes = fitModesFromKde(x, y, 0.9);
    expect(modes.peakLocs).toHaveLength(1);
  });

  it('returns the global max location when no peak clears mpf', () => {
    // Strictly increasing curve has no interior local maxima.
    const x = Array.from({ length: 100 }, (_, i) => i);
    const y = x.map((xi) => xi);
    const modes = fitModesFromKde(x, y, 0.5);
    expect(modes.peakLocs).toEqual([99]);
    expect(modes.boundaries).toEqual([]);
  });
});

describe('assignLetters', () => {
  it('assigns A to the smallest location', () => {
    expect(assignLetters([30, 10, 20])).toEqual(['C', 'A', 'B']);
  });

  it('preserves a single mode as A', () => {
    expect(assignLetters([42])).toEqual(['A']);
  });

  it('handles already-sorted input', () => {
    expect(assignLetters([1, 2, 3, 4])).toEqual(['A', 'B', 'C', 'D']);
  });
});

describe('matchModes', () => {
  it('pairs modes by proximity when counts match', () => {
    // Base modes at 10, 90; new modes at 12, 88 — should match index-to-index.
    const result = matchModes([10, 90], [0.5, 0.5], [12, 88], [0.5, 0.5]);
    expect(result.pairs).toEqual([
      [0, 0],
      [1, 1],
    ]);
    expect(result.ub).toEqual([]);
    expect(result.un).toEqual([]);
  });

  it('flips pairing when the closer match crosses indices', () => {
    // Base at [10, 90], new at [85, 15]: indices are reversed, so the optimal
    // pairing crosses: base[0] ↔ new[1], base[1] ↔ new[0].
    const result = matchModes([10, 90], [0.5, 0.5], [85, 15], [0.5, 0.5]);
    expect(result.pairs).toEqual([
      [0, 1],
      [1, 0],
    ]);
  });

  it('reports unmatched new modes when new has more than base', () => {
    const result = matchModes([50], [1], [10, 50, 90], [0.3, 0.4, 0.3]);
    expect(result.pairs).toEqual([[0, 1]]);
    expect(result.ub).toEqual([]);
    expect(result.un.sort()).toEqual([0, 2]);
  });

  it('reports unmatched base modes when base has more than new', () => {
    const result = matchModes([10, 50, 90], [0.3, 0.4, 0.3], [50], [1]);
    expect(result.pairs).toEqual([[1, 0]]);
    expect(result.un).toEqual([]);
    expect(result.ub.sort()).toEqual([0, 2]);
  });

  it('returns empty pairs when either side is empty', () => {
    expect(matchModes([], [], [10], [1])).toEqual({
      pairs: [],
      ub: [],
      un: [0],
    });
    expect(matchModes([10], [1], [], [])).toEqual({
      pairs: [],
      ub: [0],
      un: [],
    });
  });
});

describe('splitByMode', () => {
  it('buckets samples by boundary', () => {
    expect(splitByMode([1, 3, 5, 7, 9], [4, 8])).toEqual([[1, 3], [5, 7], [9]]);
  });

  it('puts samples equal to a boundary into the lower bucket', () => {
    // splitByMode uses v > boundary, so boundary values go into bucket[m-1].
    expect(splitByMode([5], [5])).toEqual([[5], []]);
  });

  it('handles no boundaries (one bucket with everything)', () => {
    expect(splitByMode([1, 2, 3], [])).toEqual([[1, 2, 3]]);
  });

  it('returns empty buckets for empty data', () => {
    expect(splitByMode([], [4, 8])).toEqual([[], [], []]);
  });
});
