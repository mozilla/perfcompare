import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';

interface EditTitleInputProps {
  compact: boolean;
  value: string;
  onCancel: () => unknown;
  onChange: (titleText: string) => unknown;
  onSave: () => unknown;
}

function EditTitleInput({
  compact,
  value,
  onChange,
  onSave,
  onCancel,
}: EditTitleInputProps) {
  const size = compact ? 'small' : undefined;
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
    if (!value.trim()) {
      e.preventDefault();
      setTitleError(true);
      return;
    }
    e.preventDefault();
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
          sx={{ minWidth: '568px' }}
          onFocus={(e) => e.currentTarget.select()}
          placeholder={inputPlaceholder}
          inputProps={{
            'aria-label': inputPlaceholder,
          }}
          id='results-title-input'
          onChange={(e) => {
            setTitleError(false);
            onChange(e.target.value);
          }}
          size={size}
          className='edit-results-title-text-field'
          error={titleError}
          value={value}
          helperText={titleError ? titleErrorMsg : ''}
          FormHelperTextProps={{ sx: { padding: 0, margin: 0 } }}
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
