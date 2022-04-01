import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

import search from '../reducers/SearchSlice';

const reducer = combineReducers({
  search,
});

export default configureStore({
  reducer,
});
