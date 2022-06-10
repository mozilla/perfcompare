import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

import checkedRevisions from '../reducers/CheckedRevisions';
import search from '../reducers/SearchSlice';
import selectedRevisions from '../reducers/SelectedRevisions';

const reducer = combineReducers({
  search,
  checkedRevisions,
  selectedRevisions,
});

export const store = configureStore({
  reducer,
});

export const createStore = () => configureStore({ reducer });

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type Store = typeof store;
