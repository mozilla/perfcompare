import React from 'react'

import CompareSearchDropdown from './CompareSearchDropdown'
import DropdownButton from './DropdownButton'

const apiURL = 'http://localhost:5000/api/project/try/push/'

const repoList = ['try', 'autoland', 'mozilla-central']
const dropdownText = 'repository'
const buttonID = 'select-repository'

class CompareSearch extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
          searchValue: '',
          results: [],
        };
    }

    getRevisionsByAuthor = (email) => {
        email = email.replace(/[@]/g, '%40');
        fetch(apiURL + '?format=json&author=' + email)
          .then((res) => res.json())
          .then(
            (res) => this.setState({ results: res.results }),
            (error) => {
              console.log(error)
            }
          )
    }

    getRevisionsByID = (revisionID) => {
        fetch(apiURL + '?format=json&revision=' + revisionID)
          .then((res) => res.json())
          .then(
            (res) => this.setState({ results: res.results }),
            (error) => {
              console.log(error)
            }
          )
    }
    
    handleSearchInput = (event) => {
        let search = event.target.value

        const emailMatch = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const shortHashMatch = /[a-zA-Z0-9]{12}/
        const longHashMatch = /[a-zA-Z0-9]{40}/
        if(emailMatch.test(search)) this.getRevisionsByAuthor(search)
        else if(shortHashMatch.test(search) || longHashMatch.test(search)) this.getRevisionsByID(search)
        // if email
        // search by author
        // if revision ID
        // search by revision


    }

    render() {
        console.log(this.state.results)
        return (
          <div className='mzp-c-form mzp-l-stretch'>
            <label className='mzp-c-field-label' htmlFor='revision-search-1'>
              {'Select a revision to compare:'}
            </label>
            <div className='input-group'>
              {/* dropdown to select repository to search */}
              <DropdownButton options={repoList} text={dropdownText} buttonID={buttonID} />

              {/* Search box */}
              <input
                id='revision-search-1'
                type='search'
                className='mzp-c-field-control'
                placeholder='Search by revision ID, author, or commit message'
                onChange={this.handleSearchInput}
              />
              {this.state.results.length > 0 && <CompareSearchDropdown data={this.state.results} />}
            </div>
          </div>
        )

    }

}

export default CompareSearch