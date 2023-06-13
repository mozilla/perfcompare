import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

import search from '../reducers/SearchSlice';

const reducer = combineReducers({
  search,
});

export const store = configureStore({
  reducer,
});

export const createStore = () => configureStore({ reducer });

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type Store = typeof store;
