import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Holiday } from '../types/Holiday';
import { resolveHolidays } from '../data/Holidays';

/**
 * Weekend fallback — JS day numbers: 0=Sun, 1=Mon … 5=Fri, 6=Sat
 *
 * Morocco: Saturday + Sunday off (NOT Friday)
 * Gulf states (SA, AE, etc.): Friday + Saturday off
 * Iran/Afghanistan: Friday only off
 */
const WEEKEND_FALLBACK: Record<string, number[]> = {
  MA: [0, 6], DZ: [0, 5], TN: [0, 6], LY: [5, 6],
  SA: [5, 6], AE: [5, 6], BH: [5, 6], KW: [5, 6], QA: [5, 6], OM: [5, 6],
  IR: [5], AF: [5],
};

async function fetchWeekendDays(countryCode: string): Promise<number[]> {
  const code = countryCode.toUpperCase();

  // If we have a known fallback for this country, trust it over the API
  // (Nager.at sometimes returns incomplete data, e.g. only "Saturday" for Morocco)
  if (WEEKEND_FALLBACK[code]) {
    return WEEKEND_FALLBACK[code];
  }

  // For unknown countries, try the API
  try {
    const res = await fetch(`https://date.nager.at/api/v3/CountryInfo/${code}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    const nameToDay: Record<string, number> = {
      Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
      Thursday: 4, Friday: 5, Saturday: 6,
    };
    if (data.weekendDays?.length) {
      const days = data.weekendDays
        .map((name: string) => nameToDay[name] ?? -1)
        .filter((n: number) => n >= 0);
      if (days.length > 0) return days;
    }
  } catch {}

  // Ultimate fallback: Saturday + Sunday
  return [0, 6];
}

interface AppContextType {
  holidays: Holiday[];
  countryCode: string;
  lang: string;
  weekendDays: number[];
  loadingCountry: boolean;
  setCountryCode: (code: string) => void;
  setLang: (lang: string) => void;
}

const AppContext = createContext<AppContextType>({
  holidays: [],
  countryCode: 'MA',
  lang: 'fr',
  weekendDays: [0, 6],
  loadingCountry: false,
  setCountryCode: () => {},
  setLang: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [countryCode, setCountryCode] = useState('MA');
  const [lang, setLang] = useState('fr');
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [weekendDays, setWeekendDays] = useState<number[]>([0, 6]);
  const [loadingCountry, setLoadingCountry] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingCountry(true);
    setHolidays([]);

    Promise.all([
      resolveHolidays(2026, countryCode, lang),
      fetchWeekendDays(countryCode),
    ]).then(([h, w]) => {
      if (!cancelled) {
        setHolidays(h);
        setWeekendDays(w);
        setLoadingCountry(false);
      }
    });

    return () => { cancelled = true; };
  }, [countryCode, lang]);

  return (
    <AppContext.Provider value={{ holidays, countryCode, lang, weekendDays, loadingCountry, setCountryCode, setLang }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);