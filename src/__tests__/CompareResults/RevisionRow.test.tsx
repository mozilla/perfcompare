import { ReactElement } from 'react';

import { compareView } from '../../common/constants';
import { loader } from '../../components/CompareResults/loader';
import RevisionRow from '../../components/CompareResults/RevisionRow';
import { Platform } from '../../types/types';
import getTestData from '../utils/fixtures';
import {
  screen,
  renderWithRouter,
  FetchMockSandbox,
} from '../utils/test-utils';

function renderWithRoute(component: ReactElement) {
  (window.fetch as FetchMockSandbox)
    .get('begin:https://treeherder.mozilla.org/api/perfcompare/results/', [])
    .get('begin:https://treeherder.mozilla.org/api/project/', {
      results: [],
    });

  return renderWithRouter(component, {
    route: '/compare-results/',
    search: '?baseRev=spam&baseRepo=mozilla-central&framework=2',
    loader,
  });
}

describe('<RevisionRow>', () => {
  it.each([
    {
      platform: 'linux1804-32-shippable-qr',
      shortName: 'Linux 1804',
      hasIcon: true,
    },
    {
      platform: 'macosx1014-64-shippable-qr',
      shortName: 'OSX 1014',
      hasIcon: true,
    },
    {
      platform: 'windows2012-64-shippable',
      shortName: 'Windows 2012',
      hasIcon: true,
    },
    {
      platform: 'android-5-0-aarch64-release',
      shortName: 'Android',
      hasIcon: true,
    },
    {
      platform: 'android-hw-p6-13-0-android-aarch64-shippable-qr',
      shortName: 'Android p6',
      hasIcon: true,
    },
    {
      platform: 'i am not an operating system',
      shortName: 'Unspecified',
      hasIcon: false,
    },
  ])(
    'shows correct platform info for platform "$platform"',
    async ({ platform, shortName, hasIcon }) => {
      const {
        testCompareData: [rowData],
      } = getTestData();

      rowData.platform = platform as Platform;
      renderWithRoute(
        <RevisionRow
          result={rowData}
          view={compareView}
          gridTemplateColumns='none'
        />,
      );
      const shortNameNode = await screen.findByText(shortName);
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
