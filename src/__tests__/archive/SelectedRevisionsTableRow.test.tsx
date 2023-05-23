import { fireEvent, screen } from '@testing-library/react';

import SelectedRevisionsTableRow, {
  SelectedRevisionsRowProps,
} from '../../components/Shared/SelectedRevisionsTableRow';
import getTestData from '../utils/fixtures';
import { render } from '../utils/setupTests';

describe('SelectedRevisionsTableRow', () => {
  const generateProps = (overwrite: Partial<SelectedRevisionsRowProps> = {}) =>
    ({
      draggedRow: 1,
      dropRow: 4,
      handleDragEnd: jest.fn(),
      index: 1,
      setDraggedRow: jest.fn(),
      setDropRow: jest.fn(),
      view: 'search' as const,
      row: getTestData().testData[0],
      ...overwrite,
    } as const);
  const renderRow = (props: SelectedRevisionsRowProps) =>
    render(
      <table>
        <tbody>
          <SelectedRevisionsTableRow {...props} />
        </tbody>
      </table>,
    );

  it('should trigger setDropRow on drag enter with correct index', () => {
    const props = generateProps();
    renderRow(props);
    const row = screen.getByRole('row');
    fireEvent.dragEnter(row);
    expect(props.setDropRow).toBeCalledTimes(1);
    expect(props.setDropRow).toBeCalledWith(props.index);
  });
  it('should trigger setDraggedRow on drag start with correct index', () => {
    const props = generateProps();
    renderRow(props);
    const row = screen.getByRole('row');
    fireEvent.dragStart(row);
    expect(props.setDraggedRow).toBeCalledTimes(1);
    expect(props.setDraggedRow).toBeCalledWith(props.index);
  });
  it('should trigger handleDragEnd on drag end', () => {
    const props = generateProps();
    renderRow(props);
    const row = screen.getByRole('row');
    fireEvent.dragEnd(row);
    expect(props.handleDragEnd).toBeCalledTimes(1);
  });
  it('should have "draggedRow" class when dragged', () => {
    const props = generateProps();
    renderRow(props);
    const row = screen.getByRole('row');
    expect(row).toHaveClass('draggedRow');
  });
  it('should have "dropArea" class', () => {
    const props = generateProps({ index: 4 });
    renderRow(props);
    const row = screen.getByRole('row');
    expect(row).toHaveClass('dropArea');
  });
  it('should render drag icon indicator', () => {
    const props = generateProps();
    renderRow(props);
    const DragIndicatorIcon = screen.getByTestId('DragIndicatorIcon');
    expect(DragIndicatorIcon).toBeInTheDocument();
  });
});
