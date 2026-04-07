export function determineSign(baseValue: number, newValue: number) {
  if (baseValue > newValue) return '>';
  if (baseValue < newValue) return '<';
  return '';
}

export function determineStatus(improvement: boolean, regression: boolean) {
  if (improvement) return 'Improvement';
  if (regression) return 'Regression';
  return '-';
}

export function determineStatusHintClass(
  improvement: boolean,
  regression: boolean,
) {
  if (improvement) return 'status-hint-improvement';
  if (regression) return 'status-hint-regression';
  return '';
}
