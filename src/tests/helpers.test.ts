import {
  formatDate,
  getLatestCommitMessage,
  setPlatformClassName,
  truncateHash,
} from '../utils/helpers';
import getTestData from './utils/fixtures';

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

describe('setPlatformClassName Helper', () => {
  it.each([
    { platform: 'linux-shippable', className: 'linux' },
    { platform: 'OS X 10.14 Shippable', className: 'osx' },
    { platform: 'windows10-64-mingwclang', className: 'windows' },
    { platform: 'Android 5.0 AArch64 Release', className: 'android' },
    { platform: 'i am not an operating system', className: '' },
  ])('returns correct class name', (test) => {
    expect(setPlatformClassName(test.platform)).toStrictEqual(test.className);
  });
});
