import { configureStore } from '@reduxjs/toolkit'
import searchReducer from '../reducers/searchSlice'
import thunk from 'redux-thunk'

export default configureStore({
    reducer: {
        search: searchReducer,
    },
})
