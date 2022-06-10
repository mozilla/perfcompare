export type SelectedRevisionsTableHeaders =
  | 'Project'
  | 'Revision'
  | 'Author'
  | 'Commit Message'
  | 'Timestamp';

export type ResultsTableHeaders =
  | 'Platform'
  | 'Test Name'
  | 'Base'
  | 'New'
  | 'Delta'
  | 'Confidence'
  | 'Total Runs';

export type ConfidenceText = 'high' | 'med' | 'low';
