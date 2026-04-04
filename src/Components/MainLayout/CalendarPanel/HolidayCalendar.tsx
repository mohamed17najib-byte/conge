import  { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import './HolidayCalendar.css';
import { moroccoHolidays } from '../../../data/Holidays';
import { isHoliday, tileClassName, getHolidayName } from '../../../utilitis/utilitis';
import { isWeekend, isPublicHoliday } from '../../../utilitis/congeAlgo';
import { type CongePeriod } from '../../../utilitis/congeAlgo';

const today = new Date();
today.setHours(0, 0, 0, 0);

const getNextHoliday = () => {
  return moroccoHolidays
    .map((h) => ({ ...h, dateObj: new Date(h.date) }))
    .filter((h) => h.dateObj >= today)
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())[0];
};

const getDaysUntil = (date: Date) =>
  Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

interface Props {
  highlightPeriod?: CongePeriod | null;
}

const HolidayCalendar = ({ highlightPeriod }: Props) => {
  const [date, setDate] = useState<Date>(today);
  const [activeStartDate, setActiveStartDate] = useState<Date>(today);

  const nextHoliday = getNextHoliday();
  const daysUntil = nextHoliday ? getDaysUntil(nextHoliday.dateObj) : null;

  useEffect(() => {
    if (highlightPeriod) {
      const start = new Date(highlightPeriod.start);
      setActiveStartDate(new Date(start.getFullYear(), start.getMonth(), 1));
    }
  }, [highlightPeriod]);

  const normalize = (d: Date) => {
    const n = new Date(d);
    n.setHours(0, 0, 0, 0);
    return n;
  };

  const isInPeriod = (d: Date) => {
    if (!highlightPeriod) return false;
    const t = normalize(d);
    const s = normalize(highlightPeriod.start);
    const e = normalize(highlightPeriod.end);
    return t >= s && t <= e;
  };

  const isPeriodStart = (d: Date) => {
    if (!highlightPeriod) return false;
    return normalize(d).getTime() === normalize(highlightPeriod.start).getTime();
  };

  const isPeriodEnd = (d: Date) => {
    if (!highlightPeriod) return false;
    return normalize(d).getTime() === normalize(highlightPeriod.end).getTime();
  };

  // Leave day = inside the period AND a real workday (not weekend, not holiday)
  const isLeaveDay = (d: Date) => {
    if (!highlightPeriod) return false;
    const t = normalize(d);
    return isInPeriod(t) && !isWeekend(t) && !isPublicHoliday(t);
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month' && isHoliday(date)) {
      const d = normalize(date);
      return (
        <span
          className={`holiday-dot ${d < today ? 'holiday-dot--past' : ''}`}
          title={getHolidayName(date) as string}
        />
      );
    }
    return null;
  };

  const tileClassNameExtended = ({ date, view }: { date: Date; view: string }) => {
    const classes: string[] = [];
    const d = normalize(date);

    if (view === 'month' && d < today) classes.push('day--past');
    if (isInPeriod(date))    classes.push('day--in-period');
    if (isPeriodStart(date)) classes.push('day--period-start');
    if (isPeriodEnd(date))   classes.push('day--period-end');
    if (isLeaveDay(date))    classes.push('day--leave-day');

    const holidayClass = tileClassName({ date, view });
    if (holidayClass) classes.push(holidayClass);

    return classes.join(' ') || null;
  };

  const tileDisabled = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return false;
    return normalize(date) < today;
  };

return (
  <div className="calendar-shell">

    <div className="calendar-shell__inner">

      <Calendar
        value={date}
        onChange={(val) => setDate(val as Date)}
        tileClassName={tileClassNameExtended}
        tileContent={tileContent}
        tileDisabled={tileDisabled}
        minDate={new Date(2026, 0, 1)}
        maxDate={new Date(2026, 11, 31)}
        minDetail="month"
        activeStartDate={activeStartDate}
        onActiveStartDateChange={({ activeStartDate }) => {
          if (activeStartDate) setActiveStartDate(activeStartDate);
        }}
        showNeighboringMonth={false}
        formatShortWeekday={(_, d) =>
          ['D', 'L', 'M', 'M', 'J', 'V', 'S'][d.getDay()]
        }
        navigationLabel={({ date }) =>
          date
            .toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
            .toUpperCase()
        }
      />

      {nextHoliday && (
  <div className="next-holiday">
    <span className="next-holiday__label">Prochain<br/>jour férié</span>
    <div className="next-holiday__countdown">
      <span className="next-holiday__days">{daysUntil}</span>
      <span className="next-holiday__unit">jours</span>
    </div>
    <div className="next-holiday__divider" />
    <div className="next-holiday__info-group">
      <span className="next-holiday__name">{nextHoliday.name}</span>
      <span className="next-holiday__date">
        {nextHoliday.dateObj.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
        })}
      </span>
    </div>
  </div>
)}

    </div>

    {date && isHoliday(date) && normalize(date) >= today && (
      <div className="holiday-banner">
        <span className="holiday-icon">✦</span>
        {getHolidayName(date)}
      </div>
    )}

  </div>
);
};

export default HolidayCalendar;