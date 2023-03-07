import { useState } from 'react';

import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';

import { Revision } from '../../types/state';
import RevisionSearch from '../Shared/RevisionSearch';

function EditRevisionButton(props: EditRevisionButtonProps) {
  const { index, item } = props;
  const [popoverIsOpen, setPopoverIsOpen] = useState(false);
  const anchorEl = document.getElementById(item.revision);

  const handleClick = () => {
    setPopoverIsOpen(true);
  };

  return (
    <>
      <IconButton
        id={`edit-revision-button-${index}`}
        aria-label={`edit-revision-${item.id}`}
        onClick={() => handleClick()}
      >
        <EditIcon />
      </IconButton>

      <Popover
        className="edit-revision-popover"
        open={popoverIsOpen}
        anchorEl={anchorEl}
        onClose={() => setPopoverIsOpen(false)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        PaperProps={{ style: { maxWidth: '1245px' } }}
      >
        <RevisionSearch
          view="compare-results"
          prevRevision={item}
          setPopoverIsOpen={setPopoverIsOpen}
        />
      </Popover>
    </>
  );
}

interface EditRevisionButtonProps {
  index: number;
  item: Revision;
}

export default EditRevisionButton;
