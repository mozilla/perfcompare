import * as React from 'react'
import { useState } from 'react'

import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import Container from '@mui/material/Container'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { repoList } from '../common/constants'

export default function SearchView() {
    const [repository, setRepository] = useState('')
    const handleChange = (event) => {
        setRepository(event.target.value)
    }

    return (
        <React.Fragment>
            <CssBaseline />
            <Container maxWidth='sm'>
                <Box sx={{ width: '100%', maxWidth: 500 }}>
                    <Typography variant='h1' component='div' gutterBottom>
                        PerfCompare
                    </Typography>
                </Box>
                <Box sx={{ width: '100%', maxWidth: 500 }}>
                    <InputLabel id='select-repo-label'>repo</InputLabel>
                    <Select
                        labelId='select-repo-label'
                        value={repository}
                        label='Repository'
                        size='small'
                        sx={{ width: '25%' }}
                        onChange={handleChange}
                    >
                        {repoList.length > 0 &&
                            repoList.map((item) => (
                                <MenuItem value={item} key={item}>
                                    {item}
                                </MenuItem>
                            ))}
                    </Select>
                    <TextField
                        label='Search For Revision'
                        variant='outlined'
                        size='small'
                        sx={{ width: '75%' }}
                    />
                </Box>
            </Container>
        </React.Fragment>
    )
}
