import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

import comparison from '../reducers/ComparisonSlice';
import selectedRevisions from '../reducers/SelectedRevisionsSlice';
import theme from '../reducers/ThemeSlice';

const reducer = combineReducers({
  theme,
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
