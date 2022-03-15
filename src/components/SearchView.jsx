import React from 'react'

import SearchDropdown from './SearchDropdown'
import DropdownButton from './DropdownButton'

import { apiBaseURL } from '../common/constants'
import store from '../common/store'

const dropdownText = 'repository'
const buttonID = 'select-repository'

class SearchView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            searchValue: '',
            results: [],
            dropdownToggled: false,
            dropdownSelected: false,
            dropdownText: dropdownText,
        }
    }

    getRevisionsByAuthor = (email) => {
        email = email.replace(/[@]/g, '%40')
        // update api url
        store.dispatch({ type: 'search/searchByAuthor', payload: email })
        if (store.getState().repository !== '') {
            fetch(store.getState().search.apiURL)
                .then((res) => res.json())
                .then(
                    (res) => this.setState({ results: res.results }),
                    (error) => {
                        console.log(error)
                    }
                )
        } else {
            console.log('please select a repository to search')
        }
    }

    getRevisionsByID = (revisionID) => {
        // update api url
        store.dispatch({ type: 'search/searchByRevision', payload: revisionID })
        if (store.getState().repository !== '') {
            fetch(store.getState().search.apiURL)
                .then((res) => res.json())
                .then(
                    (res) => this.setState({ results: res.results }),
                    (error) => {
                        console.log(error)
                    }
                )
        } else {
            console.log('please select a repository to search')
        }
    }

    handleSearchInput = (event) => {
        let search = event.target.value

        const emailMatch = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const shortHashMatch = /[a-zA-Z0-9]{12}/
        const longHashMatch = /[a-zA-Z0-9]{40}/
        if (emailMatch.test(search)) this.getRevisionsByAuthor(search)
        else if (shortHashMatch.test(search) || longHashMatch.test(search))
            this.getRevisionsByID(search)
    }

    toggleDropdown = () => {
        this.setState({ dropdownToggled: !this.state.dropdownToggled })
    }

    dropdownSelect = (event) => {
        this.setState({
            dropdownSelected: true,
            dropdownText: event.target.innerText,
            dropdownToggled: false,
        })
    }

    render() {
        return (
            <div className='mzp-l-content mzp-t-content-lg' data-testid='Compare'>
                <h1 className='mzp-c-section-heading mzp-has-zap-10'>
                    Perf<strong>Compare</strong>
                </h1>
                <div className='mzp-c-form mzp-l-stretch'>
                    <label className='mzp-c-field-label' htmlFor='revision-search-1'>
                        {'Select a revision to compare:'}
                    </label>
                    <div className='input-group'>
                        {/* dropdown to select repository to search */}
                        <DropdownButton text={dropdownText} buttonID={buttonID} />

                        {/* Search box */}
                        <input
                            id='revision-search-1'
                            type='search'
                            className='mzp-c-field-control'
                            placeholder='Search by revision ID, author, or commit message'
                            onChange={this.handleSearchInput}
                        />
                        {this.state.results && <SearchDropdown data={this.state.results} />}
                    </div>
                </div>
            </div>
        )
    }
}

export default SearchView
