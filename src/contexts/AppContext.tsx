import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Holiday } from '../types/Holiday';
import { resolveHolidays } from '../data/Holidays';

/**
 * ── Weekend configuration per country ─────────────────────────────────────
 *
 * JS day numbers: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
 *
 * Some countries have different weekends depending on sector (public vs private).
 * For those countries we store multiple options and let the user choose.
 *
 * Sources:
 *  - timeanddate.com, flytrippers.com, hireborderless.com
 */

export interface WeekendOption {
  key: string;
  labelFr: string;
  labelEn: string;
  labelAr: string;
  days: number[];
}

export interface CountryWeekendConfig {
  default: number[];
  options?: WeekendOption[]; // if present → user can choose
}

const SAT_SUN: number[] = [0, 6];
const FRI_SAT: number[] = [5, 6];
const FRI_ONLY: number[] = [5];
const THU_FRI: number[] = [4, 5];
const FRI_SUN: number[] = [0, 5];

const WEEKEND_CONFIG: Record<string, CountryWeekendConfig> = {
  // ── Standard Saturday + Sunday (most countries) ─────────────────────────
  MA: { default: SAT_SUN },
  TN: { default: SAT_SUN },
  TR: { default: SAT_SUN },
  ID: { default: SAT_SUN },
  MY: { default: SAT_SUN },

  // ── Countries with sector-dependent weekends ────────────────────────────
  SA: {
    default: FRI_SAT,
    options: [
      {
        key: 'fri_sat',
        labelFr: 'Vendredi + Samedi (secteur privé)',
        labelEn: 'Friday + Saturday (private sector)',
        labelAr: 'الجمعة + السبت (القطاع الخاص)',
        days: FRI_SAT,
      },
      {
        key: 'sat_sun',
        labelFr: 'Samedi + Dimanche (secteur public)',
        labelEn: 'Saturday + Sunday (public sector)',
        labelAr: 'السبت + الأحد (القطاع العام)',
        days: SAT_SUN,
      },
    ],
  },
  AE: {
    default: SAT_SUN,
    options: [
      {
        key: 'sat_sun',
        labelFr: 'Samedi + Dimanche (depuis 2022)',
        labelEn: 'Saturday + Sunday (since 2022)',
        labelAr: 'السبت + الأحد (منذ 2022)',
        days: SAT_SUN,
      },
      {
        key: 'fri_sat',
        labelFr: 'Vendredi + Samedi (ancien / privé)',
        labelEn: 'Friday + Saturday (legacy / private)',
        labelAr: 'الجمعة + السبت (قديم / خاص)',
        days: FRI_SAT,
      },
    ],
  },

  // ── Friday + Saturday ───────────────────────────────────────────────────
  DZ: { default: FRI_SAT },
  BH: { default: FRI_SAT },
  BD: { default: FRI_SAT },
  EG: { default: FRI_SAT },
  IQ: { default: FRI_SAT },
  IL: { default: FRI_SAT },
  JO: { default: FRI_SAT },
  KW: { default: FRI_SAT },
  LY: { default: FRI_SAT },
  MV: { default: FRI_SAT },
  OM: { default: FRI_SAT },
  PS: { default: FRI_SAT },
  QA: { default: FRI_SAT },
  SD: { default: FRI_SAT },
  SY: { default: FRI_SAT },
  YE: { default: FRI_SAT },

  // ── Friday only ─────────────────────────────────────────────────────────
  IR: { default: FRI_ONLY },
  DJ: { default: FRI_ONLY },
  SO: { default: FRI_ONLY },

  // ── Thursday + Friday ───────────────────────────────────────────────────
  AF: { default: THU_FRI },

  // ── Friday + Sunday ─────────────────────────────────────────────────────
  BN: { default: FRI_SUN },
};

/**
 * Get weekend config for a country.
 */
export function getWeekendConfig(countryCode: string): CountryWeekendConfig {
  return WEEKEND_CONFIG[countryCode.toUpperCase()] ?? { default: SAT_SUN };
}

// ── Context ───────────────────────────────────────────────────────────────

interface AppContextType {
  holidays: Holiday[];
  countryCode: string;
  lang: string;
  weekendDays: number[];
  weekendOptions: WeekendOption[] | null; // null = no choice needed
  loadingCountry: boolean;
  setCountryCode: (code: string) => void;
  setLang: (lang: string) => void;
  setWeekendDays: (days: number[]) => void;
}

const AppContext = createContext<AppContextType>({
  holidays: [],
  countryCode: 'MA',
  lang: 'fr',
  weekendDays: [0, 6],
  weekendOptions: null,
  loadingCountry: false,
  setCountryCode: () => {},
  setLang: () => {},
  setWeekendDays: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [countryCode, setCountryCode] = useState('MA');
  const [lang, setLang] = useState('fr');
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [weekendDays, setWeekendDays] = useState<number[]>([0, 6]);
  const [weekendOptions, setWeekendOptions] = useState<WeekendOption[] | null>(null);
  const [loadingCountry, setLoadingCountry] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingCountry(true);
    setHolidays([]);

    // Weekend days — synchronous from local map
    const config = getWeekendConfig(countryCode);
    setWeekendDays(config.default);
    setWeekendOptions(config.options ?? null);

    // Holidays — async from Calendarific + Nager
    resolveHolidays(2026, countryCode, lang).then((h) => {
      if (!cancelled) {
        setHolidays(h);
        setLoadingCountry(false);
      }
    });

    return () => { cancelled = true; };
  }, [countryCode, lang]);

  return (
    <AppContext.Provider
      value={{
        holidays,
        countryCode,
        lang,
        weekendDays,
        weekendOptions,
        loadingCountry,
        setCountryCode,
        setLang,
        setWeekendDays,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);