import Button from '@mui/material/Button';

interface CompareButtonProps {
  label: string;
}

export default function CompareButton({ label }: CompareButtonProps) {
  return (
    <Button
      id='compare-button'
      color='primary'
      type='submit'
      sx={{
        height: 32,
      }}
    >
      {label}
    </Button>
  );
}
