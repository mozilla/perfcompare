import { bootstrapMedianDiffCI } from '../utils/bootstrap-ci';

describe('bootstrapMedianDiffCI', () => {
  it('returns null when either group has fewer than 2 observations', () => {
    // A single run per side (common for some subtests) has no resampling
    // variability and the BCa jackknife is undefined — must not yield NaNs.
    expect(bootstrapMedianDiffCI([8.53], [8.73])).toBeNull();
    expect(bootstrapMedianDiffCI([], [1, 2, 3])).toBeNull();
    expect(bootstrapMedianDiffCI([1, 2, 3], [])).toBeNull();
    expect(bootstrapMedianDiffCI([5], [6])).toBeNull();
  });

  it('returns a finite interval bracketing the observed difference', () => {
    const base = [100, 102, 98, 101, 99, 103, 97, 100, 101, 99];
    const newData = [106, 108, 104, 107, 105, 109, 103, 106, 107, 105];
    const ci = bootstrapMedianDiffCI(base, newData);
    expect(ci).not.toBeNull();
    const { medianDiff, ciLow, ciHigh } = ci!;
    expect(Number.isFinite(ciLow)).toBe(true);
    expect(Number.isFinite(ciHigh)).toBe(true);
    expect(ciLow).toBeLessThanOrEqual(medianDiff);
    expect(ciHigh).toBeGreaterThanOrEqual(medianDiff);
  });

  it('is deterministic for a fixed seed', () => {
    const base = [10, 12, 11, 13, 9, 14, 10, 11];
    const newData = [14, 16, 15, 17, 13, 18, 14, 15];
    expect(bootstrapMedianDiffCI(base, newData)).toEqual(
      bootstrapMedianDiffCI(base, newData),
    );
  });
});
