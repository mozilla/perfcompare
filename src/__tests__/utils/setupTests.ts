// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import '@testing-library/jest-dom';
import React from 'react';

import { Bubble } from 'react-chartjs-2';

import { createStore } from '../../common/store';
import type { Store } from '../../common/store';
import {
  createRender,
  createRenderWithRouter,
  createStoreProvider,
} from './test-utils';
import type { Render, RenderWithRouter } from './test-utils';

const unmockedFetch = global.fetch;
let render: Render;
let renderWithRouter: RenderWithRouter;
let store: Store;
let StoreProvider: React.FC<{ children: JSX.Element }>;

jest.mock('react-chartjs-2', () => ({
  Bubble: jest.fn(),
}));

beforeEach(() => {
  // After every test jest resets the mock implementation, so we need to define
  // it again for each test.
  Bubble.mockImplementation(() => 'chartjs-bubble');
});

beforeAll(() => {
  global.fetch = jest.fn();
});

afterAll(() => {
  global.fetch = unmockedFetch;
});

beforeEach(() => {
  jest.useFakeTimers();
  store = createStore();
  render = createRender(store);
  renderWithRouter = createRenderWithRouter(store);
  StoreProvider = createStoreProvider(store);
});

afterEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

export { store, render, renderWithRouter, StoreProvider };
