import {
  formatDate,
  getLatestCommitMessage,
  getPlatformInfo,
  setConfidenceClassName,
  truncateHash,
  swapArrayElements,
  getDocsURL,
} from '../utils/helpers';
import getTestData from './utils/fixtures';

describe('getDocsURL Helper', () => {
  it('should return the correct URL for a supported perfdocs framework', () => {
    const { docsURL, isLinkSupported } = getDocsURL('TestSuite', 1);

    expect(docsURL).toBe(
      'https://firefox-source-docs.mozilla.org/testing/perfdocs/talos.html#testsuite',
    );
    expect(isLinkSupported).toBe(true);
  });

  it('should return the correct URL for "devtools" framework', () => {
    const { docsURL, isLinkSupported } = getDocsURL('AnotherTestSuite', 12);

    expect(docsURL).toBe(
      'https://firefox-source-docs.mozilla.org/devtools/tests/performance-tests-overview.html#anothertestsuite',
    );
    expect(isLinkSupported).toBe(true);
  });

  it('should return isLinkSupported as false for an unsupported framework', () => {
    const { docsURL, isLinkSupported } = getDocsURL('UnsupportedSuite', 16);

    expect(docsURL).toBe('');
    expect(isLinkSupported).toBe(false);
  });

  it('should handle suite names with special characters correctly', () => {
    const { docsURL, isLinkSupported } = getDocsURL(
      'Suite With:Special.Characters',
      12,
    );

    expect(docsURL).toBe(
      'https://firefox-source-docs.mozilla.org/devtools/tests/performance-tests-overview.html#suite-with-special-characters',
    );
    expect(isLinkSupported).toBe(true);
  });
});

describe('truncateHash Helper', () => {
  it('correctly returns 12-character short hash', () => {
    const { testData } = getTestData();

    const hash = truncateHash(testData[3].revision);

    expect(hash).toStrictEqual('spamspamspam');
    expect(hash.length).toStrictEqual(12);
  });
});

describe('getLatestCommitMessage Helper', () => {
  it('correctly returns latest commit message', () => {
    const { testData } = getTestData();

    const commitMessage = getLatestCommitMessage(testData[4]);

    expect(commitMessage).toStrictEqual('It got better...');
  });
});

describe('formateDate Helper', () => {
  it('correctly formats date', () => {
    const timestamp = 1649883600;
    const date = formatDate(timestamp);
    expect(date).toStrictEqual('04/13/22 21:00');
  });
});

describe('getPlatformInfo Helper', () => {
  it.each([
    { platform: 'linux-shippable', shortName: 'Linux' },
    { platform: 'OS X 10.14 Shippable', shortName: 'OSX' },
    { platform: 'windows10-64-mingwclang', shortName: 'Windows' },
    { platform: 'Android 5.0 AArch64 Release', shortName: 'Android' },
    { platform: 'i am not an operating system', shortName: '' },
  ])('returns correct class name', (test) => {
    expect(getPlatformInfo(test.platform).shortName).toStrictEqual(
      test.shortName,
    );
  });
});

describe('setConfidenceClassName', () => {
  it.each([
    { confidenceText: 'low', className: 'low' },
    { confidenceText: 'med', className: 'med' },
    { confidenceText: 'high', className: 'high' },
    { confidenceText: null, className: 'unknown-confidence' },
  ])('returns correct class name', (test) => {
    expect(setConfidenceClassName(test.confidenceText)).toStrictEqual(
      test.className,
    );
  });
});

describe('swapArrayElements', () => {
  const array = [1, 2, 3, 4];
  it('should swap first and last element', () => {
    const swappedArray = swapArrayElements(array, 0, array.length - 1);
    expect(swappedArray[0]).toBe(array[array.length - 1]);
    expect(swappedArray[array.length - 1]).toEqual(array[0]);
  });
  it('should return initial copy of inital array', () => {
    const swappedArray = swapArrayElements(array, 5, 0);
    swappedArray.forEach((el, index) => expect(el).toEqual(array[index]));
  });
});
