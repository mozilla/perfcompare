import { createSlice } from '@reduxjs/toolkit'

import {
    fetchRecentRevisions,
    fetchRevisionByID,
    fetchRevisionsByAuthor,
} from '../thunks/searchThunk'

const initialState = {
    recentRevisions: [],
    repository: '',
    searchResults: [],
    searchValue: '',
}

const search = createSlice({
    name: 'search',
    initialState,
    reducers: {
        updateSearchValue(state, action) {
            state.searchValue = action.payload
        },
        updateSearchResults(state, action) {
            state.searchResults = action.payload
        },
        updateRepository(state, action) {
            state.repository = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRecentRevisions.fulfilled, (state, action) => {
                state.recentRevisions = action.payload
            })
            .addCase(fetchRevisionByID.fulfilled, (state, action) => {
                state.searchResults = action.payload
            })
            .addCase(fetchRevisionsByAuthor.fulfilled, (state, action) => {
                state.searchResults = action.payload
            })
    },
})

export const { updateSearchValue, updateSearchResults, updateRepository } = search.actions
export default search.reducer
