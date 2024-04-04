import { useState } from 'react';

import { Grid, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import { useLocation } from 'react-router-dom';
import { Form } from 'react-router-dom';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import { CompareCardsStyles, SearchStyles, Spacing } from '../../styles';
import { Changeset } from '../../types/state';
import CompareButton from './CompareButton';
import FrameworkDropdown from './FrameworkDropdown';
import SearchOverTime from './SearchOverTime';
import TimeRangeDropdown from './TimeRangeDropdown';

const strings = Strings.components.searchDefault;
const stringsNew =
  Strings.components.searchDefault.overTime.collapsed.revisions;

interface CompareWithTimeProps {
  isEditable: boolean;
  baseRevs: Changeset[];
  newRevs: Changeset[];
}

function CompareOverTime({ isEditable }: CompareWithTimeProps) {
  const [expanded, setExpanded] = useState(false);

  const mode = useAppSelector((state) => state.theme.mode);
  const styles = CompareCardsStyles(mode);
  const dropDownStyles = SearchStyles(mode);
  const search = useAppSelector((state) => state.search);
  const searchResults = search.new.searchResults;
  //temporary hash to hide the component until functionality is complete
  const location = useLocation();
  const hash = location.hash;

  //temporary styles to hide the component based on hash
  const containerStyles = {
    container: style({
      display: hash === '#comparetime' ? 'block' : 'none',
    }),
  };

  const wrapperStyles = {
    wrapper: style({
      marginBottom: `${Spacing.layoutXLarge}px`,
    }),
  };

  const bottomStyles = {
    container: style({
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      $nest: {
        '.bottom-dropdowns': {
          display: 'flex',
          minWidth: '580px',
          justifyContent: 'space-between',
        },
      },
    }),
  };

  const toggleIsExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <Grid
      className={`wrapper--overtime ${wrapperStyles.wrapper} ${containerStyles.container}`}
    >
      <div
        className={`compare-card-container compare-card-container--${
          expanded ? 'expanded' : 'hidden'
        } ${styles.container}`}
        onClick={toggleIsExpanded}
        data-testid='time-state'
      >
        <div className={`compare-card-text ${styles.cardText}`}>
          <Typography variant='h2' className='compare-card-title'>
            {strings.overTime.title}
          </Typography>
          <p className='compare-card-tagline'>{strings.overTime.tagline}</p>
        </div>
        <div
          className='compare-card-img compare-card-img--time'
          aria-label='a clock'
        />
      </div>
      <div
        className={`compare-card-container content-base content-base--${
          expanded ? 'expanded' : 'hidden'
        } ${styles.container} `}
      >
        <Divider className='divider' />
        <Form
          action='/compare-results'
          className='form-wrapper'
          aria-label='Compare over time form'
        >
          <SearchOverTime
            {...stringsNew}
            searchResults={searchResults}
            isEditable={isEditable}
          />

          <Grid
            item
            xs={2}
            className={`${dropDownStyles.dropDown} ${bottomStyles.container}`}
          >
            <div className='bottom-dropdowns'>
              <FrameworkDropdown compact={true} />
              <TimeRangeDropdown />
            </div>

            <CompareButton label={strings.overTime.title} />
          </Grid>
        </Form>
      </div>
    </Grid>
  );
}

export default CompareOverTime;
