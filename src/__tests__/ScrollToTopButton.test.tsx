import { render, fireEvent } from '@testing-library/react';

import ScrollToTopButton from '../components/CompareResults/ScrollToTopButton';

describe('ScrollToTopButton', () => {
  it('shows the button when the page is scrolled down', () => {
    const { getByRole } = render(<ScrollToTopButton />);
    expect(getByRole('button', { hidden: true })).toHaveStyle({ display: 'none' });

    window.pageYOffset = 500;
    fireEvent.scroll(window);
    expect(getByRole('button', { hidden: true })).toHaveStyle({ display: 'block' });
  });

  it('scrolls to the top of the page when clicked', () => {
    window.scrollTo = jest.fn();
    const { getByLabelText } = render(<ScrollToTopButton />);
    window.pageYOffset = 500;
    fireEvent.scroll(window);
    fireEvent.click(getByLabelText('Scroll to top'));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});