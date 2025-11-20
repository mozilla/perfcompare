import {
  formatDate,
  getLatestCommitMessage,
  setConfidenceClassName,
  truncateHash,
  swapArrayElements,
  getDocsURL,
  getModeInterpretation,
  capitalize,
  cliffsDeltaPercentage,
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

  it("should not support 'total-after-gc' suite of devtools framework", () => {
    const { docsURL, isLinkSupported } = getDocsURL('total-after-gc', 12);

    expect(docsURL).toBe('');
    expect(isLinkSupported).toBe(false);
  });

  it('should not support non-documented test suites of devtools framework', () => {
    const { docsURL, isLinkSupported } = getDocsURL(
      'reload-inspector:parent-process',
      12,
    );

    expect(docsURL).toBe('');
    expect(isLinkSupported).toBe(false);
  });
});

describe('truncateHash Helper', () => {
  it('correctly returns 12-character short hash', () => {
    const { testData } = getTestData();

    const hash = truncateHash(testData[3].revision);

    expect(hash).toBe('spamspamspam');
    expect(hash).toHaveLength(12);
  });
});

describe('getLatestCommitMessage Helper', () => {
  it('correctly returns latest commit message', () => {
    const { testData } = getTestData();

    const commitMessage = getLatestCommitMessage(testData[4]);

    expect(commitMessage).toBe('She turned me into a newt!');
  });
});

describe('formateDate Helper', () => {
  it('correctly formats date', () => {
    const timestamp = 1649883600;
    const date = formatDate(timestamp);
    expect(date).toBe('04/13/22 21:00');
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

describe('getModeInterpretation', () => {
  const baseMode1 = 1;
  const newMode1 = 1;
  const baseMode2 = 2;
  const newMode2 = 2;
  const baseModenull = null;
  const newMode0 = 0;
  const baseMode0 = 0;
  const newModenull = null;

  it('should handle same mode count interpretation for base and new', () => {
    const expectedStr = getModeInterpretation(baseMode1, newMode1);
    expect(expectedStr).toBe('Base and New revisions are unimodal');
    const expectedStr2 = getModeInterpretation(baseMode2, newMode2);
    expect(expectedStr2).toBe('Base and New revisions are multimodal');
  });

  it('should handle different mode count interpretation for base and new', () => {
    const expectedStr2 = getModeInterpretation(baseMode2, newMode1);
    expect(expectedStr2).toBe('Base is multimodal and New is unimodal');
    const expectedStr3 = getModeInterpretation(baseMode1, newMode2);
    expect(expectedStr3).toBe('Base is unimodal and New is multimodal');
  });

  it('should get mode interpretation with both baseRev and newRev as null or 0', () => {
    const expectedStr4 = getModeInterpretation(baseModenull, newMode0);
    expect(expectedStr4).toBe(
      'No modes or data for Base and New, possible oversmoothing, KDE evaluation failed',
    );
    const expectedStr5 = getModeInterpretation(baseModenull, newModenull);
    expect(expectedStr5).toBe(
      'No modes or data for Base and New, possible oversmoothing, KDE evaluation failed',
    );
    const expectedStr6 = getModeInterpretation(baseMode0, newMode0);
    expect(expectedStr6).toBe(
      'No modes or data for Base and New, possible oversmoothing, KDE evaluation failed',
    );

    const expectedStr7 = getModeInterpretation(baseMode0, newModenull);
    expect(expectedStr7).toBe(
      'No modes or data for Base and New, possible oversmoothing, KDE evaluation failed',
    );
  });

  it('should get N/A for interpretModeCount one of baseRev or newRev < 1 and not null', () => {
    const expectedStr1 = getModeInterpretation(baseMode2, newMode0);
    expect(expectedStr1).toBe('Base is multimodal and New is N/A');
    const expectedStr2 = getModeInterpretation(baseMode0, newMode2);
    expect(expectedStr2).toBe('Base is N/A and New is multimodal');
  });

  it('should get N/A for interpretModeCount one of baseRev or newRev as null', () => {
    const expectedStr0 = getModeInterpretation(baseModenull, newMode1);
    expect(expectedStr0).toBe('Base is N/A and New is unimodal');
    const expectedStr3 = getModeInterpretation(baseMode1, newModenull);
    expect(expectedStr3).toBe('Base is unimodal and New is N/A');
  });
});

describe('capitalize', () => {
  const string1 = 'i love my dog.';
  const string2 = 'monkey';
  const string3 = '';

  it('should capitalize first letter of a string', () => {
    const capializedString1 = capitalize(string1);
    expect(capializedString1).toBe('I love my dog.');
    const capializedString2 = capitalize(string2);
    expect(capializedString2).toBe('Monkey');
    const capializedString3 = capitalize(string3);
    expect(capializedString3).toBe('');
  });

  it('should handle empty string', () => {
    const capializedString3 = capitalize(string3);
    expect(capializedString3).toBe('');
  });
});

describe('cliffsDeltaPercentage', () => {
  const cliffs_delta1 = 0.1;
  const cliffs_delta2 = -1;
  const cliffs_delta3 = 1;

  it('should calculate cliffs delta percentage', () => {
    const expectedValue = cliffsDeltaPercentage(cliffs_delta1);
    expect(expectedValue).toBe('55.00');
    const expectedValue2 = cliffsDeltaPercentage(cliffs_delta2);
    expect(expectedValue2).toBe('0.00');
    const expectedValue3 = cliffsDeltaPercentage(cliffs_delta3);
    expect(expectedValue3).toBe('100.00');
  });
});
