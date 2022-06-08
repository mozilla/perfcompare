// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import '@testing-library/jest-dom';

import { clearCheckedRevisions } from '../../reducers/CheckedRevisions';
import { resetState as resetSearchState } from '../../reducers/SearchSlice';
import { resetState as resetSelectedRevisionsState } from '../../reducers/SelectedRevisions';
import { store } from '../utils/test-utils';

const unmockedFetch = global.fetch;

beforeAll(() => {
  global.fetch = jest.fn();
});

afterAll(() => {
  global.fetch = unmockedFetch;
});

beforeEach(() => {
  store.dispatch(clearCheckedRevisions());
  store.dispatch(resetSearchState());
  store.dispatch(resetSelectedRevisionsState());
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});
