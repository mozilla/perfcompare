import { render } from '@testing-library/react';

import ToggleDarkMode from '../../components/Shared/ToggleDarkModeButton';

test('renders dark mode toggle button with testid', () => {
  const { getByTestId } = render(
    <ToggleDarkMode 
        theme={{ palette: { mode: 'light' } }} 
        toggleColorMode={ () => {} } 
    />,
  );
  const darkModeToggle = getByTestId('dark-mode-toggle');
  expect(darkModeToggle).toBeInTheDocument();
});
