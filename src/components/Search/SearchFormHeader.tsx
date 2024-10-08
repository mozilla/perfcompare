import { Typography } from '@mui/material';

import { useAppSelector } from '../../hooks/app';
import { CompareCardsStyles } from '../../styles';

interface SearchFormHeaderProps {
  compareType: string;
  isExpanded: boolean;
  title: string;
  subtitle: string;
  ariaLabel: string;
  onClick: () => unknown;
}

function SearchFormHeader(props: SearchFormHeaderProps) {
  const { compareType, isExpanded, onClick, title, subtitle, ariaLabel } =
    props;
  const expandedClass = isExpanded ? 'expanded' : 'hidden';
  const mode = useAppSelector((state) => state.theme.mode);
  const styles = CompareCardsStyles(mode);

  return (
    <div
      className={`compare-card-container compare-card-container--${expandedClass} ${styles.container}`}
      onClick={onClick}
      data-testid={`${compareType}-state`}
    >
      <div className={`compare-card-text ${styles.cardText}`}>
        <Typography variant='h2' className='compare-card-title'>
          {title}
        </Typography>
        <p className='compare-card-tagline'>{subtitle}</p>
      </div>
      <div
        className={`compare-card-img compare-card-img--${compareType}`}
        aria-label={ariaLabel}
      />
    </div>
  );
}

export default SearchFormHeader;
