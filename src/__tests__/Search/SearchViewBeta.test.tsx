import { renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

import SearchViewBeta from '../../components/Search/beta/SearchView';
import useProtocolTheme from '../../theme/protocolTheme';
import { Revision } from '../../types/state';
import getTestData from '../utils/fixtures';
import { renderWithRouter, store } from '../utils/setupTests';
import { screen } from '../utils/test-utils';

const protocolTheme = renderHook(() => useProtocolTheme()).result.current
.protocolTheme;

const toggleColorMode = renderHook(() => useProtocolTheme()).result.current
.toggleColorMode;
function renderComponent() {

  
  renderWithRouter(
    <SearchViewBeta
      toggleColorMode={toggleColorMode}
      protocolTheme={protocolTheme}
    />,
  );
}


function fetchTestData(data: Revision[]) {
  
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => ({
        results: data,
      }),
    }),
  ) as jest.Mock;
  jest.spyOn(global, 'fetch');
}

describe('Search View', () => {


  it('renders correctly when there are no results', async () => {
renderComponent();

    // We have to account for the dropdown position
    //Shift focus to base search

    expect(document.body).toMatchSnapshot();
    await act(async () => void jest.runOnlyPendingTimers());
  });


});

describe('Search Container', ()=> {


it('renders compare with base', async ()=> {
  renderComponent();

  const title = screen.getByText('Compare with a base');
  const baseInput = screen.getByPlaceholderText('Search base by ID number or author email');
  const repoDropdown = screen.getByTestId('dropdown-select');

  expect(title).toBeInTheDocument(); 
  expect(baseInput).toBeInTheDocument(); 
  expect(repoDropdown).toBeInTheDocument();
  screen.debug();
});
});

describe('Base Search', ()=> {
it('renders repository dropdown in closed condition', async ()=> {

  renderComponent();
  // 'try' is selected by default and dropdown is not visible
      expect(screen.queryByText(/try/i)).toBeInTheDocument();
      expect(screen.queryByText(/autoland/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/mozilla-central/i)).not.toBeInTheDocument();

          // Search input appears
    expect(
      screen.getByPlaceholderText(/Search base by ID number or author email/i),
    ).toBeInTheDocument();

    // No list items should appear
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();

    await act(async () => void jest.runOnlyPendingTimers());
});


it('should hide search results when clicking outside of search input', async ()=>{
  const { testData } = getTestData();
    fetchTestData(testData);
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });
    renderComponent();

    //Click inside the input box to show search results.

    const searchInput = screen.getByRole('textbox');
    await user.click(searchInput);

    expect(store.getState().search.searchResults).toStrictEqual(testData);
   
    const comment = await screen.findAllByText("you've got no arms left!");
    expect(comment[0]).toBeInTheDocument();

    //Click outside the input box to hide search results.

    const label = screen.getByLabelText('Base');
    await user.click(label);
    expect(comment[0]).not.toBeInTheDocument();



});

it('Should hide the search results when Escape key is pressed', async ()=>{
  const { testData } = getTestData();
 fetchTestData(testData);
  // set delay to null to prevent test time-out due to useFakeTimers
  const user = userEvent.setup({ delay: null });
  renderComponent();

   //Click inside the input box to show search results.

   const searchInput = screen.getByRole('textbox');
   await user.click(searchInput);

   expect(store.getState().search.searchResults).toStrictEqual(testData);

   const comment = await screen.findAllByText("you've got no arms left!");
   expect(comment[0]).toBeInTheDocument();

   //Press Escape key to hide search results.

   await user.keyboard('{Escape}');
   expect(comment[0]).not.toBeInTheDocument();

});

it('Should not call fetch if search value is not a hash or email', async ()=>{
  const spyOnFetch = jest.spyOn(global, 'fetch');
  // set delay to null to prevent test time-out due to useFakeTimers
  const user = userEvent.setup({ delay: null });
  renderComponent();

  const searchInput = screen.getByRole('textbox');

  await user.type(searchInput, 'coconut');
  await user.clear(searchInput);

  await user.type(searchInput, 'spam@eggs');
  await user.clear(searchInput);
  await user.type(searchInput, 'spamspamspamand@eggs.');
  await user.clear(searchInput);
  await user.type(searchInput, 'iamalmostlongenoughtobeahashbutnotquite');

  await screen.findByText(
    'Search must be a 12- or 40-character hash, or email address',
  );

  // fetch should only be called on initial load
  expect(spyOnFetch).toHaveBeenCalledTimes(1);
});


