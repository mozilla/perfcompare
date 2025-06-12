// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import '@testing-library/jest-dom';
import { webcrypto } from 'node:crypto';

// The import of fetchMock also installs jest matchers as a side effect.
// See https://www.wheresrhys.co.uk/fetch-mock/ for more information about how
// to use this mock.
import fetchMock from '@fetch-mock/jest';
import { density1d } from 'fast-kde';
import { Bubble, Line } from 'react-chartjs-2';
import { Hooks } from 'taskcluster-client-web';

import { createStore } from '../../common/store';
import type { Store } from '../../common/store';

let store: Store;

// Fail to `import taskcluster-client-web`
// There is a bug filed for this issue in the Taskcluster project
// https://github.com/taskcluster/taskcluster/issues/7110
jest.mock('taskcluster-client-web', () => {
  return {
    Hooks: jest.fn(),
  };
});

const MockedHooks = Hooks as jest.Mock;

beforeEach(() => {
  const taskId = 'rEtrRigGERtaSkId';
  const triggerHook = jest.fn(() =>
    Promise.resolve({ taskId, status: { taskId } }),
  );
  // After every test jest resets the mock implementation, so we need to define
  // it again for each test.
  MockedHooks.mockImplementation(() => {
    return {
      triggerHook,
    };
  });
});

jest.mock('react-chartjs-2', () => ({
  Bubble: jest.fn(),
  Line: jest.fn(),
}));
const MockedBubble = Bubble as jest.Mock;
const MockedLine = Line as jest.Mock;

jest.mock('fast-kde', () => ({
  density1d: jest.fn(),
}));
const MockedDensity1d = density1d as jest.Mock;

Object.defineProperty(window, 'crypto', { value: webcrypto });

beforeEach(() => {
  // After every test jest resets the mock implementation, so we need to define
  // it again for each test.
  MockedBubble.mockImplementation(() => 'chartjs-bubble');
  MockedLine.mockImplementation(() => 'chartjs-line');
  MockedDensity1d.mockImplementation(() => 'fast-kde');
});

// Install the fetch mock globally
fetchMock.mockGlobal();

beforeEach(() => {
  jest.useFakeTimers({ now: new Date('Wed, 09 Oct 2024 12:45:17 GMT') });
  store = createStore();

  fetchMock.catch(404);
});

afterEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
  jest.clearAllTimers();
  jest.useRealTimers();

  // Also restore the fetch mock
  fetchMock.mockReset();
});

export { store };
