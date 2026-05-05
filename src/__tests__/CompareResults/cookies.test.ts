import { getCookie, setCookie, deleteCookie } from '../../utils/cookies';

describe('getCookie', () => {
  it('returns null when no cookies are set', () => {
    expect(getCookie('perfcompare_sort')).toBeNull();
  });

  it('returns the value for an existing cookie', () => {
    document.cookie = 'perfcompare_sort=delta%7Cdesc; path=/';
    expect(getCookie('perfcompare_sort')).toBe('delta|desc');
  });

  it('returns null for a cookie that does not exist when others do', () => {
    document.cookie = 'perfcompare_sort=delta%7Cdesc; path=/';
    expect(getCookie('perfcompare_filter_status')).toBeNull();
  });

  it('finds the correct cookie when multiple cookies are present', () => {
    document.cookie = 'perfcompare_sort=delta%7Cdesc; path=/';
    document.cookie =
      'perfcompare_filter_status=regression%2Cimprovement; path=/';
    expect(getCookie('perfcompare_filter_status')).toBe(
      'regression,improvement',
    );
    expect(getCookie('perfcompare_sort')).toBe('delta|desc');
  });

  it('does not match a cookie whose name is only a prefix of the target', () => {
    document.cookie = 'perfcompare_filter_statusExtra=foo; path=/';
    expect(getCookie('perfcompare_filter_status')).toBeNull();
  });

  it('handles leading whitespace between cookies (the trim behaviour)', () => {
    // jsdom separates cookies with '; ', so the second onward has a leading space.
    document.cookie = 'perfcompare_sort=asc; path=/';
    document.cookie = 'perfcompare_filter_status=regression; path=/';
    // The second cookie will appear as ' perfcompare_filter_status=regression'
    // in document.cookie — trimmed.startsWith must handle that.
    expect(getCookie('perfcompare_filter_status')).toBe('regression');
  });
});

describe('setCookie', () => {
  it('writes a cookie that getCookie can subsequently read', () => {
    setCookie('perfcompare_sort', 'delta|desc');
    expect(getCookie('perfcompare_sort')).toBe('delta|desc');
  });

  it('URL-encodes special characters in the value', () => {
    setCookie('perfcompare_filter_status', 'regression,improvement');
    expect(getCookie('perfcompare_filter_status')).toBe(
      'regression,improvement',
    );
  });

  it('overwrites a previously set cookie with the same name', () => {
    setCookie('perfcompare_sort', 'delta|desc');
    setCookie('perfcompare_sort', 'confidence|asc');
    expect(getCookie('perfcompare_sort')).toBe('confidence|asc');
  });
});

describe('deleteCookie', () => {
  it('removes a cookie so getCookie returns null afterwards', () => {
    setCookie('perfcompare_sort', 'delta|desc');
    expect(getCookie('perfcompare_sort')).toBe('delta|desc');

    deleteCookie('perfcompare_sort');
    expect(getCookie('perfcompare_sort')).toBeNull();
  });

  it('is a no-op when the cookie does not exist', () => {
    expect(() => deleteCookie('perfcompare_sort')).not.toThrow();
    expect(getCookie('perfcompare_sort')).toBeNull();
  });
});
