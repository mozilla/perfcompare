import searchReducer from '../reducers/searchSlice'

test('should return the initial state', () => {
    expect(searchReducer(undefined, {})).toEqual({
        repository: '',
        results: [],
        recentRevisions: [],
        searchValue: '',
    })
})

test('should update search value', () => {
    const previousState = {}
    expect(
        searchReducer(previousState, {
            type: 'search/searchValueChanged',
            payload: 'spam@alot.com',
        })
    ).toEqual({ searchValue: 'spam@alot.com' })
})

test('should update recent revisions', () => {
    const previousState = { recentRevisions: ['0000000', '1111111', '3333333'] }
    expect(
        searchReducer(previousState, {
            type: 'search/fetchRecentRevisions',
            payload: ['3333333', '0000000', '1111111'],
        })
    ).toEqual({ recentRevisions: ['3333333', '0000000', '1111111'] })
})

test('should update repository', () => {
    const previousState = { repository: '' }
    expect(
        searchReducer(previousState, {
            type: 'search/repositoryChanged',
            payload: 'spamalot',
        })
    ).toEqual({ repository: 'spamalot' })
})

test('should update search results', () => {
    const previousState = {
        results: ["I've got a lovely bunch of coconuts", 'there they are all standing in a row'],
    }
    expect(
        searchReducer(previousState, {
            type: 'search/searchResultsChanged',
            payload: [
                'big ones, small ones, some as big as your head!',
                "Give 'em a twist, a flick of the wrist",
                "that's what the showman said",
            ],
        })
    ).toEqual({
        results: [
            'big ones, small ones, some as big as your head!',
            "Give 'em a twist, a flick of the wrist",
            "that's what the showman said",
        ],
    })
})
