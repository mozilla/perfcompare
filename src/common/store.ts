import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

import compareResults from '../reducers/CompareResultsSlice';
import revisions from '../reducers/RevisionSlice';
import search from '../reducers/SearchSlice';

const reducer = combineReducers({
  compareResults,
  search,
  revisions,
});

export const store = configureStore({
  reducer,
});

export const createStore = () => configureStore({ reducer });

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type Store = typeof store;
