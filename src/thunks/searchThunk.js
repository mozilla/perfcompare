import { createAsyncThunk } from '@reduxjs/toolkit'

const TREEHERDER = 'https://treeherder.mozilla.org'

export const fetchRecentRevisions = createAsyncThunk(
    'search/fetchRecentRevisions',
    async (repository) => {
        const response = await fetch(TREEHERDER + '/api/project/' + repository + '/push/')
        return response.data
    }
)

export const fetchRevisionByID = createAsyncThunk(
    'search/fetchRevisionByID',
    async (repository, revisionID) => {
        const response = await fetch(
            TREEHERDER + '/api/project/' + repository + '/push/?revision=' + revisionID
        )
        return response.data
    }
)

export const fetchRevisionsByAuthor = createAsyncThunk(
    'search/fetchRevisionsByAuthor',
    async (repository, author) => {
        const response = await fetch(
            TREEHERDER + '/api/project/' + repository + '/push/?author=' + author
        )
        return response.data
    }
)
