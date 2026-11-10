import { getPlatformAndVersion } from '../../utils/platform';

describe('platform helper', () => {
  it('should return the Android device name', () => {
    const platform = getPlatformAndVersion(
      'android-hw-p6-13-0-android-aarch64-shippable-qr',
    );

    expect(platform).toBe('Pixel\u00a06');
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
