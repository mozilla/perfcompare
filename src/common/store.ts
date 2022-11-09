import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

import checkedRevisions from '../reducers/CheckedRevisions';
import compareResults from '../reducers/CompareResultsSlice';
import filterCompareResults from '../reducers/FilterCompareResultsSlice';
import search from '../reducers/SearchSlice';
import selectedRevisions from '../reducers/SelectedRevisions';

const reducer = combineReducers({
  checkedRevisions,
  compareResults,
  search,
  selectedRevisions,
  filterCompareResults,
});

export const store = configureStore({
  reducer,
});

export const createStore = () => configureStore({ reducer });

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type Store = typeof store;
