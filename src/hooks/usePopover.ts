import { useState } from 'react';

const usePopover = () => {
  const [anchorEl, setAnchorEl] = useState<React.RefObject<HTMLElement> | null>(
    null,
  );

  const handleClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    ref: React.RefObject<HTMLElement>,
  ) => {
    console.log(ref);
    // setAnchorEl(ref);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return { anchorEl, handleClick, handleClose, open };
};

export default usePopover;
