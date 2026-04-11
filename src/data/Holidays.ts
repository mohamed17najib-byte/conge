import type { Holiday } from "../types/Holiday";

const CALENDARIFIC_KEY = import.meta.env.VITE_CALENDARIFIC_KEY as string;

// ── Language mapping ──────────────────────────────────────────────────────────
const CALENDARIFIC_LANG: Record<string, string> = {
  fr: 'fr',
  en: 'en',
  ar: 'ar',
};


const moroccoHolidaysFallback: Record<string, Holiday[]> = {
  fr: [
    { date: "2026-01-01", name: "Jour de l'An" },
    { date: "2026-01-11", name: "Manifeste de l'Indépendance" },
    { date: "2026-01-14", name: "Nouvel An Amazigh (Yennayer)" },
    { date: "2026-05-01", name: "Fête du Travail" },
    { date: "2026-07-30", name: "Fête du Trône" },
    { date: "2026-08-14", name: "Journée de Oued Ed-Dahab" },
    { date: "2026-08-20", name: "Révolution du Roi et du Peuple" },
    { date: "2026-08-21", name: "Fête de la Jeunesse" },
    { date: "2026-10-31", name: "Fête de l'Unité" },
    { date: "2026-11-06", name: "Marche Verte" },
    { date: "2026-11-18", name: "Fête de l'Indépendance" },
    { date: "2026-03-20", name: "Aïd al-Fitr — 1er jour" },
    { date: "2026-03-21", name: "Aïd al-Fitr — 2ème jour" },
    { date: "2026-05-27", name: "Aïd al-Adha — 1er jour" },
    { date: "2026-05-28", name: "Aïd al-Adha — 2ème jour" },
    { date: "2026-06-16", name: "Nouvel An Hégirien (1er Mouharram 1448)" },
    { date: "2026-08-25", name: "Aïd al-Mawlid (Naissance du Prophète)" },
  ],
  en: [
    { date: "2026-01-01", name: "New Year's Day" },
    { date: "2026-01-11", name: "Independence Manifesto Day" },
    { date: "2026-01-14", name: "Amazigh New Year (Yennayer)" },
    { date: "2026-05-01", name: "Labour Day" },
    { date: "2026-07-30", name: "Throne Day" },
    { date: "2026-08-14", name: "Oued Ed-Dahab Day" },
    { date: "2026-08-20", name: "Revolution of the King and the People" },
    { date: "2026-08-21", name: "Youth Day" },
    { date: "2026-10-31", name: "Unity Day" },
    { date: "2026-11-06", name: "Green March Day" },
    { date: "2026-11-18", name: "Independence Day" },
    { date: "2026-03-20", name: "Eid al-Fitr — 1st day" },
    { date: "2026-03-21", name: "Eid al-Fitr — 2nd day" },
    { date: "2026-05-27", name: "Eid al-Adha — 1st day" },
    { date: "2026-05-28", name: "Eid al-Adha — 2nd day" },
    { date: "2026-06-16", name: "Islamic New Year (1st Muharram 1448)" },
    { date: "2026-08-25", name: "Prophet's Birthday (Mawlid)" },
  ],
  ar: [
    { date: "2026-01-01", name: "رأس السنة الميلادية" },
    { date: "2026-01-11", name: "ذكرى تقديم وثيقة الاستقلال" },
    { date: "2026-01-14", name: "رأس السنة الأمازيغية (يناير)" },
    { date: "2026-05-01", name: "عيد الشغل" },
    { date: "2026-07-30", name: "عيد العرش" },
    { date: "2026-08-14", name: "ذكرى استرجاع إقليم وادي الذهب" },
    { date: "2026-08-20", name: "ذكرى ثورة الملك والشعب" },
    { date: "2026-08-21", name: "عيد الشباب" },
    { date: "2026-10-31", name: "عيد الوحدة" },
    { date: "2026-11-06", name: "ذكرى المسيرة الخضراء" },
    { date: "2026-11-18", name: "عيد الاستقلال" },
    { date: "2026-03-20", name: "عيد الفطر — اليوم الأول" },
    { date: "2026-03-21", name: "عيد الفطر — اليوم الثاني" },
    { date: "2026-05-27", name: "عيد الأضحى — اليوم الأول" },
    { date: "2026-05-28", name: "عيد الأضحى — اليوم الثاني" },
    { date: "2026-06-16", name: "رأس السنة الهجرية (1 محرم 1448)" },
    { date: "2026-08-25", name: "عيد المولد النبوي الشريف" },
  ],
};

// ── In-memory cache ───────────────────────────────────────────────────────────
const cache = new Map<string, Holiday[]>();

// ── Source 1: Calendarific with language support ──────────────────────────────
async function fetchFromCalendarific(countryCode: string, year: number, lang: string): Promise<Holiday[]> {
  const language = CALENDARIFIC_LANG[lang] ?? 'en';
  const url = `https://calendarific.com/api/v2/holidays?api_key=${CALENDARIFIC_KEY}&country=${countryCode.toUpperCase()}&year=${year}&type=national,religious,observance&language=${language}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Calendarific error: ${res.status}`);
  const data = await res.json();
  if (data.meta?.code !== 200) throw new Error(data.meta?.error_detail ?? 'Calendarific failed');
  const holidays: { date: { iso: string }; name: string }[] = data.response?.holidays ?? [];
  return holidays.map(h => ({
    date: h.date.iso.slice(0, 10),
    name: h.name,
  }));
}

// ── Source 2: Nager.at with locale support ────────────────────────────────────
async function fetchFromNager(countryCode: string, year: number, lang: string): Promise<Holiday[]> {
  const res = await fetch(
    `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode.toUpperCase()}`
  );
  if (!res.ok) throw new Error(`Nager error: ${res.status}`);
  const data: { date: string; localName: string; name: string }[] = await res.json();
  // Nager returns localName (local language) and name (English)
  // Use localName for fr/ar, English name for en
  return data.map(h => ({
    date: h.date,
    name: lang === 'en' ? h.name : (h.localName || h.name),
  }));
}

// ── Merge & deduplicate by date ───────────────────────────────────────────────
function mergeHolidays(sources: Holiday[][]): Holiday[] {
  const seen = new Map<string, Holiday>();
  for (const list of sources) {
    for (const h of list) {
      if (!seen.has(h.date)) seen.set(h.date, h);
    }
  }
  return [...seen.values()].sort((a, b) => a.date.localeCompare(b.date));
}

// ── Main resolver with cache + language ──────────────────────────────────────
export async function resolveHolidays(year = 2026, forceCountry = 'MA', lang = 'fr'): Promise<Holiday[]> {
  const countryCode = forceCountry.toUpperCase();
  const cacheKey = `${countryCode}-${year}-${lang}`; // ← lang is part of cache key

  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  const results = await Promise.allSettled([
    fetchFromCalendarific(countryCode, year, lang),
    fetchFromNager(countryCode, year, lang),
  ]);

  const successful = results
    .filter((r): r is PromiseFulfilledResult<Holiday[]> => r.status === 'fulfilled')
    .map(r => r.value)
    .filter(list => list.length > 0);

  const holidays = successful.length > 0
    ? mergeHolidays(successful)
    : (moroccoHolidaysFallback[lang] ?? moroccoHolidaysFallback.fr);

  cache.set(cacheKey, holidays);
  return holidays;
}