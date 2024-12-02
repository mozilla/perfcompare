import { getPlatformAndVersion } from '../../utils/platform';

describe('platform helper', () => {
  it('should return Android p6', () => {
    const platform = getPlatformAndVersion(
      'android-hw-p6-13-0-android-aarch64-shippable-qr',
    );

    expect(platform).toBe('Android\u00a0p6');
  });

  it('should return Android', () => {
    const platform = getPlatformAndVersion('android-5-0-aarch64-release');

    expect(platform).toBe('Android');
  });

  it('should return Windows', () => {
    const platform = getPlatformAndVersion('windows11-64-shippable-qr');

    expect(platform).toBe('Windows');
  });
});
