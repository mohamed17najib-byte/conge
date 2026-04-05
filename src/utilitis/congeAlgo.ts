import { moroccoHolidays } from "../data/Holidays";

const today = new Date();
today.setHours(0, 0, 0, 0);

const toLocalDateString = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const holidaySet = new Set(moroccoHolidays.map((h) => h.date));

const addDays = (d: Date, n: number): Date => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

export const isPublicHoliday = (d: Date) => holidaySet.has(toLocalDateString(d));

/**
 * Saturday & Sunday are ALWAYS free days (days off).
 * The 6-day week rule only affects COST:
 *   - If you take Friday as congé (and Friday is NOT a holiday) → Saturday is also deducted
 *   - If Friday is a public holiday → Saturday stays free, no penalty
 * This function only determines if a day is a day off, not cost.
 */
export const isWeekend = (d: Date, _sixDayWeek = false) => {
  const day = d.getDay();
  return day === 0 || day === 6; // Saturday & Sunday always free
};

export const isWorkday = (d: Date, sixDayWeek = false) =>
  !isWeekend(d, sixDayWeek) && !isPublicHoliday(d);

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
  _sixDayWeek: boolean
) => {
  let s = new Date(leaveStart);
  while (s > BOUND_START && !isWorkday(addDays(s, -1))) {
    s = addDays(s, -1);
  }
  // Don't extend into the past
  if (s < today) s = new Date(today);

  let e = new Date(leaveEnd);
  while (e < BOUND_END && !isWorkday(addDays(e, 1))) {
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

export const findBestPeriods = (
  nDays: number,
  targetMonth?: number,
  sixDayWeek = false
): CongePeriod[] => {
  const results: CongePeriod[] = [];
  const seen = new Set<string>();
  const scanStart = today > BOUND_START ? today : BOUND_START;

  // Build list of days that can be taken as congé (Mon-Fri only)
  const allWorkdays: Date[] = [];
  for (let d = new Date(scanStart); d <= BOUND_END; d = addDays(d, 1)) {
    if (!isWorkday(d)) continue;
    allWorkdays.push(new Date(d));
  }

  for (let i = 0; i <= allWorkdays.length - nDays; i++) {
    const leaveStart = allWorkdays[i];
    const leaveEnd = allWorkdays[i + nDays - 1];

    const { s, e } = getFullBreakRange(leaveStart, leaveEnd, sixDayWeek);

    // Dedup on full break range
    const key = `${toLocalDateString(s)}|${toLocalDateString(e)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    if (targetMonth !== undefined && !touchesMonth(s, e, targetMonth)) continue;

    const totalDaysOff = diffDays(s, e);
    const holidaysInPeriod: string[] = [];
    let temp = new Date(s);
    while (temp <= e) {
      if (isPublicHoliday(temp)) {
        holidaysInPeriod.push(toLocalDateString(temp));
      }
      temp = addDays(temp, 1);
    }

    // 6-day week penalty: each Friday taken as congé also costs Saturday
    // EXCEPT if Friday is a public holiday — then Saturday is free, no penalty
    let actualCongeUsed = nDays;
    if (sixDayWeek) {
      for (let d = new Date(leaveStart); d <= leaveEnd; d = addDays(d, 1)) {
        if (d.getDay() === 5 && !isPublicHoliday(d)) {
          actualCongeUsed++; // Saturday penalty
        }
      }
    }
  if (actualCongeUsed > nDays) continue;
    const efficiency = totalDaysOff / actualCongeUsed;
    if (efficiency <= 1) continue;

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