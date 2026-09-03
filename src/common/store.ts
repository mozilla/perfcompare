import { configureStore } from '@reduxjs/toolkit';

import columnPrefs from '../reducers/ColumnPrefsSlice';
import comparison from '../reducers/ComparisonSlice';
import selectedRevisions from '../reducers/SelectedRevisionsSlice';
import theme from '../reducers/ThemeSlice';

export const createStore = () =>
  configureStore({
    reducer: {
      theme,
      selectedRevisions,
      comparison,
      columnPrefs,
    },
  });

export const store = createStore();

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type Store = typeof store;
