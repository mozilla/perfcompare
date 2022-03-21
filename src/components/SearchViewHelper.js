import store from '../common/store'
import {
    fetchRecentRevisions,
    fetchRevisionByID,
    fetchRevisionByAuthor,
} from '../common/asyncActions'

export const handleChangeDropdown = (event) => {
    // Update state with selected repository
    store.dispatch({ type: 'search/repositoryChanged', payload: event.target.innerText })

    // If repository is selected after search value is input, fetch results
    let search = store.getState().search.searchValue
    if (search !== '') {
        searchByRevisionOrEmail(search)
    }

    // Fetch 10 most recent revisions when repository changes
    fetchRecentRevisions(event.target.innerText)
}

export const handleChangeSearch = (event) => {
    let search = event.target.value
    let repo = store.getState().search.repository
    store.dispatch({ type: 'search/searchValueChanged', payload: search })

    if (search === '') store.dispatch({ type: 'search/searchResultsChanged', payload: [] })

    if (repo === '') {
        console.log('Please select a repository')
    } else {
        searchByRevisionOrEmail(search)
    }
}

const searchByRevisionOrEmail = (search) => {
    const emailMatch = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const longHashMatch = /[a-zA-Z0-9]{40}/

    if (emailMatch.test(search)) fetchRevisionByAuthor(search)
    else if (longHashMatch.test(search)) fetchRevisionByID(search)
}
