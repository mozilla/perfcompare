import InfoIcon from '@mui/icons-material/InfoOutlined';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import { connect } from 'react-redux';
import { style, cssRule } from 'typestyle';

import { repoMap } from '../../../common/constants';
import type { RootState } from '../../../common/store';
import useHandleChangeDropdown from '../../../hooks/useHandleChangeDropdown';
import {
  Spacing,
  ButtonsLightRaw,
  ButtonsDarkRaw,
  TooltipRaw,
  FontsRaw,
  Colors,
  DropDownMenuRaw,
  DropDownItemRaw,
} from '../../../styles';

function SearchDropdown(props: SearchDropdownProps) {
  const { repository, view, selectLabel, tooltipText, mode } = props;
  const size = view == 'compare-results' ? 'small' : undefined;
  const { handleChangeDropdown } = useHandleChangeDropdown();

  //searchType is to distinguish between base and new search dropdowns for handleChangeDropdown hook
  const [repoSelect, setRepoSelect] = useState({
    baseRepository: '',
    newRepository: '',
    searchType: base,
  });

  useEffect(() => {
    if (repoSelect.baseRepository !== '' || repoSelect.newRepository !== '') {
      void handleChangeDropdown(repoSelect);
    }
  }, [repoSelect]);

  cssRule('.MuiTooltip-popper', {
    ...(mode === 'light' ? TooltipRaw.Light : TooltipRaw.Dark),
    $nest: {
      '.MuiTooltip-tooltip': {
        ...(mode === 'light' ? FontsRaw.BodySmall : FontsRaw.BodySmallDark),
        backgroundColor: Colors.ColorTransparent,
        padding: '0px',
        margin: '0px !important',
      },
    },
  });

  cssRule('.MuiPopover-root', {
    $nest: {
      '.MuiPaper-root': {
        flexDirection: 'column',
        ...(mode === 'light' ? DropDownMenuRaw.Light : DropDownMenuRaw.Dark),
        $nest: {
          '.MuiList-root': {
            padding: `${Spacing.Small}px ${Spacing.xSmall}px`,
            $nest: {
              '.MuiMenuItem-root': {
                ...(mode === 'light'
                  ? DropDownItemRaw.Light
                  : DropDownItemRaw.Dark),
              },
            },
          },
        },
      },
    },
  });

  const styles = {
    container: style({
      width: '100%',
      marginBottom: `${Spacing.xLarge}px`,

      $nest: {
        '.MuiInputBase-root': {
          ...(mode === 'light'
            ? ButtonsLightRaw.Dropdown
            : ButtonsDarkRaw.Dropdown),
        },
      },
    }),
  };

  return (
    <div>
      <FormControl
        size={size}
        className={`search-dropdown ${styles.container}`}
      >
        <InputLabel
          id='select-repository-label'
          className='dropdown-select-label'
        >
          {selectLabel}
          <Tooltip placement='top' title={tooltipText}>
            <InfoIcon fontSize='small' className='dropdown-info-icon' />
          </Tooltip>
        </InputLabel>
        <Select
        data-testid = "dropdown-select"
          label={selectLabel}
          value={repository}
          labelId='select-repository-label'
          className='dropdown-select'
          variant='standard'
        >
          {Object.keys(repoMap).map((key) => (
            <MenuItem
              id={repoMap[key]}
              value={repoMap[key]}
              key={repoMap[key]}
              onClick={(e) => void handleChangeDropdown(e)}
            >
              {repoMap[key]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}

interface SearchDropdownProps {
  repository: string;
  view: 'compare-results' | 'search';
  selectLabel: string;
  tooltipText: string;
  mode: 'light' | 'dark';
}

function mapStateToProps(state: RootState) {
  return {
    repository: state.search.repository,
  };
}

export default connect(mapStateToProps)(SearchDropdown);
