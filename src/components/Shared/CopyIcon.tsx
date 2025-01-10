import { useState } from 'react'

import { ContentCopy } from '@mui/icons-material';
import { Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';

type CopyIconProps = {
  text: string;
  arialLabel: string;
}
const CopyIcon = ({
  text,
  arialLabel,
}: CopyIconProps) => {
  const [copied, setCopied] = useState<boolean>(false);
  const handleClick = () => {
    navigator.clipboard.writeText(text)
    .then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1000); 
    })
    .catch((err) => {
      console.error('Failed to copy text to clipboard:', err);
    });
  };
  return (
    <>
      <IconButton size='small' aria-label={arialLabel} onClick={handleClick}>
        <ContentCopy fontSize='inherit' />
      </IconButton>
      {copied && (
        <Typography sx={{fontSize: '0.7rem'}} component='span' variant='body2' color='text.primary'>
          Copied
        </Typography>
      )}
    </>
  );
};

export default CopyIcon