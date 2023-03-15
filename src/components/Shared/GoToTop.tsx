import { useEffect, useState } from 'react';

import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';


const ButtonToTop = styled(Button)({
    fontSize: '3rem',
    scale: '60%',
    height: '4rem',
    width: '4rem',
    color: '#fff',
    backgroundColor: '#0065FF',
    boxShadow: '5px 10px',
    borderRadius: '50%',
    position: 'fixed',
    bottom: '0%',
    right: '2%',
    zIndex: '999',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: '#1F3DB0',
      boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.3)',  
    },

    '&:active': {
      backgroundColor: '#2D0F65',
      boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.3)', 
    },

    '& .topBtn--icon': {
      animation: 'gototop 1.2s linear infinite alternate-reverse',
    },
    '@keyframes gototop': {
      '0%': {
        transform: 'translateY(-0.5rem)',
      },
      '100%': {
        transform: 'translateY(1rem)',

      },
    },
    '@media (max-width: 500px)': {
        left: '50%',
        transform: 'translateX(-50%)',
    },
  },

);

const StyledDiv = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
});

type MyComponentProps = {
  visible: boolean;
};

function GoToTop(props: MyComponentProps = { visible: false }) {

  const [isVisible, setIsVisible] = useState( props.visible || false);
  const [isClicked, setIsClicked] = useState( false);

  

      const btnHandler = () => {

        setIsClicked(true);
          window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      };

      const listenToScroll = () => {
        const heightToHidden = 20;
        const winScroll =
          document.body.scrollTop || document.documentElement.scrollTop;
    
        if (winScroll > heightToHidden) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
          setIsClicked(false);
        }
      };

      useEffect(() => {
        window.addEventListener('scroll', listenToScroll);
        return () => window.removeEventListener('scroll', listenToScroll);
      }, []);
    return (

<StyledDiv>
        {isVisible && !isClicked && (
          <Tooltip title="Scroll To Top" placement="top">
      <ButtonToTop
      data-testid = 'scroll-to-top'
      aria-label = 'scroll-to-top'
      className='topBtn' onClick={btnHandler}>
        <ArrowUpwardIcon className="topBtn--icon"/>
        </ButtonToTop>
        </Tooltip>

         )}
      </StyledDiv>

    );
  }

  GoToTop.defaultProps = {
    visible: false,
  };


export default GoToTop;



