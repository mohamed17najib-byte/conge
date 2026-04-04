import { moroccoHolidays } from "../data/Holidays";

const today = new Date();
today.setHours(0, 0, 0, 0);

// ✅ FIX 1: Use local date string to avoid UTC timezone shift
const toLocalDateString = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const holidaySet = new Set(moroccoHolidays.map((h) => h.date));

export const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
export const isPublicHoliday = (d: Date) => holidaySet.has(toLocalDateString(d));
export const isWorkday = (d: Date) => !isWeekend(d) && !isPublicHoliday(d);

const addDays = (d: Date, n: number): Date => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

export interface CongePeriod {
  start: Date;
  end: Date;
  congeUsed: number;
  totalDaysOff: number;
  holidaysInPeriod: string[];
  efficiency: number;
}

const BOUND_START = new Date(2026, 0, 1);
const BOUND_END = new Date(2026, 11, 31);

const getFullBreakRange = (leaveStart: Date, leaveEnd: Date) => {
  let s = new Date(leaveStart);
  while (s > BOUND_START && !isWorkday(addDays(s, -1))) {
    s = addDays(s, -1);
  }
  let e = new Date(leaveEnd);
  while (e < BOUND_END && !isWorkday(addDays(e, 1))) {
    e = addDays(e, 1);
  }
  return { s, e };
};

export const findBestPeriods = (nDays: number, targetMonth?: number): CongePeriod[] => {
  const results: CongePeriod[] = [];
  const seen = new Set<string>();
  const scanStart = today > BOUND_START ? today : BOUND_START;

  for (let d = new Date(scanStart); d <= BOUND_END; d = addDays(d, 1)) {
    if (!isWorkday(d)) continue;

    const workdays: Date[] = [];
    let cursor = new Date(d);

    while (workdays.length < nDays && cursor <= BOUND_END) {
      if (isWorkday(cursor)) workdays.push(new Date(cursor));
      cursor = addDays(cursor, 1);
    }

    if (workdays.length < nDays) continue;

    const leaveStart = workdays[0];
    const leaveEnd = workdays[workdays.length - 1];

    const { s, e } = getFullBreakRange(leaveStart, leaveEnd);

    // ✅ FIX 2: Use local date string for the dedup key
    const key = `${toLocalDateString(s)}|${toLocalDateString(e)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    let totalDaysOff = 0;
    const holidaysInPeriod: string[] = [];
    let temp = new Date(s);

    while (temp <= e) {
      totalDaysOff++;
      if (isPublicHoliday(temp)) {
        // ✅ FIX 3: Use local date string when storing holiday dates
        holidaysInPeriod.push(toLocalDateString(temp));
      }
      temp = addDays(temp, 1);
    }

    const efficiency = totalDaysOff / nDays;

    const touchesMonth =
      targetMonth === undefined ||
      (s.getMonth() <= targetMonth && e.getMonth() >= targetMonth) ||
      s.getMonth() === targetMonth ||
      e.getMonth() === targetMonth;

    if (touchesMonth) {
      results.push({
        start: s,
        end: e,
        congeUsed: nDays,
        totalDaysOff,
        holidaysInPeriod,
        efficiency,
      });
    }
  }

  return results
    .sort((a, b) => {
      if (b.efficiency !== a.efficiency) return b.efficiency - a.efficiency;
      if (b.totalDaysOff !== a.totalDaysOff) return b.totalDaysOff - a.totalDaysOff;
      return a.start.getTime() - b.start.getTime();
    })
    .filter((p, i, self) =>
      !self.slice(0, i).some(
        (prev) => p.start <= prev.end && p.end >= prev.start
      )
    )
    .slice(0, 5);
};