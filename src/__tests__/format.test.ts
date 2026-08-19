import { formatNumber, formatNumberFixedTwo, withSign } from '../utils/format';

describe('withSign', () => {
  describe('with raw numbers', () => {
    it('prefixes a positive number with "+"', () => {
      expect(withSign(1.08)).toBe('+1.08');
    });

    it('leaves a negative number with its own "-"', () => {
      expect(withSign(-1.08)).toBe('-1.08');
    });

    it('gives zero no sign', () => {
      expect(withSign(0)).toBe('0');
    });

    it('collapses negative zero to a plain zero', () => {
      expect(withSign(-0)).toBe('0');
    });
  });

  describe('with formatted strings (the display path)', () => {
    it('does not add "+" to a positive that rounds to zero', () => {
      expect(withSign(formatNumber(0.0004))).toBe('0'); // not '+0'
    });

    it('drops the stray "-" from a negative that rounds to zero', () => {
      expect(withSign(formatNumber(-0.0004))).toBe('0'); // not '-0'
    });

    it('prefixes a positive formatted value with "+"', () => {
      expect(withSign(formatNumber(1.08))).toBe('+1.08');
    });

    it('keeps the "-" on a negative formatted value', () => {
      expect(withSign(formatNumber(-1.08))).toBe('-1.08');
    });

    it('preserves thousands grouping while adding the sign', () => {
      expect(withSign(formatNumber(2113.69))).toBe('+2,113.69');
      expect(withSign(formatNumber(-2113.69))).toBe('-2,113.69');
    });

    it('drops the stray "-" from a fixed-two-decimal negative zero', () => {
      expect(withSign(formatNumberFixedTwo(-0.0004))).toBe('0.00'); // not '-0.00'
    });

    it('returns an empty string unchanged (the "no runs" guard case)', () => {
      expect(withSign('')).toBe('');
    });
  });
});
