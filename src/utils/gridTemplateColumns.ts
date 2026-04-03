// Builds a CSS grid-template-columns string from a columns config.
// Uses minmax(0, Xfr) for fr tracks so that min-content of individual cells
// (e.g. header button groups vs icon-only cells) cannot expand a track beyond
// its fr allocation across separate grid instances.
export function toGridTemplateColumns(config: { gridWidth: string }[]): string {
  return config
    .map(({ gridWidth }) =>
      gridWidth.endsWith('fr') ? `minmax(0, ${gridWidth})` : gridWidth,
    )
    .join(' ');
}
