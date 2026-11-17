import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { screen } from '@testing-library/react';

import { render, setViewportWidth } from './utils/test-utils';

function BreakpointProbe() {
  const theme = useTheme();
  const isTabletUp = useMediaQuery(theme.breakpoints.up('sm'));
  const isBelowDesktop = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <>
      <span data-testid='tablet-up'>{String(isTabletUp)}</span>
      <span data-testid='below-desktop'>{String(isBelowDesktop)}</span>
    </>
  );
}

describe('Protocol breakpoints', () => {
  it('uses the Protocol breakpoint values', () => {
    let values;
    function ReadValues() {
      values = useTheme().breakpoints.values;
      return null;
    }
    render(<ReadValues />);
    expect(values).toEqual({ xs: 0, sm: 768, md: 1024, lg: 1312, xl: 1440 });
  });

  it.each([
    [375, 'false', 'true'],
    [767, 'false', 'true'],
    [768, 'true', 'true'],
    [1023, 'true', 'true'],
    [1024, 'true', 'false'],
    [1920, 'true', 'false'],
  ])(
    'at %ipx: tablet-up is %s, below-desktop is %s',
    (width, tabletUp, belowDesktop) => {
      setViewportWidth(width);
      render(<BreakpointProbe />);
      expect(screen.getByTestId('tablet-up')).toHaveTextContent(tabletUp);
      expect(screen.getByTestId('below-desktop')).toHaveTextContent(
        belowDesktop,
      );
    },
  );

  it('matches nothing when no viewport width is set', () => {
    render(<BreakpointProbe />);
    expect(screen.getByTestId('tablet-up')).toHaveTextContent('false');
    expect(screen.getByTestId('below-desktop')).toHaveTextContent('false');
  });
});
