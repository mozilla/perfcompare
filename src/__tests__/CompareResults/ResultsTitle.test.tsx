import { render, screen } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';

import { ResultsTitle } from '../../components/CompareResults/ResultsTitle';
import useRawSearchParams from '../../hooks/useRawSearchParams';

jest.mock('../../hooks/useRawSearchParams');

let user: UserEvent;

const setupTest = (initialParams = new URLSearchParams()) => {
  const updateSearchParams = jest.fn();
  (useRawSearchParams as jest.Mock).mockReturnValue([
    initialParams,
    updateSearchParams,
  ]);
  return { updateSearchParams };
};

describe('Results Title', () => {
  beforeEach(() => {
    user = userEvent.setup({ delay: null });
  });

  test.each([
    ['default title', new URLSearchParams(), 'Results'],
    ['custom title', new URLSearchParams('title=Custom+Title'), 'Custom Title'],
  ])('renders spaces correctly', (_, params, expected) => {
    setupTest(params);
    render(<ResultsTitle mode={'light'} />);
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it('enables editing when edit icon is clicked', async () => {
    setupTest();
    render(<ResultsTitle mode={'light'} />);

    const editIcon = screen.getByRole('button', { name: 'edit the title' });
    await user.click(editIcon);

    const inputField = screen.getByRole('textbox');
    expect(inputField).toBeInTheDocument();
    expect(inputField).toHaveValue('Results');
  });

  it('updates title and URL with new value', async () => {
    const { updateSearchParams } = setupTest();
    render(<ResultsTitle mode={'light'} />);

    await user.click(screen.getByRole('button', { name: 'edit the title' }));
    const inputField = screen.getByRole('textbox');

    await user.clear(inputField);
    await user.type(inputField, 'New Title');
    await user.keyboard('{Enter}');

    expect(screen.getByTestId('results-title-component')).toHaveTextContent(
      'NewTitle',
    );

    const updatedParams = updateSearchParams.mock
      .calls[0][0] as URLSearchParams;

    expect(updatedParams.get('title')).toBe('NewTitle');
    expect(updateSearchParams).toHaveBeenCalledWith(
      expect.any(URLSearchParams),
      { method: 'push' },
    );
  });

  it('reverts to original title on escape', async () => {
    setupTest(new URLSearchParams('title=Original+Title'));
    render(<ResultsTitle mode='light' />);

    await user.click(screen.getByRole('button', { name: 'edit the title' }));
    const inputField = screen.getByRole('textbox');

    await user.clear(inputField);
    await user.type(inputField, 'New Title');
    await user.keyboard('{Escape}');

    expect(screen.getByText('Original Title')).toBeInTheDocument();
  });
});
