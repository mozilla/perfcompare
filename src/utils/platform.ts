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

export const getPlatformVersion = (platformName: string): string | null => {
  // Example of adroid platform
  // android-hw-p6-13-0-android-aarch64-shippable-qr
  if (platformName.toLowerCase().includes('android'))
    return platformName.split('-')[2];
  return null;
};
