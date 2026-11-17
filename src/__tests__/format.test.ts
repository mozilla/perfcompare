import { formatDelta, formatNumber, getDisplayScale } from '../utils/format';

describe('formatNumber', () => {
  it('keeps two decimal places for whole and fractional values', () => {
    expect(formatNumber(7)).toBe('7.00');
    expect(formatNumber(7.6)).toBe('7.60');
  });

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

describe('getDisplayScale', () => {
  it.each([
    [9999, 1, 'ms'],
    [10000, 1000, 's'],
    [59999, 1000, 's'],
    [60000, 60000, 'min'],
  ])('scales %s milliseconds to %s with unit %s', (value, scale, unit) => {
    expect(getDisplayScale([value], 'ms')).toEqual({
      scale,
      displayUnit: unit,
      decimals: 2,
    });
  });

  it.each([
    [999, 1, 'uWh', 1],
    [1000, 1000, 'mWh', 2],
    [1e6, 1e6, 'Wh', 2],
  ])(
    'scales %s microwatt-hours to %s with unit %s',
    (value, scale, unit, decimals) => {
      expect(getDisplayScale([value], 'uWh')).toEqual({
        scale,
        displayUnit: unit,
        decimals,
      });
    },
  );
});
