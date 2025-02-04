import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';

interface EditTitleInputProps {
  compact: boolean;
  titleError: string | null;
  value: string;
  onChange: (titleText: string) => unknown;
}

function EditTitleInput({
  compact,
  value,
  onChange,
  titleError,
}: EditTitleInputProps) {
  const size = compact ? 'small' : undefined;
  const inputPlaceholder = 'Write a title for this comparison';

  return (
    <FormControl fullWidth sx={{ paddingRight: 1 }}>
      <TextField
        fullWidth
        placeholder={inputPlaceholder}
        inputProps={{
          'aria-label': inputPlaceholder,
        }}
        id='results-title-input'
        onChange={(e) => onChange(e.currentTarget.value)}
        size={size}
        className='edit-results-title-text-field'
        error={Boolean(titleError)}
        value={value}
      />
    </FormControl>
  );
}

export default EditTitleInput;
