import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

import compareResults from '../reducers/CompareResults';
import comparison from '../reducers/ComparisonSlice';
import searchCompareWithBase from '../reducers/SearchSlice';
import searchCompareOverTime from '../reducers/SearchSliceCompareOverTime';
import selectedRevisions from '../reducers/SelectedRevisionsSlice';

const reducer = combineReducers({
  searchCompareWithBase,
  searchCompareOverTime,
  selectedRevisions,
  compareResults,
  comparison,
});

export const store = configureStore({
  reducer,
});

export const createStore = () => configureStore({ reducer });

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type Store = typeof store;
