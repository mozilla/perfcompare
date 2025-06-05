import userEvent from '@testing-library/user-event';
import { Hooks } from 'taskcluster-client-web';

import { RetriggerButton } from '../../components/CompareResults/Retrigger/RetriggerButton';
import { loader } from '../../components/CompareResults/subtestsLoader';
import SubtestsResultsMain from '../../components/CompareResults/SubtestsResults/SubtestsResultsMain';
import { getLocationOrigin } from '../../utils/location';
import getTestData from '../utils/fixtures';
import {
  FetchMockSandbox,
  fireEvent,
  render,
  renderWithRouter,
  screen,
  within,
} from '../utils/test-utils';

jest.mock('../../utils/location');
const mockedGetLocationOrigin = getLocationOrigin as jest.Mock;
const result = getTestData().testCompareData[0];

const retriggerMultipleActionDefinition = {
  context: [],
  description: 'Create a clone of the task.',
  extra: {
    actionPerm: 'generic',
  },
  hookGroupId: 'project-gecko',
  hookId: 'in-tree-action-3-generic/f526da500b',
  hookPayload: {
    decision: {
      action: {
        cb_name: 'retrigger-multiple',
        description: 'Create a clone of the task.',
        name: 'retrigger-multiple',
        symbol: 'rt',
        taskGroupId: 'ZccXq7SFRLyRF7l6unyxkQ',
        title: 'Retrigger',
      },
      push: {
        base_revision: '51748d809eb5e6a7c86eeeb911f3b2b12324b1bf',
        owner: 'mozilla-taskcluster-maintenance@mozilla.com',
        pushlog_id: '42024',
        revision: 'ab17014f4b8f237c9d5fe7b88f8a89c49d0ffe7c',
      },
      repository: {
        level: '3',
        project: 'mozilla-central',
        url: 'https://hg.mozilla.org/mozilla-central',
      },
    },
    user: {
      input: {
        $eval: 'input',
      },
      taskGroupId: {
        $eval: 'taskGroupId',
      },
      taskId: {
        $eval: 'taskId',
      },
    },
  },
  kind: 'hook',
  name: 'retrigger-multiple',
  schema: {
    properties: {
      additionalProperties: false,
      requests: {
        items: {
          additionalProperties: false,
          tasks: {
            description: 'An array of task labels',
            items: {
              type: 'string',
            },
            type: 'array',
          },
          times: {
            description: 'How many times to run each task.',
            maximum: 100,
            minimum: 1,
            title: 'Times',
            type: 'integer',
          },
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  title: 'Retrigger',
};

const setUpUserCredentials = () => {
  sessionStorage.setItem('requestState', 'OkCrH5isZncYqeJbRDelN');
  sessionStorage.setItem(
    'taskclusterUrl',
    'https://firefox-ci-tc.services.mozilla.com',
  );
  window.localStorage.setItem(
    'userTokens',
    JSON.stringify({
      'https://firefox-ci-tc.services.mozilla.com': {
        access_token: 'RnVpOGJtdDZTb3FlWW5PVUxVclprQQ==',
        token_type: 'Bearer',
      },
    }),
  );
  window.localStorage.setItem(
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
  beforeEach(() => {
    mockedGetLocationOrigin.mockImplementation(() => 'http://localhost:3000');
  });

  it('should display Sign In modal when there are no credentials', async () => {
    render(<RetriggerButton result={result} variant='icon' />);

    const openModalButton = await screen.findByTitle('retrigger jobs');

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.click(openModalButton);

    const signInButton = await screen.findByText('Sign in');

    expect(signInButton).toBeInTheDocument();
  });

  it('should retrigger one job for base revision and one job for new revision', async () => {
    // fetch requests for base revision info
    (window.fetch as FetchMockSandbox)
      .get(
        'begin:https://treeherder.mozilla.org/api/project/mozilla-central/jobs/381594973/',
        {
          push_id: 1234567,
        },
      )
      .get(
        'begin:https://treeherder.mozilla.org/api/project/mozilla-central/push/decisiontask/?push_ids=1234567',
        {
          '1234567': { id: 'TeSt0FIBQyuzPDktQnTest', run: '0' },
        },
      )
      .get(
        'begin:https://firefox-ci-tc.services.mozilla.com/api/queue/v1/task/TeSt0FIBQyuzPDktQnTest/artifacts/public%2Factions.json',
        {
          actions: [{ ...retriggerMultipleActionDefinition }],
          variables: {},
        },
      )
      .get(
        'begin:https://firefoxci.taskcluster-artifacts.net/TeSt0FIBQyuzPDktQnTest/0/public/actions.json',
        {
          actions: [{ ...retriggerMultipleActionDefinition }],
          variables: {},
        },
      );
    // fetch requests for new revision info
    (window.fetch as FetchMockSandbox)
      .get(
        'begin:https://treeherder.mozilla.org/api/project/mozilla-central/jobs/381452501/',
        {
          push_id: 7891011,
        },
      )
      .get(
        'begin:https://treeherder.mozilla.org/api/project/mozilla-central/push/decisiontask/?push_ids=7891011',
        {
          '7891011': { id: 'TeStSeCoNDuzPDktwoTest', run: '0' },
        },
      )
      .get(
        'https://firefox-ci-tc.services.mozilla.com/api/queue/v1/task/TeStSeCoNDuzPDktwoTest/artifacts/public%2Factions.json',
        {
          actions: [{ ...retriggerMultipleActionDefinition }],
          variables: {},
        },
      )
      .get(
        'begin:https://firefoxci.taskcluster-artifacts.net/TeStSeCoNDuzPDktwoTest/0/public/actions.json',
        {
          actions: [{ ...retriggerMultipleActionDefinition }],
          variables: {},
        },
      );

    setUpUserCredentials();
    render(<RetriggerButton result={result} variant='icon' />);

    const openModalButton = await screen.findByRole('button', {
      name: 'retrigger jobs',
    });

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.click(openModalButton);

    // select option 1 for base
    const baseSelect = await screen.findByLabelText('Base');

    fireEvent.mouseDown(baseSelect);

    let listbox = within(await screen.findByRole('listbox'));
    fireEvent.click(await listbox.findByText('1'));

    // select option 1 for new
    const newSelect = await screen.findByLabelText('New');

    fireEvent.mouseDown(newSelect);

    listbox = within(await screen.findByRole('listbox'));
    fireEvent.click(await listbox.findByText('1'));

    const triggerJobsButton = await screen.findByRole('button', {
      name: 'Retrigger',
    });
    const MockedHooks = Hooks as jest.Mock;

    await user.click(triggerJobsButton);

    // Ideally we should use this when https://github.com/iamhosseindhv/notistack/pull/609
    // is merged and we update notistack.
    // const baseNotification = await screen.findByRole('alert', {
    //   description: /The retrigger request for the base run/,
    // });
    // const newNotification = await screen.findByRole('alert', {
    //   description: /The retrigger request for the new run/,
    // });
    // In the mean time we use this:
    const baseNotification = (
      await screen.findByText(/The retrigger request for the base run/)
    ).parentElement!;
    const newNotification = (
      await screen.findByText(/The retrigger request for the new run/)
    ).parentElement!;

    const baseButton: HTMLLinkElement = within(baseNotification).getByRole(
      'link',
      { name: /Open Treeherder/, hidden: true },
    );
    expect(baseButton.href).toBe(
      'https://treeherder.mozilla.org/jobs?repo=mozilla-central&revision=coconut',
    );
    const newButton: HTMLLinkElement = within(newNotification).getByRole(
      'link',
      { name: /Open Treeherder/, hidden: true },
    );
    expect(newButton.href).toBe(
      'https://treeherder.mozilla.org/jobs?repo=mozilla-central&revision=spam',
    );

    expect(baseNotification).toMatchSnapshot();
    expect(newNotification).toMatchSnapshot();

    expect(new MockedHooks().triggerHook).toHaveBeenCalled();
  });
});

describe('Retrigger in Subtests view', () => {
  it('displays retrigger button on Subtests view', async () => {
    const { subtestsResult } = getTestData();
    (window.fetch as FetchMockSandbox).get(
      'begin:https://treeherder.mozilla.org/api/perfcompare/results/?base_repository=mozilla-central&base_revision=d775409d7c6abb76362a3430e9880ec032ad4679&new_repository=mozilla-central&new_revision=22f4cf67e8ad76b5ab2a00b97837d1d920b8c2b7&framework=1&base_parent_signature=4769486&new_parent_signature=4769486',
      subtestsResult,
    );

    renderWithRouter(<SubtestsResultsMain view={'subtests-results'} />, {
      route: '/subtestsCompareWithBase',
      search:
        '?baseRev=d775409d7c6abb76362a3430e9880ec032ad4679&baseRepo=mozilla-central&newRev=22f4cf67e8ad76b5ab2a00b97837d1d920b8c2b7&newRepo=mozilla-central&framework=1&baseParentSignature=4769486&newParentSignature=4769486',
      loader,
    });

    const retriggerTestButton = await screen.findByText('Retrigger test');
    expect(retriggerTestButton).toBeInTheDocument();
  });
});
