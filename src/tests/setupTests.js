// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import '@testing-library/jest-dom';

import store from '../common/store';
import {
  updateErrorMessage,
  updateRepository,
  updateSearchResults,
  updateSearchValue,
} from '../reducers/SearchSlice';
import { act } from './utils/test-utils';

const unmockedFetch = global.fetch;

beforeAll(() => {
  global.fetch = jest.fn();
});

afterAll(() => {
  global.fetch = unmockedFetch;
});

beforeEach(() => {
  act(() => {
    store.dispatch(updateErrorMessage(null));
    store.dispatch(updateSearchValue(''));
    store.dispatch(updateSearchResults([]));
    store.dispatch(updateRepository(''));
  });
});

afterEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
});
