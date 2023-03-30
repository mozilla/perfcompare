import Box from '@mui/material/Box';
import  Container  from '@mui/material/Container';

/* 
  TODO: Remove substitute component and replace with a final component,
        which will be based on the work on Search View.
*/

function InputsReplacement() {
  return (
        <Container data-testid={'inputs-replacement'}>
        <Box
          sx={{
            width: 700,
            height: 400,
            boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          Replacement for &quot;Compare with a base&quot; / &quot;Compare over time&quot; components.
          </Box>
        </Container>
  );
}

export default InputsReplacement;
