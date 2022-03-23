import store from '../common/store'
import {
    fetchRecentRevisions,
    fetchRevisionByID,
    fetchRevisionByAuthor,
} from '../reducers/searchSlice'

export const handleChangeDropdown = (event) => {
    const repository = event.target.innerText
    const search = store.getState().search.searchValue

    // Update state with selected repository
    store.dispatch({ type: 'search/repositoryChanged', payload: repository })

    // If repository is selected after search value is input, fetch search results
    if (search !== '') {
        searchByRevisionOrEmail(repository, search)
    }

    // Fetch 10 most recent revisions when repository changes
    fetchRecentRevisions(repository)
}

export const handleChangeSearch = (event) => {
    const search = event.target.value
    const repository = store.getState().search.repository

    store.dispatch({ type: 'search/searchValueChanged', payload: search })

    // If search input is cleared, clear results
    if (search === '') store.dispatch({ type: 'search/searchResultsChanged', payload: [] })

    if (repository === '') {
        console.log('Please select a repository')
    } else {
        searchByRevisionOrEmail(repository, search)
    }
}

const searchByRevisionOrEmail = (repository, search) => {
    const emailMatch = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const longHashMatch = /[a-zA-Z0-9]{40}/

    if (emailMatch.test(search)) fetchRevisionByAuthor(repository, search)
    else if (longHashMatch.test(search)) fetchRevisionByID(repository, search)
}
