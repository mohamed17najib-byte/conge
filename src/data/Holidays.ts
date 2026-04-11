// constants/moroccoHolidays.ts
import type { Holiday } from "../types/Holiday";

const moroccoHolidaysFallback: Holiday[] = [
  // ── Fêtes Nationales ───────────────────────────────────────────
  { date: "2026-01-01", name: "Jour de l'An" },                          // رأس السنة الميلادية
  { date: "2026-01-11", name: "Manifeste de l'Indépendance" },           // ذكرى تقديم وثيقة الاستقلال
  { date: "2026-01-14", name: "Nouvel An Amazigh (Yennayer)" },          // رأس السنة الأمازيغية
  { date: "2026-05-01", name: "Fête du Travail" },                       // عيد الشغل
  { date: "2026-07-30", name: "Fête du Trône" },                         // عيد العرش
  { date: "2026-08-14", name: "Journée de Oued Ed-Dahab" },             // ذكرى استرجاع إقليم وادي الذهب
  { date: "2026-08-20", name: "Révolution du Roi et du Peuple" },       // ذكرى ثورة الملك والشعب
  { date: "2026-08-21", name: "Fête de la Jeunesse" },                   // عيد الشباب
  { date: "2026-10-31", name: "Fête de l'Unité" },                       // عيد الوحدة
  { date: "2026-11-06", name: "Marche Verte" },                          // ذكرى المسيرة الخضراء
  { date: "2026-11-18", name: "Fête de l'Indépendance" },               // عيد الاستقلال
  // ── Fêtes Islamiques ──────────────────────────────────────────
  { date: "2026-03-20", name: "Aïd al-Fitr — 1er jour" },              // عيد الفطر
  { date: "2026-03-21", name: "Aïd al-Fitr — 2ème jour" },             // عيد الفطر
  { date: "2026-05-27", name: "Aïd al-Adha — 1er jour" },              // عيد الأضحى
  { date: "2026-05-28", name: "Aïd al-Adha — 2ème jour" },             // عيد الأضحى
  { date: "2026-06-16", name: "Nouvel An Hégirien (1er Mouharram 1448)" }, // رأس السنة الهجرية
  { date: "2026-08-25", name: "Aïd al-Mawlid (Naissance du Prophète)" },  // عيد المولد النبوي الشريف
];

async function fetchFromAPI(countryCode: string, year: number): Promise<Holiday[]> {
  const res = await fetch(
    `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode.toUpperCase()}`
  );
  if (!res.ok) throw new Error(`No data for ${countryCode}`);
  const data = await res.json();
  return data.map((h: { date: string; localName: string; name: string }) => ({
    date: h.date,
    name: h.localName || h.name,
  }));
}

async function detectCountryCode(): Promise<string> {
  const res = await fetch("/api/geo");
  const data = await res.json();
  return (data.country_code as string) ?? "MA";
}

async function resolveHolidays(year = 2026, forceCountry?: string): Promise<Holiday[]> {
  try {
    const countryCode = forceCountry?.toUpperCase() ?? await detectCountryCode();

    if (countryCode === "MA") {
      try {
        const apiData = await fetchFromAPI("MA", year);
        return apiData.length >= 15 ? apiData : moroccoHolidaysFallback;
      } catch {
        return moroccoHolidaysFallback;
      }
    }

    return await fetchFromAPI(countryCode, year);
  } catch {
    return moroccoHolidaysFallback;
  }
}

// ── Export identique à ton fichier original ────────────────────────────────────
// Démarre avec le fallback MA, se met à jour automatiquement via l'IP
export let moroccoHolidays: Holiday[] = moroccoHolidaysFallback;

// Lance le chargement immédiatement au import du fichier
resolveHolidays().then((holidays) => {
  moroccoHolidays = holidays;
});