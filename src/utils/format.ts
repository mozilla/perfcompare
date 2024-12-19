const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
});

export function formatDate(date: Date) {
  return dateFormatter.format(date);
}

export function formatDateRange(date1: Date, date2: Date) {
  return formatDate(date1) + ' - ' + formatDate(date2);
}

export const formatNumber = (value: number) => {
  return Intl.NumberFormat('en-US').format(value);
};
