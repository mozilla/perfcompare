import Button from '@mui/material/Button';

interface CompareButtonProps {
  label: string;
}

export default function CompareButton({ label }: CompareButtonProps) {
  return (
    <Button id='compare-button' color='primary' type='submit'>
      {label}
    </Button>
  );
}
