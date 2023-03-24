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
                px: 3,
                mb: 15,
              }
            }
      >
        Learn More
      </Button>
    </Typography>
  );
}

export default LearnMoreButton;