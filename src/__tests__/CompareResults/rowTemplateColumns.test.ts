import {
  defaultSortFunction,
  defaultSortSubtestFunction,
} from '../../utils/rowTemplateColumns';
import getTestData from '../utils/fixtures';

describe('defaultSortFunction', () => {
  it('should sort by header_name for MannWhitneyResultsItem mann-whitney-u test_version', () => {
    const { testCompareMannWhitneyData } = getTestData();

    const expected = defaultSortFunction(
      testCompareMannWhitneyData[0],
      testCompareMannWhitneyData[1],
    );
    expect(expected).toBe(1);
  });

  it('should sort by header_name for CompareResultsItem type for student-t test_version', () => {
    const { testCompareData } = getTestData();
    const expected = defaultSortFunction(
      testCompareData[0],
      testCompareData[1],
    );
    expect(expected).toBe(1);
  });
});

describe('defaultSortSubtestFunction', () => {
  it('should sort by header_name for MannWhitneyResultsItem mann-whitney-u test_version', () => {
    const { testCompareMannWhitneyData } = getTestData();

    const expected = defaultSortSubtestFunction(
      testCompareMannWhitneyData[0],
      testCompareMannWhitneyData[1],
    );
    expect(expected).toBe(0);
  });

  it('should sort by header_name for CompareResultsItem type for student-t test_version', () => {
    const { testCompareData } = getTestData();
    const expected = defaultSortSubtestFunction(
      testCompareData[0],
      testCompareData[1],
    );
    expect(expected).toBe(0);
  });
});
