import { renderHook } from '@testing-library/react';

import useDocsURL from '../../hooks/useDocsURL';

describe('useDocsURL', () => {
  it('should return the correct URL for a supported perfdocs framework', () => {
    const { result } = renderHook(() => useDocsURL('TestSuite', 1));

    expect(result.current.docsURL).toBe(
      'https://firefox-source-docs.mozilla.org/testing/perfdocs/talos.html#testsuite',
    );
    expect(result.current.isLinkSupported).toBe(true);
  });

  it('should return the correct URL for "devtools" framwork', () => {
    const { result } = renderHook(() => useDocsURL('AnotherTestSuite', 12));

    expect(result.current.docsURL).toBe(
      'https://firefox-source-docs.mozilla.org/devtools/tests/performance-tests-overview.html#anothertestsuite',
    );
    expect(result.current.isLinkSupported).toBe(true);
  });

  it('should return isLinkSupported as false for an unsupported framework', () => {
    const { result } = renderHook(() => useDocsURL('UnsupportedSuite', 16));

    expect(result.current.docsURL).toBe('');
    expect(result.current.isLinkSupported).toBe(false);
  });

  it('should handle suite names with special characters correctly', () => {
    const { result } = renderHook(() =>
      useDocsURL('Suite With:Special.Characters', 12),
    );

    expect(result.current.docsURL).toBe(
      'https://firefox-source-docs.mozilla.org/devtools/tests/performance-tests-overview.html#suite-with-special-characters',
    );
    expect(result.current.isLinkSupported).toBe(true);
  });
});
