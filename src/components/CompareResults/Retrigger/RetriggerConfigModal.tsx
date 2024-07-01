import {
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';

import { Strings } from '../../../resources/Strings';
import { CenteredModal } from './CenteredModal';

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
        <MenuItem value={0}>0</MenuItem>
        <MenuItem value={1}>1</MenuItem>
        <MenuItem value={2}>2</MenuItem>
        <MenuItem value={3}>3</MenuItem>
        <MenuItem value={4}>4</MenuItem>
        <MenuItem value={5}>5</MenuItem>
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
      paperStyle={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <Typography id='retrigger-modal-title' component='h2' variant='h2'>
        {retriggerStrings.title}
      </Typography>
      <Typography>{retriggerStrings.body}</Typography>
      <form onSubmit={onFormSubmit}>
        <Grid container gap={1}>
          <Grid item xs={3}>
            <RetriggerCountSelect prefix='base' label='Base' />
          </Grid>
          <Grid item xs={3}>
            <RetriggerCountSelect prefix='new' label='New' />
          </Grid>
          <Grid item xs='auto' ml='auto'>
            <Button type='submit'>{retriggerStrings.submitButton}</Button>
          </Grid>
        </Grid>
      </form>
    </CenteredModal>
  );
}
