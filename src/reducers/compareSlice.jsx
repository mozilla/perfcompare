import { createSlice } from '@reduxjs/toolkit'

const initialState = [
    { id: 1, revisionID: null, author: '', commitMessage: '', date: null, selected: false },
    { id: 2, revisionID: null, author: '', commitMessage: '', date: null, selected: false },
    { id: 3, revisionID: null, author: '', commitMessage: '', date: null, selected: false },
    { id: 4, revisionID: null, author: '', commitMessage: '', date: null, selected: false },
]

export const compareSlice = createSlice({
    name: 'compare',
    initialState,
    reducers: {},
})
