import type { PlatformShortName } from '../types/state';

export const getPlatformShortName = (
  platformName: string,
): PlatformShortName => {
  if (platformName.toLowerCase().includes('linux')) return 'Linux';
  if (
    platformName.toLowerCase().includes('osx') ||
    platformName.toLowerCase().includes('os x')
  )
    return 'OSX';
  if (platformName.toLowerCase().includes('windows')) return 'Windows';
  if (platformName.toLowerCase().includes('android')) return 'Android';
  return 'Unspecified';
};

export const getPlatformAndVersion = (platform: string): string => {
  const platformShortName = getPlatformShortName(platform);
  // Example of android platform, the split is specific for this platform
  // Other platforms are built differently
  // android-hw-p6-13-0-android-aarch64-shippable-qr
  if (platform.startsWith('android-hw-'))
    return `${platformShortName}\u00a0${platform.split('-')[2]}`;
  return platformShortName;
};
