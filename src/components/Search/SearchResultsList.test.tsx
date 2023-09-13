import { renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

import getTestData from '../../__tests__/utils/fixtures';
import { renderWithRouter, store } from '../../__tests__/utils/setupTests';
import { screen } from '../../__tests__/utils/test-utils';
import { Strings } from '../../resources/Strings';
import useProtocolTheme from '../../theme/protocolTheme';
import { InputType } from '../../types/state';
import SearchView from '../Search/SearchView';

const searchType = 'base' as InputType;
const protocolTheme = renderHook(() => useProtocolTheme()).result.current
  .protocolTheme;
const toggleColorMode = renderHook(() => useProtocolTheme()).result.current
  .toggleColorMode;

function renderComponent() {
  renderWithRouter(
    <SearchView
      toggleColorMode={toggleColorMode}
      protocolTheme={protocolTheme}
      title={Strings.metaData.pageTitle.search}
    />,
  );
}

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

    renderComponent();
    // focus input to show results
    const searchInput = screen.getAllByRole('textbox')[0];
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

    renderComponent();
    // focus input to show results
    const searchInput = screen.getAllByRole('textbox')[0];
    await user.click(searchInput);

    const fleshWound = await screen.findAllByText("it's just a flesh wound");

    await user.click(fleshWound[0]);
    expect(
      screen.getAllByTestId('checkbox-1')[0].classList.contains('Mui-checked'),
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

    renderComponent();
    // focus input to show results

    const searchInput = screen.getAllByRole('textbox')[0];
    await user.click(searchInput);

    const fleshWound = await screen.findAllByText("it's just a flesh wound");

    await user.click(fleshWound[0]);
    act(() => {
      expect(store.getState().search[searchType].checkedRevisions[0]).toBe(
        testData[1],
      );
    });

    await user.click(fleshWound[0]);
    expect(fleshWound[0].classList.contains('Mui-checked')).toBe(false);
  });

  it('should not allow selecting more than 1 revisions on Base Search', async () => {
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

    renderComponent();
    // focus input to show results
    const searchInput = screen.getAllByRole('textbox')[0];
    await user.click(searchInput);

    await user.click(screen.getAllByTestId('checkbox-0')[0]);
    await user.click(screen.getAllByTestId('checkbox-1')[0]);

    expect(
      screen.getAllByTestId('checkbox-0')[0].classList.contains('Mui-checked'),
    ).toBe(true);
    expect(
      screen.getAllByTestId('checkbox-1')[0].classList.contains('Mui-checked'),
    ).toBe(false);

    expect(screen.getByText('Maximum 1 revision(s).')).toBeInTheDocument();

    // Should allow unchecking revisions even after four have been selected
    await user.click(screen.getAllByTestId('checkbox-1')[0]);
    expect(
      screen.getAllByTestId('checkbox-1')[0].classList.contains('Mui-checked'),
    ).toBe(false);
  });
});
