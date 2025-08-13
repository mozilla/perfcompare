import {
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';

import { CenteredModal } from './CenteredModal';
import { Strings } from '../../../resources/Strings';

const retriggerStrings = Strings.components.retrigger.config;

function RetriggerCountSelect({
  prefix,
  label,
}: {
  prefix: string;
  label: string;
}) {
  return (
    <FormControl sx={{ width: '100%' }}>
      <InputLabel id={`${prefix}-retrigger-count-label`}>{label}</InputLabel>
      <Select
        labelId={`${prefix}-retrigger-count-label`}
        name={`${prefix}-retrigger-count`}
        defaultValue={0}
        label={label}
        sx={{ height: 32 }}
      >
        {Array.from({ length: 10 }).map((_, count) => (
          <MenuItem key={count} value={count}>
            {count}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

type RetriggerModalProps = {
  open: boolean;
  onClose: () => unknown;
  onRetriggerClick: (times: { baseTimes: number; newTimes: number }) => unknown;
};

export function RetriggerConfigModal(props: RetriggerModalProps) {
  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const baseCount = formData.get('base-retrigger-count');
    const newCount = formData.get('new-retrigger-count');
    props.onRetriggerClick({
      baseTimes: baseCount ? +baseCount : 0,
      newTimes: newCount ? +newCount : 0,
    });
  };

  return (
    <CenteredModal
      open={props.open}
      onClose={props.onClose}
      ariaLabelledby='retrigger-modal-title'
    >
      <Typography id='retrigger-modal-title' component='h2' variant='h2'>
        {retriggerStrings.title}
      </Typography>
      <Typography>{retriggerStrings.body}</Typography>
      <form onSubmit={onFormSubmit}>
        <Grid
          container
          sx={{
            gap: 1,
          }}
        >
          <Grid size={3}>
            <RetriggerCountSelect prefix='base' label='Base' />
          </Grid>
          <Grid size={3}>
            <RetriggerCountSelect prefix='new' label='New' />
          </Grid>
          <Grid
            size='auto'
            sx={{
              ml: 'auto',
            }}
          >
            <Button type='submit'>{retriggerStrings.submitButton}</Button>
          </Grid>
        </Grid>
      </form>
    </CenteredModal>
  );
}
