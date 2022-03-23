import React from 'react'
import { connect } from 'react-redux'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'

function SearchResultsList(props) {
    const { searchResults } = props
    return (
        <React.Fragment>
            {searchResults.length > 0 && (
                <Grid container>
                    <Grid item xs={3}></Grid>
                    <Grid item xs={9}>
                        <Box
                            sx={{
                                maxWidth: '100%',
                                bgcolor: 'background.paper',
                                border: 1,
                                borderColor: 'grey.500',
                                borderRadius: '4px',
                                '&:focus': {
                                    borderColor: 'primary.main',
                                },
                                '&:hover': {
                                    borderColor: 'text.primary',
                                },
                            }}
                            alignItems='flex-end'
                        >
                            <List>
                                {searchResults &&
                                    searchResults.map((item, i) => (
                                        <ListItemButton key={item.id}>
                                            <ListItem disablePadding>
                                                <ListItemText primary={item.revision} />
                                            </ListItem>
                                        </ListItemButton>
                                    ))}
                            </List>
                        </Box>
                    </Grid>
                </Grid>
            )}
        </React.Fragment>
    )
}

function mapStateToProps(state) {
    return { searchResults: state.search.searchResults }
}

export default connect(mapStateToProps)(SearchResultsList)
