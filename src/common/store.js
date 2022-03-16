import { configureStore } from '@reduxjs/toolkit'
import searchReducer from '../reducers/searchSlice'

export default configureStore({
    reducer: {
        search: searchReducer,
    },
})
