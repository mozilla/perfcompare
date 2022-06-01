import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

import alert from '../reducers/AlertSlice';
import search from '../reducers/SearchSlice';
import selectedRevisions from '../reducers/SelectedRevisions';

const reducer = combineReducers({
  alert,
  search,
  selectedRevisions,
});

export const store = configureStore({
  reducer,
});

export type AppDispatch = typeof store.dispatch;
