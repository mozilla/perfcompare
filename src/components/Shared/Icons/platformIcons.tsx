import { type ReactNode } from 'react';

import AppleIcon from '@mui/icons-material/Apple';

import AndroidIcon from './AndroidIcon';
import LinuxIcon from './LinuxIcon';
import WindowsIcon from './WindowsIcon';
import type { PlatformShortName } from '../../../types/state';
import { getPlatformShortName } from '../../../utils/platform';

const platformIcons: Record<PlatformShortName, ReactNode> = {
  Linux: <LinuxIcon />,
  macOS: <AppleIcon />,
  iOS: <AppleIcon />,
  Windows: <WindowsIcon />,
  Android: <AndroidIcon />,
  Unspecified: '',
};

// Returns the icon for a raw platform string (eg. 'linux1804-64-shippable-qr').
export function getPlatformIcon(platform: string): ReactNode {
  return platformIcons[getPlatformShortName(platform)];
}
