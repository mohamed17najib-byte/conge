import type { Holiday } from "../types/Holiday";

export const isHoliday = (day: Date, holidays: Holiday[]) =>
  holidays.some(h => new Date(h.date).toDateString() === day.toDateString());

export const tileClassName = ({ date, view }: { date: Date; view: string }, holidays: Holiday[]) => {
  if (view === 'month' && isHoliday(date, holidays)) return 'holiday';
  return null;
};

export const getHolidayName = (date: Date, holidays: Holiday[]) => {
  const holiday = holidays.find(h => new Date(h.date).toDateString() === date.toDateString());
  return holiday ? `(${holiday.name})` : null;
};

export function getFlagEmoji(code: string): string {
  return code.toUpperCase().split('').map(c =>
    String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0))
  ).join('');
}