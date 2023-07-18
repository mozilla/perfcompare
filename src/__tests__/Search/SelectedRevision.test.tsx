import { renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

import SearchView from '../../components/Search/SearchView';
import SelectedRevisions from '../../components/Search/SelectedRevisions';
import { updateCheckedRevisions } from '../../reducers/SearchSlice';
import useProtocolTheme from '../../theme/protocolTheme';
import { InputType } from '../../types/state';
import getTestData from '../utils/fixtures';
import { renderWithRouter, store } from '../utils/setupTests';
import { screen } from '../utils/test-utils';

const protocolTheme = renderHook(() => useProtocolTheme()).result.current
  .protocolTheme;
const toggleColorMode = renderHook(() => useProtocolTheme()).result.current
  .toggleColorMode;
const mode = 'light' as 'light' | 'dark';
const searchType = 'base' as InputType;

function renderComponent() {
  renderWithRouter(
    <SearchView
      toggleColorMode={toggleColorMode}
      protocolTheme={protocolTheme}
    />,
  );
  renderWithRouter(
    <SelectedRevisions
      view='search'
      mode={mode}
      searchType={searchType}
      isWarning={false}
    />,
  );
}

describe('SelectedRevision', () => {
  it('should show the selected revision once a result checkbox is clicked', async () => {
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

    expect(
      screen.getAllByTestId('checkbox-0')[0].classList.contains('Mui-checked'),
    ).toBe(true);

    expect(screen.getAllByTestId('selected-revs')[0]).toBeInTheDocument();
    expect(document.body).toMatchSnapshot();
    await act(async () => void jest.runOnlyPendingTimers());
  });

  it('should remove the selected revision once X button is clicked', async () => {
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
    const newChecked = testData.slice(0, 1);
    store.dispatch(updateCheckedRevisions({ newChecked, searchType }));
    const user = userEvent.setup({ delay: null });

    renderComponent();

    const removeButton = document.querySelectorAll(
      '[aria-label="close-button"]',
    );

    expect(screen.getAllByTestId('selected-rev-item')[0]).toBeInTheDocument();

    await user.click(removeButton[0]);

    expect(store.getState().search[searchType].checkedRevisions).toEqual([]);

    expect(screen.queryAllByTestId('selected-rev-item')[0]).toBeUndefined();
  });

  it('should show warning icon on selected try revision when try base is compared with a non try repository', async () => {
    const { testData } = getTestData();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          results: testData,
        }),
      }),
    ) as jest.Mock;
    jest.spyOn(global, 'fetch');
    const newChecked = testData.slice(0, 1);
    const user = userEvent.setup({ delay: null });

    renderComponent();

    const baseDropdown = screen.getAllByRole('button', { name: 'Base' })[0];
    await user.click(baseDropdown);
    expect(screen.getAllByText('try')[0]).toBeInTheDocument();
    const newDropdown = screen.getByTestId('dropdown-select-new');
    const searchInput = screen.getAllByPlaceholderText(
      'Search base by ID number or author email',
    )[0];
    await user.click(searchInput);
    await user.click(screen.getAllByTestId('checkbox-0')[0]);
    store.dispatch(updateCheckedRevisions({ newChecked, searchType }));

    await user.click(newDropdown);
    const mozRepoItem = screen.getAllByRole('option', {
      name: 'mozilla-central',
    })[0];

    expect(screen.getAllByText('mozilla-central')[0]).toBeInTheDocument();
    await user.click(mozRepoItem);
    const alertIcon = screen.getByTestId('WarningIcon');
    expect(alertIcon).toBeInTheDocument();
  });
});
