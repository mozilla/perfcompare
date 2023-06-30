import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

import framework from '../reducers/FrameworkSlice';
import search from '../reducers/SearchSlice';
import selectedRevisions from '../reducers/SelectedRevisionsSlice';

const reducer = combineReducers({
  search,
  framework,
  selectedRevisions,
});

export const store = configureStore({
  reducer,
});

export const createStore = () => configureStore({ reducer });

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type Store = typeof store;
