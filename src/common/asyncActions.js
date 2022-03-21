import store from './store'

const TREEHERDER = 'https://treeherder.mozilla.org'

export async function fetchRecentRevisions(repository) {
    fetch(TREEHERDER + '/api/project/' + repository + '/push/?full=true&count=10')
        .then((res) => res.json())
        .then((res) =>
            store.dispatch({ type: 'search/fetchRecentRevisions', payload: res.results })
        )
}

export function fetchRevisionByID(revisionID) {
    const repository = store.getState().search.repository
    fetch(TREEHERDER + '/api/project/' + repository + '/push/?revision=' + revisionID)
        .then((res) => res.json())
        .then((res) =>
            store.dispatch({ type: 'search/searchResultsChanged', payload: res.results })
        )
}

export function fetchRevisionByAuthor(author) {
    const repository = store.getState().search.repository
    fetch(TREEHERDER + '/api/project/' + repository + '/push/?author=' + author)
        .then((res) => res.json())
        .then((res) =>
            store.dispatch({ type: 'search/searchResultsChanged', payload: res.results })
        )
}
