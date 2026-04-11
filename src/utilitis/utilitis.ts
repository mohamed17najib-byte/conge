import { moroccoHolidays } from "../data/Holidays";

 export const isHoliday = (day: Date) =>
    moroccoHolidays.some(
      (h) => new Date(h.date).toDateString() === day.toDateString()
    );

  export const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month' && isHoliday(date)) {
      return 'holiday';
    }
    return null;
  };
  export const getHolidayName = (date: Date) => {
    const holiday = moroccoHolidays.find(
      (h) => new Date(h.date).toDateString() === date.toDateString()
    );
    return holiday ? `(${holiday.name})` : null;
  }
  export function getFlagEmoji(code: string): string {
  return code.toUpperCase().split('').map(c =>
    String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0))
  ).join('');
}