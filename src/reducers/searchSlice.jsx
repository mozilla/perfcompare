import { createSlice } from '@reduxjs/toolkit'

import {
    fetchRecentRevisions,
    fetchRevisionByID,
    fetchRevisionsByAuthor,
} from '../thunks/searchThunk'

const searchSlice = createSlice({
    recentRevisions: [],
    repository: '',
    searchResults: [],
    searchValue: '',
    reducers: {
        searchValueChanged(state, action) {
            state.searchValue = action.payload
        },
        updateRepository(state, action) {
            state.repository = action.payload
        },
        updateSearchResults(state, action) {
            state.results = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRecentRevisions.fulfilled, (state, action) => {
                state.recentRevisions = action.payload
            })
            .addCase(fetchRevisionByID.fulfilled, (state, action) => {
                state.results = action.payload
            })
            .addCase(fetchRevisionsByAuthor.fulfilled, (state, action) => {
                state.results = action.payload
            })
    },
})

export const { searchValueChanged, repositoryChanged, searchResultsChanged } = searchSlice.actions
export default searchSlice.reducer
