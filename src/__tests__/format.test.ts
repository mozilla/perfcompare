import { formatDelta, formatNumber } from '../utils/format';

describe('formatNumber', () => {
  it('groups thousands with a comma', () => {
    expect(formatNumber(2113.69)).toBe('2,113.69');
  });
});

describe('formatDelta', () => {
  it('shows an explicit plus sign on positive values', () => {
    expect(formatDelta(53.31)).toBe('+53.31');
  });

  it('keeps the minus sign on negative values', () => {
    expect(formatDelta(-1.43)).toBe('-1.43');
  });

  it('shows no sign for zero', () => {
    expect(formatDelta(0)).toBe('0');
  });

  it('groups thousands', () => {
    expect(formatDelta(2113.69)).toBe('+2,113.69');
  });

  it('rounds to at most two fraction digits', () => {
    expect(formatDelta(1.005)).toBe('+1.01');
    expect(formatDelta(1.5)).toBe('+1.5');
  });
});
