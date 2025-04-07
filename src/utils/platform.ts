import type { PlatformShortName } from '../types/state';

export const getPlatformShortName = (
  platformName: string,
): PlatformShortName => {
  if (platformName.toLowerCase().includes('linux')) return 'Linux';
  if (
    platformName.toLowerCase().includes('osx') ||
    platformName.toLowerCase().includes('os x')
  )
    return 'macOS';
  if (platformName.toLowerCase().startsWith('win')) return 'Windows';
  if (platformName.toLowerCase().includes('android')) return 'Android';
  return 'Unspecified';
};

// Link to the os examples that were used
// https://github.com/mozilla/treeherder/blob/master/ui/helpers/constants.js#L29
const osMapping = {
  linux64: 'Linux x64',
  linux1804: 'Linux 18.04',
  linux2204: 'Linux 22.04',
  osx: 'macOS',
  macosx1014: 'macOS 10.14',
  macosx1015: 'macOS 10.15',
  macosx1100: 'macOS 11',
  macosx1300: 'macOS 13',
  macosx1400: 'macOS 14.00',
  macosx1470: 'macOS 14.70',
  win32: 'Windows x86',
  win64: 'Windows x64',
  windows7: 'Windows 7',
  windows10: 'Windows 10',
  windows11: 'Windows 11',
  windows2012: 'Windows 2012',
  windows: 'Windows',
};

type PlatformOS = keyof typeof osMapping;

const extractPlatformWithOs = (platform: string) => {
  const system = platform.split('-')[0];

  if (system in osMapping) {
    return osMapping[system as PlatformOS];
  }

  return getPlatformShortName(platform);
};

export const getPlatformAndVersion = (platform: string): string => {
  // Example of android platform, the split is specific for this platform
  // Other platforms are built differently
  // android-hw-p6-13-0-android-aarch64-shippable-qr
  if (platform.startsWith('android-hw-')) {
    const platformShortName = getPlatformShortName(platform);

    return `${platformShortName}\u00a0${platform.split('-')[2]}`;
  }

  return extractPlatformWithOs(platform);
};
export const getBrowserDisplay = (
  baseApp: string,
  newApp: string,
  expanded: boolean,
) => {
  if (expanded || !baseApp || !newApp) return false;
  return !(
    (baseApp.toLowerCase() === 'firefox' &&
      newApp.toLowerCase() === 'firefox') ||
    (baseApp.toLowerCase() === 'fenix' && newApp.toLowerCase() === 'fenix')
  );
};
