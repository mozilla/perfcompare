import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';

interface EditTitleInputProps {
  compact: boolean;
  onChange: (titleText: string) => unknown;
}

function EditTitleInput({ compact, onChange }: EditTitleInputProps) {
  const size = compact ? 'small' : undefined;
  const inputPlaceholder = 'Write a title for this comparison';

  return (
    <FormControl fullWidth sx={{ paddingRight: 1 }}>
      <TextField
        fullWidth
        placeholder={inputPlaceholder}
        inputProps={{ 'aria-label': inputPlaceholder }}
        id='results-title-input'
        onChange={(e) => onChange(e.currentTarget.value)}
        size={size}
        className='edit-results-title-text-field'
      />
    </FormControl>
  );
}

export default EditTitleInput;
