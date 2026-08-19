const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
});

const numberFormatter = new Intl.NumberFormat('en-US');

// Groups thousands while keeping exactly 2 decimals (e.g. 2,113.69).
const numberFormatterFixedTwo = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatDate(date: Date) {
  return dateFormatter.format(date);
}

export function formatDateRange(date1: Date, date2: Date) {
  return formatDate(date1) + ' - ' + formatDate(date2);
}

export const formatNumber = (value: number) => {
  return numberFormatter.format(value);
};

// Returns the value as a string with a leading "+" when it is positive; negatives
// already carry "-", zero gets no sign. A negative that rounds to zero ("-0",
// "-0.00") is really zero, so its stray minus is dropped. Accepts a raw number or an
// already-formatted string, so the sign is decided from the exact text displayed.
export const withSign = (value: number | string) => {
  const numeric = typeof value === 'number' ? value : parseFloat(value);
  if (numeric > 0) return `+${value}`;
  if (numeric === 0 && typeof value === 'string' && value.startsWith('-')) {
    return value.slice(1);
  }
  return `${value}`;
};

export const formatNumberFixedTwo = (value: number) => {
  return numberFormatterFixedTwo.format(value);
};

// Determine the best human-readable scale for a unit given a set of values.
// Returns the divisor and display unit label; suitable for axis tick formatting.
export function getDisplayScale(
  values: number[],
  rawUnit: string,
): { scale: number; displayUnit: string; decimals: number } {
  const maxAbs = values.length ? Math.max(...values.map(Math.abs)) : 0;
  if (rawUnit === 'bytes') {
    if (maxAbs >= 1024 ** 3)
      return { scale: 1024 ** 3, displayUnit: 'GB', decimals: 2 };
    if (maxAbs >= 1024 ** 2)
      return { scale: 1024 ** 2, displayUnit: 'MB', decimals: 2 };
    if (maxAbs >= 1024) return { scale: 1024, displayUnit: 'KB', decimals: 1 };
    return { scale: 1, displayUnit: 'B', decimals: 0 };
  }
  if (rawUnit === 'KB') {
    if (maxAbs >= 1024 ** 2)
      return { scale: 1024 ** 2, displayUnit: 'GB', decimals: 2 };
    if (maxAbs >= 1024) return { scale: 1024, displayUnit: 'MB', decimals: 2 };
    return { scale: 1, displayUnit: 'KB', decimals: 1 };
  }
  if (rawUnit === 'ms') {
    if (maxAbs >= 60000)
      return { scale: 60000, displayUnit: 'min', decimals: 2 };
    if (maxAbs >= 1000) return { scale: 1000, displayUnit: 's', decimals: 2 };
    return { scale: 1, displayUnit: 'ms', decimals: 2 };
  }
  return { scale: 1, displayUnit: rawUnit, decimals: 1 };
}

// Given a raw unit string and a set of values to display together, return the
// best human-readable unit and a formatting function so all values use the same
// scale. Handles bytes→B/KB/MB/GB and ms→ms/s; everything else is unchanged.
export function adaptUnit(
  values: number[],
  rawUnit: string,
): { fmt: (n: number) => string; displayUnit: string } {
  const { scale, displayUnit, decimals } = getDisplayScale(values, rawUnit);
  const sign = (n: number) => (n >= 0 ? '+' : '');
  return {
    fmt: (n) => sign(n) + (n / scale).toFixed(decimals),
    displayUnit,
  };
}
