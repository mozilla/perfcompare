import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

import search from '../reducers/SearchSlice';
import selectedRevisions from '../reducers/SelectedRevisions';

const reducer = combineReducers({
  search,
  selectedRevisions,
});

export default configureStore({
  reducer,
});
