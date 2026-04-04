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