import {
  formatDate,
  getLatestCommitMessage,
  setPlatformClassName,
  truncateHash,
} from '../../utils/helpers';
import getTestData from '../utils/fixtures';

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
  it('returns correct class name', () => {
    const linux = 'linux-shippable';
    const osx = 'OS X 10.14 Shippable';
    const windows = 'windows10-64-mingwclang';
    const android = 'Android 5.0 AArch64 Release';
    const random = 'i am not an operating system';

    expect(setPlatformClassName(linux)).toStrictEqual('linux');
    expect(setPlatformClassName(osx)).toStrictEqual('osx');
    expect(setPlatformClassName(windows)).toStrictEqual('windows');
    expect(setPlatformClassName(android)).toStrictEqual('android');
    expect(setPlatformClassName(random)).toStrictEqual('');
  });
});
