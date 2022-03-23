import { configureStore } from '@reduxjs/toolkit'
import { combineReducers } from 'redux'

import search from '../reducers/searchSlice'

const reducer = combineReducers({
    search,
})

export default configureStore({
    reducer,
})
