/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { media, types } from 'typestyle';

import { ScreenSize } from './ScreenSize';

type NestedCSSProperties = types.NestedCSSProperties;
type MediaQuery = types.MediaQuery;

// These styles correspond to protocol breakpoints
// Ref: https://protocol.mozilla.org/components/detail/content-container--default.html
const screenMediaQueries: MediaQuery[] = [
  { maxWidth: 319.9999 }, // Extra Small
  { minWidth: 320, maxWidth: 767.99999 }, // Small
  { minWidth: 768, maxWidth: 1023.99999 }, // Medium
  { minWidth: 1024, maxWidth: 1311.99999 }, // Large
  { minWidth: 1312, maxWidth: 1439.99999 }, // xLarge
  { minWidth: 1440 }, // xxxLarge
];

export function createResponsiveStyle(
  size: ScreenSize,
  css: NestedCSSProperties,
  applyToHigherSizes = false,
): NestedCSSProperties {
  // If small and up are enabled, no need for media query
  if (size === ScreenSize.Small && applyToHigherSizes) {
    return css;
  }

  if (applyToHigherSizes) {
    return media({ minWidth: screenMediaQueries[size].minWidth }, css);
  }

  return media(screenMediaQueries[size], css);
}