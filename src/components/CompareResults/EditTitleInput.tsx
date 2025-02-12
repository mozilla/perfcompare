import { useEffect, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import { Form } from 'react-router-dom';

interface EditTitleInputProps {
  compact: boolean;
  value: string;
  handleToggle: () => unknown;
  onChange: (titleText: string) => unknown;
  onSave: () => unknown;
}

function EditTitleInput({
  compact,
  value,
  onChange,
  onSave,
  handleToggle,
}: EditTitleInputProps) {
  const size = compact ? 'small' : undefined;
  const inputPlaceholder = 'Write a title for this comparison';
  const [titleError, setTitleError] = useState(false);
  const titleErrorMsg = 'Title cannot be empty';

  const handleEscKeypress = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleToggle();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleEscKeypress);
    return () => {
      document.removeEventListener('keydown', handleEscKeypress);
    };
  }, [handleEscKeypress]);

  //Pr notes: added to better handle form submission and error
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
    //PR notes: changed to Form from react router dom to handle form submission and enter key
    <Form
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
          sx={{ minWidth: '568PX' }}
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
          <Button
            name='cancel-title'
            aria-label='cancel title'
            className='cancel-btn'
            variant='text'
            onClick={handleToggle}
          >
            Cancel
          </Button>
          <Button
            name='save-title'
            aria-label='save title'
            className='save-btn'
            variant='text'
            type='submit'
          >
            Save
          </Button>
        </Box>
      </FormControl>
    </Form>
  );
}

export default EditTitleInput;
