import { Typography, Button } from '@mui/material';

function LearnMoreButton() {
  return (
    <Typography align='center'>
      <Button
        className="learn-button"
        variant="text"
        size='small'
        sx={
             {
                fontWeight: '700',
                fontSize: '0.75rem',
                color: 'black',
                backgroundColor: '#e5e5e5',
                px: '15px',
                mb: '30px',
              }
            }
      >
        Learn More
      </Button>
    </Typography>
  );
}

export default LearnMoreButton;