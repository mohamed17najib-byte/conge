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

/**
 * Weekend days are fully dynamic per country.
 * weekendDays array contains the JS day numbers (0=Sun … 6=Sat) that are days off.
 *
 * Examples:
 *   Morocco [0, 6]  → Sunday & Saturday off
 *   UAE     [5, 6]  → Friday & Saturday off
 *   Iran    [5]     → Friday only off
 *
 * No day is hardcoded — everything is driven by weekendDays.
 */
export const isWeekend = (d: Date, weekendDays: number[] = [0, 6]) => {
  return weekendDays.includes(d.getDay());
};

export const isWorkday = (d: Date, holidays: Holiday[], weekendDays: number[] = [0, 6]) =>
  !isWeekend(d, weekendDays) && !isPublicHoliday(d, holidays);

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
  holidays: Holiday[],
  weekendDays: number[],
) => {
  let s = new Date(leaveStart);
  while (s > BOUND_START && !isWorkday(addDays(s, -1), holidays, weekendDays)) {
    s = addDays(s, -1);
  }
  // Don't extend into the past
  if (s < today) s = new Date(today);

  let e = new Date(leaveEnd);
  while (e < BOUND_END && !isWorkday(addDays(e, 1), holidays, weekendDays)) {
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
  // Different day of week = different option (e.g., Friday vs Monday)
  if (kept.start.getDay() !== candidate.start.getDay()) return false;
  if (kept.totalDaysOff !== candidate.totalDaysOff) return false;
  if (kept.efficiency !== candidate.efficiency) return false;
  const kHolidays = kept.holidaysInPeriod.join(",");
  const cHolidays = candidate.holidaysInPeriod.join(",");
  if (kHolidays !== cHolidays) return false;
  return true;
};

/**
 * Find the "penalty day" for 6-day week mode.
 *
 * In a 6-day work week, the last workday before the weekend costs 2 congé days
 * because taking it also deducts the following weekend day.
 *
 * We walk the weekly cycle to find the workday that sits right before the
 * weekend block starts. This works for any country configuration:
 *
 *   Morocco  weekendDays=[0, 6] → penaltyDay = Friday (5)
 *   UAE      weekendDays=[5, 6] → penaltyDay = Thursday (4)
 *   Iran     weekendDays=[5]    → penaltyDay = Thursday (4)
 */
const findPenaltyDay = (weekendDays: number[]): number => {
  const wSet = new Set(weekendDays);
  for (let d = 0; d < 7; d++) {
    if (wSet.has(d)) continue; // skip weekend days
    const next = (d + 1) % 7;
    if (wSet.has(next)) return d; // this workday is right before the weekend
  }
  return 5; // fallback
};

export const findBestPeriods = (
  nDays: number,
  holidays: Holiday[],
  weekendDays: number[] = [0, 6],
  targetMonth?: number,
  sixDayWeek = false,
): CongePeriod[] => {
  const results: CongePeriod[] = [];
  const seen = new Set<string>();
  const scanStart = today > BOUND_START ? today : BOUND_START;

  // Build list of days that can be taken as congé
  const allWorkdays: Date[] = [];
  for (let d = new Date(scanStart); d <= BOUND_END; d = addDays(d, 1)) {
    if (!isWorkday(d, holidays, weekendDays)) continue;
    allWorkdays.push(new Date(d));
  }

  // Penalty day for 6-day week: last workday before the weekend
  const penaltyDay = findPenaltyDay(weekendDays);

  for (let i = 0; i < allWorkdays.length; i++) {
    const leaveStart = allWorkdays[i];

    // Place workdays one by one, counting penalty day against the budget
    let cost = 0;
    let j = i;
    while (j < allWorkdays.length && cost < nDays) {
      const d = allWorkdays[j];
      const dayCost =
        sixDayWeek && d.getDay() === penaltyDay && !isPublicHoliday(d, holidays)
          ? 2
          : 1;
      if (cost + dayCost > nDays) break; // would exceed budget
      cost += dayCost;
      j++;
    }

    // Not enough days to use the full budget — skip
    if (cost < nDays) continue;

    const leaveEnd = allWorkdays[j - 1];

    const { s, e } = getFullBreakRange(leaveStart, leaveEnd, holidays, weekendDays);

    // Dedup on full break range
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

    const actualCongeUsed = nDays; // always exactly the budget

    const efficiency = totalDaysOff / actualCongeUsed;

    results.push({
      start: s,
      end: e,
      congeUsed: actualCongeUsed,
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