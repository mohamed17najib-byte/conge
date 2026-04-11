import { useEffect, useState, useRef } from 'react';
import { loadCountries } from '../../constants/countries';
import type { Country } from '../../constants/countries';
import { useApp } from '../../contexts/AppContext';
import { t } from '../../i18n/translations';
import type { Lang } from '../../i18n/translations';
import './Header.css';

const LANGUAGES = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
];

export default function Header() {
  const { setCountryCode, setLang: setGlobalLang, lang } = useApp();
  const tr = t[lang as Lang] ?? t.fr;

  const [country, setCountry] = useState<Country | null>(null);
  const [countryList, setCountryList] = useState<Country[]>([]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // Détection IP
  useEffect(() => {
    fetch('/api/geo')
      .then(r => r.json())
      .then(d => {
        if (d.country_code && d.country_name) {
          setCountry({ name: d.country_name, code: d.country_code });
          setCountryCode(d.country_code);
        }
      })
      .catch(() => {});
  }, []);

  // Chargement liste pays selon langue
  useEffect(() => {
    loadCountries(lang).then(setCountryList);
  }, [lang]);

  // Fermer dropdowns si clic extérieur
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setShowCountryDropdown(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setShowLangDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  function selectCountry(c: Country) {
    setCountry(c);
    setShowCountryDropdown(false);
    setCountryCode(c.code);
  }

  function selectLang(code: string) {
    setShowLangDropdown(false);
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
    setGlobalLang(code);
  }

  const currentLang = LANGUAGES.find(l => l.code === lang);

  return (
    <header className="header">
      <div className="header__brand">
        <div className="header__text">
          <span className="header__name">CongéPlus</span>
          <span className="header__tagline">{tr.tagline}</span>
        </div>
      </div>

      <nav className="header__actions">

        {/* ── Sélecteur Pays ── */}
        <div className="header__dropdown" ref={countryRef}>
          <button
            className="header__dropdown-btn"
            onMouseDown={(e) => {
              e.stopPropagation();
              setShowCountryDropdown(p => !p);
              setShowLangDropdown(false);
            }}
          >
            {country ? (
              <>
                <img
                  src={`https://flagcdn.com/20x15/${country.code.toLowerCase()}.png`}
                  alt={country.name}
                  width={20} height={15}
                  style={{ borderRadius: '2px' }}
                />
                <span>{country.name}</span>
              </>
            ) : (
              <span style={{ opacity: 0.5 }}>{tr.countryPlaceholder}</span>
            )}
            <span className="header__chevron">▾</span>
          </button>

          {showCountryDropdown && (
            <ul className="header__dropdown-list">
              {countryList.length === 0 ? (
                <li className="header__dropdown-item" style={{ opacity: 0.5 }}>
                  {tr.calculating}
                </li>
              ) : (
                countryList.map(c => (
                  <li
                    key={c.code}
                    className={`header__dropdown-item ${country?.code === c.code ? 'header__dropdown-item--active' : ''}`}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => selectCountry(c)}
                  >
                    <img
                      src={`https://flagcdn.com/20x15/${c.code.toLowerCase()}.png`}
                      alt={c.name}
                      width={20} height={15}
                      style={{ borderRadius: '2px' }}
                    />
                    {c.name}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        {/* ── Sélecteur Langue ── */}
        <div className="header__dropdown" ref={langRef}>
          <button
            className="header__dropdown-btn"
            onMouseDown={(e) => {
              e.stopPropagation();
              setShowLangDropdown(p => !p);
              setShowCountryDropdown(false);
            }}
          >
            <span>{currentLang?.label}</span>
            <span className="header__chevron">▾</span>
          </button>

          {showLangDropdown && (
            <ul className="header__dropdown-list">
              {LANGUAGES.map(l => (
                <li
                  key={l.code}
                  className={`header__dropdown-item ${lang === l.code ? 'header__dropdown-item--active' : ''}`}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => selectLang(l.code)}
                >
                  {l.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Badge année ── */}
        <div className="header__badge">
          <span className="header__badge-dot" />
          2026
        </div>

      </nav>
    </header>
  );
}