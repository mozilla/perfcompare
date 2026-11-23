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

  it('never matches down(xs)', () => {
    let query = '';
    function ReadQuery() {
      query = useTheme().breakpoints.down('xs').replace('@media ', '');
      return null;
    }
    render(<ReadQuery />);
    setViewportWidth(0);
    expect(window.matchMedia(query).matches).toBe(false);
    setViewportWidth(1920);
    expect(window.matchMedia(query).matches).toBe(false);
  });

  it('does not match queries it cannot evaluate', () => {
    setViewportWidth(900);
    expect(window.matchMedia('print').matches).toBe(false);
    expect(() => window.matchMedia('not all and (min-width:1024px)')).toThrow(
      /not.*media query/,
    );
  });

  it('matches nothing when no viewport width is set', () => {
    render(<BreakpointProbe />);
    expect(screen.getByTestId('tablet-up')).toHaveTextContent('false');
    expect(screen.getByTestId('below-desktop')).toHaveTextContent('false');
  });
});