it('Should clear search results if the search value is cleared', async ()=>{
  const { testData } = getTestData();
 fetchTestData(testData);
  // set delay to null to prevent test time-out due to useFakeTimers
  const user = userEvent.setup({ delay: null });
  renderComponent();

  // await screen.findByRole('button', { name: 'repository' })

  const searchInput = screen.getByRole('textbox');
  await user.type(searchInput, 'terryjones@python.com');
  jest.runOnlyPendingTimers();
  const spyOnFetch = jest.spyOn(global, 'fetch');

  expect(spyOnFetch).toHaveBeenCalledWith(
    'https://treeherder.mozilla.org/api/project/try/push/?author=terryjones@python.com',
  );

  await screen.findAllByText("you've got no arms left!");
  expect(store.getState().search.searchResults).toStrictEqual(testData);
  await user.clear(searchInput);
  expect(store.getState().search.searchResults).toStrictEqual([]);
  expect(
    screen.queryByText("you've got no arms left!"),
  ).not.toBeInTheDocument();
});


it('should not hide search results when clicking search results', async ()=>{
  const { testData } = getTestData();
 fetchTestData(testData);
  // set delay to null to prevent test time-out due to useFakeTimers
  const user = userEvent.setup({ delay: null });
  renderComponent();

   // focus input to show results
   const searchInput = screen.getByRole('textbox');
   await user.click(searchInput);

   await screen.findAllByText("you've got no arms left!");
   expect(
     screen.getAllByText("it's just a flesh wound")[0],
   ).toBeInTheDocument();
   await user.click(screen.getAllByText("you've got no arms left!")[0]);
   await user.click(screen.getAllByTestId('CheckBoxOutlineBlankIcon')[0]);

   expect(
     screen.queryAllByText("you've got no arms left!")[0],
   ).toBeInTheDocument();
   expect(
     screen.queryAllByText("it's just a flesh wound")[0],
   ).toBeInTheDocument();


});

it('should update error state with generic message if fetch error is undefined', async () => {
  global.fetch = jest.fn(() => Promise.reject(new Error())) as jest.Mock;
  const spyOnFetch = jest.spyOn(global, 'fetch');
  renderComponent();

  await act(async () => void jest.runOnlyPendingTimers());

  expect(spyOnFetch).toHaveBeenCalledWith(
    'https://treeherder.mozilla.org/api/project/try/push/?hide_reviewbot_pushes=true',
  );
  expect(store.getState().search.searchResults).toStrictEqual([]);
  expect(store.getState().search.inputError).toBe(true);
  expect(store.getState().search.inputHelperText).toBe(
    'An error has occurred',
  );
});


it('disable adding more than one revision for the base search', async ()=>{
  const { testData } = getTestData();
 fetchTestData(testData);
  // set delay to null to prevent test time-out due to useFakeTimers
  const user = userEvent.setup({ delay: null });
  renderComponent();

   // focus input to show results
   const searchInput = screen.getByRole('textbox');
   await user.click(searchInput);

   await screen.findAllByText("you've got no arms left!");
   expect(
     screen.getAllByText("it's just a flesh wound")[0],
   ).toBeInTheDocument();
   await user.click(screen.getAllByText("you've got no arms left!")[0]);
   await user.click(screen.getAllByText("it's just a flesh wound")[0]);

  const error = screen.getByText(/maximum 1 revision\(s\)\./i);

   expect(error).toBeInTheDocument();
   expect(
     screen.queryAllByText("you've got no arms left!")[0],
   ).toBeInTheDocument();
   expect(
     screen.queryAllByText("it's just a flesh wound")[0],
   ).toBeInTheDocument();


});
});