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

const osMapping = {
  linux64: 'Linux x64',
  linux1804: 'Linux 18.04',
  linux2204: 'Linux 22.04',
  osx: 'OS X',
  macosx1015: 'OS X 10.15',
  macosx1100: 'OS X 11',
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

const extractPlatformWithOs = (platform: string) => {
  const name = osMapping[platform.split('-')[0]] as string;

  if (name) return name;

  return getPlatformShortName(platform);
};

export const getPlatformAndVersion = (platform: string): string => {
  const platformShortName = getPlatformShortName(platform);

  // Example of android platform, the split is specific for this platform
  // Other platforms are built differently
  // android-hw-p6-13-0-android-aarch64-shippable-qr
  if (platform.startsWith('android-hw-'))
    return `${platformShortName}\u00a0${platform.split('-')[2]}`;

  return extractPlatformWithOs(platform);
};
