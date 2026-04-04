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

export const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
export const isPublicHoliday = (d: Date) => holidaySet.has(toLocalDateString(d));
export const isWorkday = (d: Date) => !isWeekend(d) && !isPublicHoliday(d);

const addDays = (d: Date, n: number): Date => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
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

  if (kept.totalDaysOff !== candidate.totalDaysOff) return false;
  if (kept.efficiency !== candidate.efficiency) return false;

  const kHolidays = kept.holidaysInPeriod.join(",");
  const cHolidays = candidate.holidaysInPeriod.join(",");
  if (kHolidays !== cHolidays) return false;

  return true;
};

export const findBestPeriods = (
  nDays: number,
  targetMonth?: number
): CongePeriod[] => {
  const results: CongePeriod[] = [];
  const seen = new Set<string>();
  const scanStart = today > BOUND_START ? today : BOUND_START;

  const allWorkdays: Date[] = [];
  for (let d = new Date(scanStart); d <= BOUND_END; d = addDays(d, 1)) {
    if (isWorkday(d)) allWorkdays.push(new Date(d));
  }

  for (let i = 0; i <= allWorkdays.length - nDays; i++) {
    const leaveStart = allWorkdays[i];
    const leaveEnd = allWorkdays[i + nDays - 1];

    const { s, e } = getFullBreakRange(leaveStart, leaveEnd);

    // Dedup on full break range — this is what the user sees
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

    const efficiency = totalDaysOff / nDays;

    results.push({
      start: s,    // full break start (includes weekend before)
      end: e,      // full break end (includes weekend after)
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