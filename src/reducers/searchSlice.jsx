import { createSlice } from '@reduxjs/toolkit'

import { apiBaseURL } from '../common/constants'

const initialState = {
    repository: '',
    apiURL: apiBaseURL,
    searchValue: '',
    results: [],
}

export default function searchReducer(state = initialState, action) {
    switch (action.type) {
        case 'search/repositoryChanged': {
            return {
                ...state,
                repository: action.payload,
                apiURL: state.apiURL + action.payload + '/',
            }
        }
        case 'search/searchByRevision': {
            return {
                ...state,
                apiURL:
                    apiBaseURL + state.repository + '/push/?format=json&revision=' + action.payload,
            }
        }
        case 'search/searchByAuthor': {
            return {
                ...state,
                apiURL:
                    apiBaseURL + state.repository + '/push/?format=json&author=' + action.payload,
            }
        }
        default:
            return state
    }
}
