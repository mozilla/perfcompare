import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';

interface EditTitleInputProps {
  compact: boolean;
  titleError: string | null;
  comparisonTitleName: string | undefined;
  onChange: (titleText: string) => unknown;
}

function EditTitleInput({
  compact,
  comparisonTitleName,
  onChange,
  titleError,
}: EditTitleInputProps) {
  const size = compact ? 'small' : undefined;
  const inputPlaceholder = 'Write a title for this comparison';

  return (
    <FormControl fullWidth sx={{ paddingRight: 1 }}>
      <TextField
        fullWidth
        placeholder={
          comparisonTitleName ? comparisonTitleName : inputPlaceholder
        }
        inputProps={{
          'aria-label': comparisonTitleName
            ? comparisonTitleName
            : inputPlaceholder,
        }}
        id='results-title-input'
        onChange={(e) => onChange(e.currentTarget.value)}
        size={size}
        className='edit-results-title-text-field'
        error={Boolean(titleError)}
      />
    </FormControl>
  );
}

export default EditTitleInput;
