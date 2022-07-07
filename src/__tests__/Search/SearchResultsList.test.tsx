import userEvent from '@testing-library/user-event';

import { maxRevisionsError } from '../../common/constants';
import SearchView from '../../components/Search/SearchView';
import getTestData from '../utils/fixtures';
import { renderWithRouter, store } from '../utils/setupTests';
import { screen } from '../utils/test-utils';

describe('SearchResultsList', () => {
  it('should match snapshot', async () => {
    const { testData } = getTestData();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          results: testData,
        }),
      }),
    ) as jest.Mock;
    jest.spyOn(global, 'fetch');
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    renderWithRouter(<SearchView />);
    // focus input to show results
    const searchInput = screen.getByRole('textbox');
    await user.click(searchInput);

    expect(document.body).toMatchSnapshot();
  });

  it('should fill the checkbox when a result is clicked', async () => {
    const { testData } = getTestData();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          results: testData,
        }),
      }),
    ) as jest.Mock;
    jest.spyOn(global, 'fetch');
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    renderWithRouter(<SearchView />);
    // focus input to show results
    const searchInput = screen.getByRole('textbox');
    await user.click(searchInput);

    const fleshWound = await screen.findByText(
      "spam - it's just a flesh wound",
    );

    await user.click(fleshWound);
    expect(
      screen.getByTestId('checkbox-1').classList.contains('Mui-checked'),
    ).toBe(true);
  });

  it('should clear the checkbox when a checked result is clicked', async () => {
    const { testData } = getTestData();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          results: testData,
        }),
      }),
    ) as jest.Mock;
    jest.spyOn(global, 'fetch');
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    renderWithRouter(<SearchView />);
    // focus input to show results
    const searchInput = screen.getByRole('textbox');
    await user.click(searchInput);

    const fleshWound = await screen.findByText(
      "spam - it's just a flesh wound",
    );

    await user.click(fleshWound);
    expect(store.getState().checkedRevisions.revisions[0]).toBe(1);
    await user.click(fleshWound);
    expect(
      screen.getByTestId('checkbox-1').classList.contains('Mui-checked'),
    ).toBe(false);
  });

  it('should not allow selecting more than four revisions', async () => {
    const { testData } = getTestData();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          results: testData,
        }),
      }),
    ) as jest.Mock;
    jest.spyOn(global, 'fetch');
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    renderWithRouter(<SearchView />);
    // focus input to show results
    const searchInput = screen.getByRole('textbox');
    await user.click(searchInput);

    await user.click(screen.getByTestId('checkbox-0'));
    await user.click(screen.getByTestId('checkbox-1'));
    await user.click(screen.getByTestId('checkbox-2'));
    await user.click(screen.getByTestId('checkbox-3'));
    await user.click(screen.getByTestId('checkbox-4'));

    expect(
      screen.getByTestId('checkbox-1').classList.contains('Mui-checked'),
    ).toBe(true);
    expect(
      screen.getByTestId('checkbox-4').classList.contains('Mui-checked'),
    ).toBe(false);

    expect(screen.getByText(maxRevisionsError)).toBeInTheDocument();

    // Should allow unchecking revisions even after four have been selected
    await user.click(screen.getByTestId('checkbox-1'));
    expect(
      screen.getByTestId('checkbox-1').classList.contains('Mui-checked'),
    ).toBe(false);
  });
});
