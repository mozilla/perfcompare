import RevisionRow from '../../components/CompareResults/RevisionRow';
import { Platform } from '../../types/types';
import getTestData from '../utils/fixtures';
import { render, screen } from '../utils/test-utils';

describe('<RevisionRow>', () => {
  it.each([
    {
      platform: 'linux1804-32-shippable-qr',
      shortName: 'Linux',
      hasIcon: true,
    },
    {
      platform: 'macosx1014-64-shippable-qr',
      shortName: 'OSX',
      hasIcon: true,
    },
    {
      platform: 'windows2012-64-shippable',
      shortName: 'Windows',
      hasIcon: true,
    },
    {
      platform: 'android-5-0-aarch64-release',
      shortName: 'Android',
      hasIcon: true,
    },
    {
      platform: 'i am not an operating system',
      shortName: 'Unspecified',
      hasIcon: false,
    },
  ])(
    'shows correct platform info for platform "$platform"',
    ({ platform, shortName, hasIcon }) => {
      const {
        testCompareData: [rowData],
      } = getTestData();

      rowData.platform = platform as Platform;
      render(<RevisionRow result={rowData} />);
      const shortNameNode = screen.getByText(shortName);
      expect(shortNameNode).toBeInTheDocument();
      const previousNode = shortNameNode.previousSibling;
      /* eslint-disable jest/no-conditional-expect */
      if (hasIcon) {
        expect(previousNode?.nodeName).toBe('svg');
      } else {
        expect(previousNode).toBeNull();
      }
      /* eslint-enable */
    },
  );
});
