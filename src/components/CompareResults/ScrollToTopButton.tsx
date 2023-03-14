import { useState, useEffect } from 'react';

import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import { IconButton, Tooltip } from '@mui/material';

const ScrollToTopButton = () => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > 300) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleButtonClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Tooltip title="Scroll to top">
        <IconButton
            sx={{
                display: showButton ? 'block' : 'none',
                position: 'fixed',
                bottom: '50px',
                right: '22px',
                width: '55px',
                height: '55px',
                borderRadius: '50%',
                bgcolor: '#0065FF',
                color: 'primary.contrastText',
                boxShadow: 4,
                '&:hover': {
                    bgcolor: '#1F3DB0',
                },
                '&:active': {
                    bgcolor: '#2D0F65',
                },
            }}
            onClick={handleButtonClick}
            aria-label="Scroll to top"
        >
            <KeyboardArrowUpRoundedIcon fontSize="large" />
        </IconButton>
    </Tooltip>
  );
};

export default ScrollToTopButton;
