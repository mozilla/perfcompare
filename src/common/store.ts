import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

import comparison from '../reducers/ComparisonSlice';
import framework from '../reducers/FrameworkSlice';
import selectedRevisions from '../reducers/SelectedRevisionsSlice';
import theme from '../reducers/ThemeSlice';

const reducer = combineReducers({
  theme,
  framework,
  selectedRevisions,
  comparison,
});

export const store = configureStore({
  reducer,
});

export const createStore = () => configureStore({ reducer });

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type Store = typeof store;
