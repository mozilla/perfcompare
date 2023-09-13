import { renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

import getTestData from '../../__tests__/utils/fixtures';
import { renderWithRouter, store } from '../../__tests__/utils/setupTests';
import { screen } from '../../__tests__/utils/test-utils';
import ResultsView from '../../components/CompareResults/ResultsView';
import { setSelectedRevisions } from '../../reducers/SelectedRevisionsSlice';
import { Strings } from '../../resources/Strings';
import useProtocolTheme from '../../theme/protocolTheme';
import { InputType, ThemeMode } from '../../types/state';
import SearchComponent from '../Search/SearchComponent';

const stringsBase = Strings.components.searchDefault.base.collapsed.base;

const protocolTheme = renderHook(() => useProtocolTheme()).result.current
  .protocolTheme;
const toggleColorMode = renderHook(() => useProtocolTheme()).result.current
  .toggleColorMode;

describe('Search View', () => {
  it('SEARCH: renders correctly when there are no results', async () => {
    const SearchPropsBase = {
      searchType: 'base' as InputType,
      mode: 'light' as ThemeMode,
      view: 'search' as 'search' | 'compare-results',
      isWarning: false,
      ...stringsBase,
    };
    renderWithRouter(<SearchComponent {...SearchPropsBase} />);

    expect(document.body).toMatchSnapshot();
    await act(async () => void jest.runOnlyPendingTimers());
  });

  it('RESULTS: shows dropdown and input when edit button in clicked', async () => {
    const user = userEvent.setup({ delay: null });
    const { testData } = getTestData();

    const selectedRevs = testData.slice(0, 2);

    await act(async () => {
      store.dispatch(setSelectedRevisions({ selectedRevisions: selectedRevs }));
    });

    const baseDropdown = document.querySelector(
      '.compare-results-base-dropdown',
    );

    expect(baseDropdown).not.toBeInTheDocument();

    renderWithRouter(
      <ResultsView
        toggleColorMode={toggleColorMode}
        protocolTheme={protocolTheme}
        title='Results'
      />,
    );

    const editButton = document.querySelector(
      '.edit-button-base',
    ) as HTMLElement;

    await user.click(editButton);

    expect(document.body).toMatchSnapshot();

    expect(screen.getByTestId('dropdown-select-base')).toBeInTheDocument();

    expect(screen.getAllByRole('textbox')[0]).toBeInTheDocument();

    const hiddenEditButton = document.querySelector('.hidden') as HTMLElement;

    expect(hiddenEditButton).toBeInTheDocument();

    await act(async () => void jest.runOnlyPendingTimers());
  });

  it('RESULTS: clicking the cancel button hides input and dropdown', async () => {
    const user = userEvent.setup({ delay: null });
    const { testData } = getTestData();

    const selectedRevs = testData.slice(0, 2);

    await act(async () => {
      store.dispatch(setSelectedRevisions({ selectedRevisions: selectedRevs }));
    });

    const baseDropdown = document.querySelector(
      '.compare-results-base-dropdown',
    );

    expect(baseDropdown).not.toBeInTheDocument();

    renderWithRouter(
      <ResultsView
        toggleColorMode={toggleColorMode}
        protocolTheme={protocolTheme}
        title='Results'
      />,
    );

    const editButton = document.querySelector(
      '.edit-button-base',
    ) as HTMLElement;

    await user.click(editButton);

    const cancelButton = document.querySelector(
      '.cancel-button',
    ) as HTMLElement;

    expect(document.body).toMatchSnapshot();

    expect(screen.getByTestId('dropdown-select-base')).toBeInTheDocument();

    expect(screen.getAllByRole('textbox')[0]).toBeInTheDocument();

    await user.click(cancelButton);

    expect(
      screen.queryByTestId('dropdown-select-base'),
    ).not.toBeInTheDocument();

    await act(async () => void jest.runOnlyPendingTimers());
  });

  it('RESULTS: clicking the save button hides input and dropdown', async () => {
    const user = userEvent.setup({ delay: null });
    const { testData } = getTestData();

    const selectedRevs = testData.slice(0, 2);

    await act(async () => {
      store.dispatch(setSelectedRevisions({ selectedRevisions: selectedRevs }));
    });

    const baseDropdown = document.querySelector(
      '.compare-results-base-dropdown',
    );

    expect(baseDropdown).not.toBeInTheDocument();

    renderWithRouter(
      <ResultsView
        toggleColorMode={toggleColorMode}
        protocolTheme={protocolTheme}
        title='Results'
      />,
    );

    const editButtonBase = document.querySelector(
      '.edit-button-base',
    ) as HTMLElement;

    await user.click(editButtonBase);

    const saveButtonBase = document.querySelector(
      '.save-button-base',
    ) as HTMLElement;

    expect(document.body).toMatchSnapshot();

    expect(screen.getByTestId('dropdown-select-base')).toBeInTheDocument();

    expect(screen.getAllByRole('textbox')[0]).toBeInTheDocument();

    await user.click(saveButtonBase);

    expect(
      screen.queryByTestId('dropdown-select-base'),
    ).not.toBeInTheDocument();

    //CHECK NEW SAVE BUTTON ACTION
    const editButtonNew = document.querySelector(
      '.edit-button-new',
    ) as HTMLElement;

    await user.click(editButtonNew);

    expect(screen.getByTestId('dropdown-select-new')).toBeInTheDocument();

    expect(screen.getAllByRole('textbox')[0]).toBeInTheDocument();

    const saveButtonNew = document.querySelector(
      '.save-button-new',
    ) as HTMLElement;

    await user.click(saveButtonNew);

    expect(screen.queryByTestId('dropdown-select-new')).not.toBeInTheDocument();

    await act(async () => void jest.runOnlyPendingTimers());
  });
});
