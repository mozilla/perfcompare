import { createAsyncThunk } from '@reduxjs/toolkit'

const TREEHERDER = 'https://treeherder.mozilla.org'

export const fetchRecentRevisions = createAsyncThunk(
    'search/fetchRecentRevisions',
    async (repository) => {
        const response = await fetch(TREEHERDER + '/api/project/' + repository + '/push/')
            .then((res) => res.json())
            .then((res) => {
                return res
            })
        return response.results
    }
)

export const fetchRevisionByID = createAsyncThunk(
    'search/fetchRevisionByID',
    async ({ repository, search }) => {
        const response = await fetch(
            TREEHERDER + '/api/project/' + repository + '/push/?revision=' + search
        )
            .then((res) => res.json())
            .then((res) => {
                return res
            })
        return response.results
    }
)

export const fetchRevisionsByAuthor = createAsyncThunk(
    'search/fetchRevisionsByAuthor',
    async ({ repository, search }) => {
        const response = await fetch(
            TREEHERDER + '/api/project/' + repository + '/push/?author=' + search
        )
            .then((res) => res.json())
            .then((res) => {
                return res
            })
        return response.results
    }
)
