import userEvent from '@testing-library/user-event';

import RetriggerButton from '../../components/CompareResults/Retrigger/RetriggerButton';
import { getLocationOrigin } from '../../utils/location';
import getTestData from '../utils/fixtures';
import {
  FetchMockSandbox,
  fireEvent,
  render,
  screen,
  within,
} from '../utils/test-utils';

jest.mock('../../utils/location');
const mockedGetLocationOrigin = getLocationOrigin as jest.Mock;
const result = getTestData().testCompareData[0];

const setUpUserCredentions = () => {
  mockedGetLocationOrigin.mockImplementation(() => 'http://localhost:3000');
  sessionStorage.setItem('requestState', 'OkCrH5isZncYqeJbRDelN');
  sessionStorage.setItem(
    'taskclusterUrl',
    'https://firefox-ci-tc.services.mozilla.com',
  );
  global.localStorage.setItem(
    'userTokens',
    JSON.stringify({
      'https://firefox-ci-tc.services.mozilla.com': {
        access_token: 'RnVpOGJtdDZTb3FlWW5PVUxVclprQQ==',
        token_type: 'Bearer',
      },
    }),
  );
  global.localStorage.setItem(
    'userCredentials',
    JSON.stringify({
      'https://firefox-ci-tc.services.mozilla.com': {
        expires: '2044-05-20T14:07:40.828Z',
        credentials: {
          clientId:
            'mozilla-auth0/ad|Mozilla-LDAP|ldapuser/perfcompare-localhost-3000-client-OCvzh5',
          accessToken: 'jQWJVQdeRceT-YymPwTWagPh2PwJr0RmmZyL1uAfMSWg',
        },
      },
    }),
  );
};

describe('Retrigger', () => {
  it('should display Sign In modal when there are no credentials', async () => {
    (window.fetch as FetchMockSandbox).get('begin:https://somethingurl', {
      ceva: 'response',
    });

    render(<RetriggerButton result={result} />);

    const openModalButton = await screen.findByTitle('retrigger jobs');

    const user = userEvent.setup({ delay: null });
    await user.click(openModalButton);

    const signInButton = await screen.findByText('Sign in');

    expect(signInButton).toBeInTheDocument();
  });

  it('should display Retrigger modal when there are credentials', async () => {
    setUpUserCredentions();
    render(<RetriggerButton result={result} />);

    const openModalButton = await screen.findByTitle('retrigger jobs');

    const user = userEvent.setup({ delay: null });
    await user.click(openModalButton);

    const retriggerButton = await screen.findByText('Retrigger');

    expect(retriggerButton).toBeInTheDocument();
  });

  it('should retrigger one job for base revision and one job for new revision', async () => {
    setUpUserCredentions();
    // fetch requests for base revision info
    (window.fetch as FetchMockSandbox).get(
      'begin:https://treeherder.mozilla.org/api/project/mozilla-central/jobs/381594973/',
      {
        push_id: 1234567,
      },
    );
    (window.fetch as FetchMockSandbox).get(
      'begin:https://treeherder.mozilla.org/api/project/mozilla-central/push/decisiontask/?push_ids=1234567',
      {
        '1234567': { id: 'TeSt0FIBQyuzPDktQnTest', run: '0' },
      },
    );
    (window.fetch as FetchMockSandbox).get(
      'begin:https://firefox-ci-tc.services.mozilla.com/api/queue/v1/task/TeSt0FIBQyuzPDktQnTest/artifacts/public%2Factions.json',
      {
        actions: [
          { hookPayload: {}, kind: 'hook', name: 'retrigger-multiple' },
        ],
        variables: {},
      },
    );
    (window.fetch as FetchMockSandbox).get(
      'begin:https://firefoxci.taskcluster-artifacts.net/TeSt0FIBQyuzPDktQnTest/0/public/actions.json',
      {
        actions: [
          { hookPayload: {}, kind: 'hook', name: 'retrigger-multiple' },
        ],
        variables: {},
      },
    );
    // fetch requests for new revision info
    (window.fetch as FetchMockSandbox).get(
      'begin:https://treeherder.mozilla.org/api/project/mozilla-central/jobs/381452501/',
      {
        push_id: 7891011,
      },
    );
    (window.fetch as FetchMockSandbox).get(
      'begin:https://treeherder.mozilla.org/api/project/mozilla-central/push/decisiontask/?push_ids=7891011',
      {
        '7891011': { id: 'TeStSeCoNDuzPDktwoTest', run: '0' },
      },
    );
    (window.fetch as FetchMockSandbox).get(
      'https://firefox-ci-tc.services.mozilla.com/api/queue/v1/task/TeStSeCoNDuzPDktwoTest/artifacts/public%2Factions.json',
      {
        actions: [
          { hookPayload: {}, kind: 'hook', name: 'retrigger-multiple' },
        ],
        variables: {},
      },
    );
    (window.fetch as FetchMockSandbox).get(
      'begin:https://firefoxci.taskcluster-artifacts.net/TeStSeCoNDuzPDktwoTest/0/public/actions.json',
      {
        actions: [
          { hookPayload: {}, kind: 'hook', name: 'retrigger-multiple' },
        ],
        variables: {},
      },
    );

    render(<RetriggerButton result={result} />);

    const openModalButton = await screen.findByTitle('retrigger jobs');

    const user = userEvent.setup({ delay: null });
    await user.click(openModalButton);

    // select option 1 for base
    const baseSelect = within(
      await screen.findByTestId('base-retrigger-select'),
    );

    let selectButton = await baseSelect.findByRole('button');

    fireEvent.mouseDown(selectButton);

    let listbox = within(await screen.findByRole('listbox'));
    fireEvent.click(await listbox.findByText('1'));

    // select option 1 for new
    const newSelect = within(await screen.findByTestId('new-retrigger-select'));

    selectButton = await newSelect.findByRole('button');

    fireEvent.mouseDown(selectButton);

    listbox = within(await screen.findByRole('listbox'));
    fireEvent.click(await listbox.findByText('1'));

    const triggerJobsButton = await screen.findByText('Retrigger');

    await user.click(triggerJobsButton);

    expect('something').toBe(null);
  });
});
