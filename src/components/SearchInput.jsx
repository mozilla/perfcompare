import { connect } from 'react-redux'

import Container from '@mui/material/Container'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'

import SearchResultsList from './SearchResultsList'

import { handleChangeDropdown, handleChangeSearch } from './SearchViewHelper'

function CompareSearch(props) {
    const { repository } = props
    const repoList = ['try', 'autoland', 'mozilla-central']

    return (
        <Container maxWidth='md'>
            <FormControl sx={{ width: '25%' }}>
                <InputLabel id='select-repository-label'>repository</InputLabel>
                <Select value={repository} labelId='select-repository-label' label='Repository'>
                    {repoList.length > 0 &&
                        repoList.map((item) => (
                            <MenuItem value={item} key={item} onClick={handleChangeDropdown}>
                                {item}
                            </MenuItem>
                        ))}
                </Select>
            </FormControl>
            <TextField
                label='Search By Revision ID or Author Email'
                variant='outlined'
                sx={{ width: '75%' }}
                onChange={handleChangeSearch}
            />
            <SearchResultsList />
        </Container>
    )
}

function mapStateToProps(state) {
    return { repository: state.search.repository, results: state.search.searchResults }
}

export default connect(mapStateToProps)(CompareSearch)
