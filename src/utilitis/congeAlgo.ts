import type { Holiday } from "../types/Holiday";

const today = new Date();
today.setHours(0, 0, 0, 0);

const toLocalDateString = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const addDays = (d: Date, n: number): Date => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

export const isPublicHoliday = (d: Date, holidays: Holiday[]) =>
  holidays.some(h => h.date === toLocalDateString(d));

export const isWeekend = (d: Date, weekendDays: number[] = [5, 6]) =>
  weekendDays.includes(d.getDay());

export const isWorkday = (d: Date, holidays: Holiday[], weekendDays: number[] = [5, 6], sixDayWeek = false) => {
  if (sixDayWeek) {
    // Saturday is a workday — remove it from weekend, keep only Sunday (or equivalent)
    const reducedWeekend = weekendDays.filter(day => day !== 6);
    return !isWeekend(d, reducedWeekend) && !isPublicHoliday(d, holidays);
  }
  return !isWeekend(d, weekendDays) && !isPublicHoliday(d, holidays);
};

const diffDays = (a: Date, b: Date): number =>
  Math.round((b.getTime() - a.getTime()) / 86400000) + 1;

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

const getFullBreakRange = (
  leaveStart: Date,
  leaveEnd: Date,
  sixDayWeek: boolean,
  holidays: Holiday[],
  weekendDays: number[]
) => {
  let s = new Date(leaveStart);
  while (s > BOUND_START && !isWorkday(addDays(s, -1), holidays, weekendDays, sixDayWeek)) {
    s = addDays(s, -1);
  }
  if (s < today) s = new Date(today);

  let e = new Date(leaveEnd);
  while (e < BOUND_END && !isWorkday(addDays(e, 1), holidays, weekendDays, sixDayWeek)) {
    e = addDays(e, 1);
  }
  return { s, e };
};

const touchesMonth = (s: Date, e: Date, month: number): boolean => {
  const monthStart = new Date(2026, month, 1);
  const monthEnd = new Date(2026, month + 1, 0);
  return s <= monthEnd && e >= monthStart;
};

const isTooSimilar = (kept: CongePeriod, candidate: CongePeriod): boolean => {
  const startGap = Math.abs(
    Math.round((kept.start.getTime() - candidate.start.getTime()) / 86400000)
  );
  if (startGap >= 5) return false;
  if (kept.start.getDay() !== candidate.start.getDay()) return false;
  if (kept.totalDaysOff !== candidate.totalDaysOff) return false;
  if (kept.efficiency !== candidate.efficiency) return false;
  const kHolidays = kept.holidaysInPeriod.join(",");
  const cHolidays = candidate.holidaysInPeriod.join(",");
  if (kHolidays !== cHolidays) return false;
  return true;
};

export const findBestPeriods = (
  nDays: number,
  holidays: Holiday[],
  weekendDays: number[] = [5, 6],
  targetMonth?: number,
  sixDayWeek = false,
): CongePeriod[] => {
  const results: CongePeriod[] = [];
  const seen = new Set<string>();
  const scanStart = today > BOUND_START ? today : BOUND_START;

  const allWorkdays: Date[] = [];
  for (let d = new Date(scanStart); d <= BOUND_END; d = addDays(d, 1)) {
    if (!isWorkday(d, holidays, weekendDays, sixDayWeek)) continue;
    allWorkdays.push(new Date(d));
  }

  // The penalty day is the last workday before the weekend
  // e.g. for [5,6] (Fri+Sat) weekend → penalty on Thursday (4)
  // e.g. for [0,6] (Sun+Sat) weekend → penalty on Friday (5)
  const penaltyDay = Math.min(...weekendDays) - 1;

  for (let i = 0; i < allWorkdays.length; i++) {
    const leaveStart = allWorkdays[i];

    let cost = 0;
    let j = i;
    while (j < allWorkdays.length && cost < nDays) {
      const d = allWorkdays[j];
      const dayCost = (sixDayWeek && d.getDay() === penaltyDay && !isPublicHoliday(d, holidays)) ? 2 : 1;
      if (cost + dayCost > nDays) break;
      cost += dayCost;
      j++;
    }

    if (cost < nDays) continue;

    const leaveEnd = allWorkdays[j - 1];
    const { s, e } = getFullBreakRange(leaveStart, leaveEnd, sixDayWeek, holidays, weekendDays);

    const key = `${toLocalDateString(s)}|${toLocalDateString(e)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    if (targetMonth !== undefined && !touchesMonth(s, e, targetMonth)) continue;

    const totalDaysOff = diffDays(s, e);
    const holidaysInPeriod: string[] = [];
    let temp = new Date(s);
    while (temp <= e) {
      if (isPublicHoliday(temp, holidays)) {
        holidaysInPeriod.push(toLocalDateString(temp));
      }
      temp = addDays(temp, 1);
    }

    const efficiency = totalDaysOff / nDays;

    results.push({
      start: s,
      end: e,
      congeUsed: nDays,
      totalDaysOff,
      holidaysInPeriod,
      efficiency,
    });
  }

  results.sort((a, b) => {
    if (b.efficiency !== a.efficiency) return b.efficiency - a.efficiency;
    if (b.totalDaysOff !== a.totalDaysOff) return b.totalDaysOff - a.totalDaysOff;
    return a.start.getTime() - b.start.getTime();
  });

  const selected: CongePeriod[] = [];
  for (const period of results) {
    const redundant = selected.some((kept) => isTooSimilar(kept, period));
    if (!redundant) {
      selected.push(period);
      if (selected.length >= 10) break;
    }
  }

  return selected;
};