import { renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

import ResultsView from '../../components/CompareResults/ResultsView';
import SearchComponent from '../../components/Search/SearchComponent';
import { setSelectedRevisions } from '../../reducers/SelectedRevisionsSlice';
import { Strings } from '../../resources/Strings';
import useProtocolTheme from '../../theme/protocolTheme';

import getTestData from '../utils/fixtures';
import { renderWithRouter, store } from '../utils/setupTests';
import { screen } from '../utils/test-utils';



const protocolTheme = renderHook(() => useProtocolTheme()).result.current
  .protocolTheme;
const toggleColorMode = renderHook(() => useProtocolTheme()).result.current
  .toggleColorMode;

describe('Search Component', () => {


  it('RESULTS: shows dropdown and input when edit button in clicked', async () => {
    renderWithRouter(
      <ResultsView
        toggleColorMode={toggleColorMode}
        protocolTheme={protocolTheme}
        title='Results'
      />,
    );

    const user = userEvent.setup({ delay: null });
    const { testData } = getTestData();
    const selectedRevs = testData.slice(0, 2);

    act(() => {
      store.dispatch(setSelectedRevisions({ selectedRevisions: selectedRevs }));
    });

    const baseDropdown = document.querySelector(
      '.compare-results-base-dropdown',
    );

    expect(baseDropdown).not.toBeInTheDocument();

    const editButton = document.querySelector(
      '.edit-button-base',
    ) as HTMLElement;

    await act(async () => {
      await user.click(editButton);
    });

    expect(document.body).toMatchSnapshot();
    expect(screen.getByTestId('dropdown-select-base')).toBeInTheDocument();
    expect(screen.getAllByRole('textbox')[0]).toBeInTheDocument();
    const hiddenEditButton = document.querySelector('.hidden') as HTMLElement;

    expect(hiddenEditButton).toBeInTheDocument();

    await act(async () => void jest.runOnlyPendingTimers());
  });

  it('RESULTS: clicking the cancel button hides input and dropdown', async () => {
    renderWithRouter(
      <ResultsView
        toggleColorMode={toggleColorMode}
        protocolTheme={protocolTheme}
        title='Results'
      />,
    );

    const user = userEvent.setup({ delay: null });
    const { testData } = getTestData();
    const selectedRevs = testData.slice(0, 2);

    act(() => {
      store.dispatch(setSelectedRevisions({ selectedRevisions: selectedRevs }));
    });

    const baseDropdown = document.querySelector(
      '.compare-results-base-dropdown',
    );
    expect(baseDropdown).not.toBeInTheDocument();
    const editButton = document.querySelector(
      '.edit-button-base',
    ) as HTMLElement;

    await act(async () => {
      await user.click(editButton);
    });

    const cancelButton = document.querySelector(
      '.cancel-button',
    ) as HTMLElement;

    expect(document.body).toMatchSnapshot();
    expect(screen.getByTestId('dropdown-select-base')).toBeInTheDocument();
    expect(screen.getAllByRole('textbox')[0]).toBeInTheDocument();

    await act(async () => {
      await user.click(cancelButton);
    });

    expect(
      screen.queryByTestId('dropdown-select-base'),
    ).not.toBeInTheDocument();

    await act(async () => void jest.runOnlyPendingTimers());
  });

  it('RESULTS: clicking the save button hides input and dropdown', async () => {
    renderWithRouter(
      <ResultsView
        toggleColorMode={toggleColorMode}
        protocolTheme={protocolTheme}
        title='Results'
      />,
    );

    const user = userEvent.setup({ delay: null });
    const { testData } = getTestData();
    const selectedRevs = testData.slice(0, 2);

    await act(async () => {
      store.dispatch(setSelectedRevisions({ selectedRevisions: selectedRevs }));
    });

    const baseDropdown = document.querySelector(
      '.compare-results-base-dropdown',
    );
    const editButtonBase = document.querySelector(
      '.edit-button-base',
    ) as HTMLElement;
    expect(baseDropdown).not.toBeInTheDocument();

    await act(async () => {
      await user.click(editButtonBase);
    });

    const saveButtonBase = document.querySelector(
      '.save-button-base',
    ) as HTMLElement;

    expect(document.body).toMatchSnapshot();
    expect(screen.getByTestId('dropdown-select-base')).toBeInTheDocument();
    expect(screen.getAllByRole('textbox')[0]).toBeInTheDocument();

    await act(async () => {
      await user.click(saveButtonBase);
    });

    expect(
      screen.queryByTestId('dropdown-select-base'),
    ).not.toBeInTheDocument();

    //CHECK NEW SAVE BUTTON ACTION
    const editButtonNew = document.querySelector(
      '.edit-button-new',
    ) as HTMLElement;

    await act(async () => {
      await user.click(editButtonNew);
    });

    expect(screen.getByTestId('dropdown-select-new')).toBeInTheDocument();
    expect(screen.getAllByRole('textbox')[0]).toBeInTheDocument();

    const saveButtonNew = document.querySelector(
      '.save-button-new',
    ) as HTMLElement;

    await act(async () => {
      await user.click(saveButtonNew);
    });

    expect(screen.queryByTestId('dropdown-select-new')).not.toBeInTheDocument();
    await act(async () => void jest.runOnlyPendingTimers());
  });
});
