import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

import compareResults from '../reducers/CompareResultsSlice';
import comparison from '../reducers/ComparisonSlice';
import framework from '../reducers/FrameworkSlice';
import search from '../reducers/SearchSlice';
import selectedRevisions from '../reducers/SelectedRevisionsSlice';

const reducer = combineReducers({
  search,
  framework,
  selectedRevisions,
  compareResults,
  comparison,
});

export const createStore = () => configureStore({ reducer });
export const store = createStore();

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type Store = typeof store;
