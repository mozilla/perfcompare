import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

import compareResults from '../reducers/CompareResults';
import comparison from '../reducers/ComparisonSlice';
import framework from '../reducers/FrameworkSlice';
import search from '../reducers/SearchSlice';
import selectedRevisions from '../reducers/SelectedRevisionsSlice';
import theme from '../reducers/ThemeSlice';

const reducer = combineReducers({
  theme,
  search,
  framework,
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
