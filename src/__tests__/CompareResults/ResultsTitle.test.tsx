import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ResultsTitle } from '../../components/CompareResults/ResultsTitle';
import useRawSearchParams from '../../hooks/useRawSearchParams';

jest.mock('../../hooks/useRawSearchParams');

describe('Results Title', () => {
  it('renders "Results" by default when no title in URL', () => {
    (useRawSearchParams as jest.Mock).mockReturnValue([
      new URLSearchParams(),
      jest.fn(),
    ]);

    render(<ResultsTitle />);
    expect(screen.getByText('Results')).toBeInTheDocument();
  });

  it('renders title from URL when present', () => {
    const urlParams = new URLSearchParams('title=Custom+Title');
    (useRawSearchParams as jest.Mock).mockReturnValue([urlParams, jest.fn()]);

    render(<ResultsTitle />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  //   it('changes text to editable input when edit icon is clicked', async () => {
  //     (useRawSearchParams as jest.Mock).mockReturnValue([
  //       new URLSearchParams(),
  //       jest.fn(),
  //     ]);
  //     render(<ResultsTitle />);

  //     expect(screen.getByText('Results')).toBeInTheDocument();
  //     expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

  //     const editIcon = screen.getByTestId('edit-icon');
  //     await userEvent.click(editIcon);

  //     const inputField = screen.getByRole('textbox');
  //     expect(inputField).toBeInTheDocument();
  //     expect(inputField).toHaveValue('Results');

  //     expect(screen.queryByTestId('results-title-label')).not.toBeVisible();
  //   });

  //   it('updates title and URL when user inputs a new value', async () => {
  //     const updateSearchParams = jest.fn();
  //     (useRawSearchParams as jest.Mock).mockReturnValue([
  //       new URLSearchParams(),
  //       updateSearchParams,
  //     ]);

  //     render(<ResultsTitle />);

  //     const editIcon = screen.getByTestId('edit-icon');
  //     await userEvent.click(editIcon);

  //     const inputField = screen.getByRole('textbox');
  //     await userEvent.clear(inputField);
  //     await userEvent.type(inputField, 'New Title');
  //     await userEvent.keyboard('{Enter}');

  //     expect(screen.getByText('New Title')).toBeInTheDocument();

  //     expect(updateSearchParams).toHaveBeenCalledWith(
  //       expect.objectContaining({
  //         toString: expect.any(Function),
  //       }),
  //       { method: 'push' },
  //     );

  //     const updatedParams = updateSearchParams.mock
  //       .calls[0][0] as URLSearchParams;
  //     expect(updatedParams.get('title')).toBe('New Title');
  //   });
});
