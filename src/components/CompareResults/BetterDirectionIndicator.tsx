import Box from '@mui/material/Box';

import { Strings } from '../../resources/Strings';
import { FontSizeRaw, Spacing } from '../../styles';

interface BetterDirectionIndicatorProps {
  lowerIsBetter: boolean | null | undefined;
}

// The direction comes from the result's
// `lower_is_better` field. When that field is unknown (it can be null for
// Mann-Whitney results), we render nothing rather than a misleading label.
function BetterDirectionIndicator({
  lowerIsBetter,
}: BetterDirectionIndicatorProps) {
  if (lowerIsBetter === null || lowerIsBetter === undefined) {
    return null;
  }

  const label = lowerIsBetter
    ? Strings.components.betterDirection.lower
    : Strings.components.betterDirection.higher;

  return (
    <Box
      component='span'
      data-testid='better-direction-indicator'
      sx={{
        color: 'text.secondary',
        fontSize: FontSizeRaw.Small.fontSize,
        whiteSpace: 'nowrap',
        marginInline: `${Spacing.xSmall}px`,
      }}
    >
      {label}
    </Box>
  );
}

export default BetterDirectionIndicator;
