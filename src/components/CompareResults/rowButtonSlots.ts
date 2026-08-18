// Geometry for the `.row-buttons` grid cell in RevisionRow and
// SubtestsRevisionRow.
//
// Every row is its own CSS grid, and TableHeader builds a matching one, so the
// cell has to be sized identically for all of them: wide enough for the most
// buttons any single row can show, even though most rows show fewer. Buttons
// are right-aligned inside the cell, so the surplus shows up as blank space to
// their left instead of as a ragged right edge.
//
// Keep the slot counts below in sync with the buttons rendered in the
// `.row-buttons` cell of each row component.
const BUTTON_SLOT_WIDTH_PX = 34;

// RevisionRow: subtests link (only when the result has subtests), profile
// comparison (only for suites supportsProfileCompare() accepts), graph link,
// and retrigger.
const REVISION_ROW_BUTTON_SLOTS = 4;

// SubtestsRevisionRow: graph link only.
const SUBTESTS_ROW_BUTTON_SLOTS = 1;

export function rowButtonsGridWidth(isSubtestTable: boolean): string {
  const slots = isSubtestTable
    ? SUBTESTS_ROW_BUTTON_SLOTS
    : REVISION_ROW_BUTTON_SLOTS;
  return `${slots * BUTTON_SLOT_WIDTH_PX}px`;
}
