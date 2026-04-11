import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import './HolidayCalendar.css';
import { isHoliday, tileClassName, getHolidayName } from '../../../utilitis/utilitis';
import { isWeekend, isPublicHoliday } from '../../../utilitis/congeAlgo';
import { type CongePeriod } from '../../../utilitis/congeAlgo';
import { useApp } from '../../../contexts/AppContext';
import { t } from '../../../i18n/translations';
import type { Lang } from '../../../i18n/translations';

const today = new Date();
today.setHours(0, 0, 0, 0);

const getDaysUntil = (date: Date) =>
  Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

const LOCALE_MAP: Record<string, string> = {
  fr: 'fr-FR',
  en: 'en-US',
  ar: 'ar-MA',
};

/**
 * Find the first weekend day right after the last workday of the week.
 * This is the day that gets "penalized" in 6-day week mode.
 *
 *   Morocco  [0, 6] → penalty weekend day = Saturday (6), triggered by Friday (5)
 *   UAE      [5, 6] → penalty weekend day = Friday (5), triggered by Thursday (4)
 */
const findPenaltyWeekendDay = (weekendDays: number[]): number => {
  const wSet = new Set(weekendDays);
  for (let d = 0; d < 7; d++) {
    if (wSet.has(d)) continue;
    const next = (d + 1) % 7;
    if (wSet.has(next)) return next; // first weekend day after the last workday
  }
  return 6; // fallback
};

interface Props {
  highlightPeriod?: CongePeriod | null;
  sixDayWeek?: boolean;
}

const HolidayCalendar = ({ highlightPeriod, sixDayWeek }: Props) => {
  const { holidays, weekendDays, lang, loadingCountry } = useApp();
  const tr = t[lang as Lang] ?? t.fr;

  const [date, setDate] = useState<Date>(today);
  const [activeStartDate, setActiveStartDate] = useState<Date>(today);

  const locale = LOCALE_MAP[lang] ?? 'fr-FR';

  const nextHoliday = [...holidays]
    .map((h) => ({ ...h, dateObj: new Date(h.date) }))
    .filter((h) => h.dateObj >= today)
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())[0];

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

  const isLeaveDay = (d: Date) => {
    if (!highlightPeriod) return false;
    const t = normalize(d);
    return isInPeriod(t) && !isWeekend(t, weekendDays) && !isPublicHoliday(t, holidays);
  };

  const isWeekendInPeriod = (d: Date) => {
    if (!highlightPeriod) return false;
    const t = normalize(d);
    return isInPeriod(t) && isWeekend(t, weekendDays);
  };

  const isHolidayInPeriod = (d: Date) => {
    if (!highlightPeriod) return false;
    const t = normalize(d);
    return isInPeriod(t) && isPublicHoliday(t, holidays);
  };

  const isSaturdayPenalty = (d: Date) => {
    if (!highlightPeriod || !sixDayWeek) return false;
    const t = normalize(d);
    const penaltyWeekendDay = findPenaltyWeekendDay(weekendDays);
    if (t.getDay() !== penaltyWeekendDay) return false;
    if (!isInPeriod(t)) return false;
    // Check if the workday before this weekend day is a leave day
    const dayBefore = new Date(t);
    dayBefore.setDate(dayBefore.getDate() - 1);
    return isLeaveDay(dayBefore);
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month' && isHoliday(date, holidays)) {
      const d = normalize(date);
      return (
        <span
          className={`holiday-dot ${d < today ? 'holiday-dot--past' : ''}`}
          title={getHolidayName(date, holidays) as string}
        />
      );
    }
    return null;
  };

  const tileClassNameExtended = ({ date, view }: { date: Date; view: string }) => {
    const classes: string[] = [];
    const d = normalize(date);

    if (view === 'month' && d < today) classes.push('day--past');
    if (isInPeriod(date))        classes.push('day--in-period');
    if (isPeriodStart(date))     classes.push('day--period-start');
    if (isPeriodEnd(date))       classes.push('day--period-end');
    if (isLeaveDay(date))        classes.push('day--leave-day');
    if (isWeekendInPeriod(date)) classes.push('day--weekend-in-period');
    if (isSaturdayPenalty(date)) classes.push('day--saturday-penalty');
    if (isHolidayInPeriod(date)) classes.push('day--holiday-in-period');

    const holidayClass = tileClassName({ date, view }, holidays);
    if (holidayClass) classes.push(holidayClass);

    return classes.join(' ') || null;
  };

  const tileDisabled = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return false;
    return normalize(date) < today;
  };

  if (loadingCountry) return (
    <div className="calendar-shell">
      <div className="calendar-shell__loading">
        <span className="calendar-shell__spinner" />
      </div>
    </div>
  );

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
          locale={locale}
          calendarType="iso8601"
          activeStartDate={activeStartDate}
          onActiveStartDateChange={({ activeStartDate }) => {
            if (activeStartDate) setActiveStartDate(activeStartDate);
          }}
          showNeighboringMonth={true}
          navigationLabel={({ date }) =>
            date
              .toLocaleDateString(locale, { month: 'long', year: 'numeric' })
              .toUpperCase()
          }
        />

        <div className="calendar-shell__side">
          {nextHoliday && (
            <div className="next-holiday">
              <span className="next-holiday__label">
                {tr.nextHoliday.split('\n').map((line, i) => (
                  <span key={i}>{line}{i === 0 && <br />}</span>
                ))}
              </span>
              <div className="next-holiday__countdown">
                <span className="next-holiday__days">{daysUntil}</span>
                <span className="next-holiday__unit">{tr.days}</span>
              </div>
              <div className="next-holiday__divider" />
              <div className="next-holiday__info-group">
                <span className="next-holiday__name">{nextHoliday.name}</span>
                <span className="next-holiday__date">
                  {nextHoliday.dateObj.toLocaleDateString(locale, {
                    day: 'numeric',
                    month: 'long',
                  })}
                </span>
              </div>
            </div>
          )}

          {date && isHoliday(date, holidays) && normalize(date) >= today && (
            <div className="holiday-banner">
              <span className="holiday-banner__dot" />
              <div className="holiday-banner__content">
                <span className="holiday-banner__label">{tr.selectedHoliday}</span>
                <span className="holiday-banner__name">{getHolidayName(date, holidays)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HolidayCalendar;