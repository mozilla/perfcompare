import { configureStore } from '@reduxjs/toolkit';

import comparison from '../reducers/ComparisonSlice';
import selectedRevisions from '../reducers/SelectedRevisionsSlice';
import theme from '../reducers/ThemeSlice';

export const createStore = () =>
  configureStore({
    reducer: {
      theme,
      selectedRevisions,
      comparison,
    },
  });

export const store = createStore();

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type Store = typeof store;
