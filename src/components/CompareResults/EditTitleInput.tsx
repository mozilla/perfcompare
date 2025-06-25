import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';

interface EditTitleInputProps {
  value: string;
  refInput: React.RefObject<HTMLInputElement | null>;
  onCancel: () => unknown;
  onChange: (titleText: string) => unknown;
  onSave: () => unknown;
}

function EditTitleInput({
  value,
  refInput,
  onChange,
  onSave,
  onCancel,
}: EditTitleInputProps) {
  const inputPlaceholder = 'Write a title for this comparison';
  const [titleError, setTitleError] = useState(false);
  const titleErrorMsg = 'Title cannot be empty';

  useEffect(() => {
    const handleEscKeypress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscKeypress);
    return () => {
      document.removeEventListener('keydown', handleEscKeypress);
    };
  }, [onCancel]);

  const onSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) {
      setTitleError(true);
      return;
    }
    onSave();
  };

  return (
    <form
      className='edit-title-form'
      aria-label='edit results table title'
      onSubmit={onSaveSubmit}
    >
      <FormControl
        fullWidth
        sx={{ flexDirection: 'row', width: 'auto' }}
        focused
      >
        <TextField
          inputRef={refInput}
          sx={{ minWidth: '568px' }}
          onFocus={(e) => e.currentTarget.select()}
          placeholder={inputPlaceholder}
          id='results-title-input'
          onChange={(e) => {
            setTitleError(false);
            onChange(e.target.value);
          }}
          size='small'
          className='edit-results-title-text-field'
          error={titleError}
          value={value}
          helperText={titleError ? titleErrorMsg : ''}
          slotProps={{
            htmlInput: {
              'aria-label': inputPlaceholder,
            },

            formHelperText: { sx: { padding: 0, margin: 0 } },
          }}
        />
        <Box
          className='edit-title-btns'
          sx={{ display: 'flex', justifyContent: 'flex-end', paddingLeft: 1 }}
        >
          <Button variant='text' onClick={onCancel}>
            Cancel
          </Button>
          <Button variant='text' type='submit'>
            Save
          </Button>
        </Box>
      </FormControl>
    </form>
  );
}

export default EditTitleInput;
