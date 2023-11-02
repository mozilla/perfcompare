import Box from '@mui/material/Box';
import List from '@mui/material/List';
import { useLocation } from 'react-router-dom';

import { searchView, compareView } from '../../common/constants';
import { SelectRevsStyles } from '../../styles';
import {
  InputType,
  Repository,
  ThemeMode,
  RevisionsList,
} from '../../types/state';
import SelectedRevisionItem from './SelectedRevisionItem';
interface SelectedRevisionsProps {
  mode: ThemeMode;
  searchType: InputType;
  isWarning?: boolean;
  formIsDisplayed: boolean;
  isEditable: boolean;
  revisions: RevisionsList[];
  repositories: Repository['name'][];
}

function SelectedRevisions({
  mode,
  searchType,
  isWarning,
  formIsDisplayed,
  isEditable,
  revisions,
  repositories,
}: SelectedRevisionsProps) {
  const styles = SelectRevsStyles(mode);
  const location = useLocation();
  const view = location.pathname == '/' ? searchView : compareView;

  return (
    <Box
      className={`${styles.box} ${searchType}-box`}
      data-testid={`selected-revs-${view}`}
    >
      <List key={null}>
        {revisions.map((item, index) => (
          <SelectedRevisionItem
            key={item.id}
            index={index}
            item={item}
            mode={mode}
            repository={repositories[index]}
            searchType={searchType}
            isWarning={isWarning}
            formIsDisplayed={formIsDisplayed}
            isEditable={isEditable}
          />
        ))}
      </List>
    </Box>
  );
}

export default SelectedRevisions;
