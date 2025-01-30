import { useState } from 'react';

import { ContentCopy } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';

type CopyIconProps = {
  text: string;
  arialLabel: string;
};
const CopyIcon = ({ text, arialLabel }: CopyIconProps) => {
  const [copied, setCopied] = useState<boolean>(false);
  const handleClick = () => {
    const copyText = async () => {
      await navigator.clipboard.writeText(text);
    };
    try {
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (err) {
      console.error('Failed to copy text to clipboard:', err);
    }
    // To resolve this eslint error https://typescript-eslint.io/rules/no-misused-promises/#checksvoidreturn-1
    copyText().catch((error) =>
      console.error('Failed to copy text to clipboard:', error),
    );
  };
  return (
    <Box
      component='span'
      sx={{
        position: 'relative',
      }}
    >
      {copied && (
        <Typography
          sx={{
            fontSize: '0.75rem',
            position: 'absolute',
            top: '-1rem',
          }}
          variant='body2'
          color='text.primary'
          data-testid='copied-text'
        >
          Copied
        </Typography>
      )}
      <IconButton
        sx={{ padding: '4px' }}
        size='small'
        aria-label={arialLabel}
        onClick={handleClick}
        data-testid='copy-icon'
      >
        <ContentCopy fontSize='inherit' />
      </IconButton>
    </Box>
  );
};

export default CopyIcon;
