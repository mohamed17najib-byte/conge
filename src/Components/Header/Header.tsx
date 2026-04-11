import { useEffect, useState } from 'react';
import './Header.css';
import { getFlagEmoji } from '../../utilitis/utilitis';

export default function Header() {
const [country, setCountry] = useState<{ name: string; code: string } | null>(null);

  useEffect(() => {
 fetch("/api/geo")
  .then(r => r.json())
  .then(d => {
    if (d.country_code && d.country_name) {
      setCountry({ name: d.country_name, code: d.country_code });
    }
  })
  .catch(() => {});
  }, []);

  return (
    <header className="header">
      <div className="header__brand">
        <div className="header__text">
          <span className="header__name">CongéPlus</span>
          <span className="header__tagline">Planificateur de congés</span>
        </div>
      </div>

      <nav className="header__actions">
     {country && (
  <span className="header__country">
    {getFlagEmoji(country.code)} {country.name}
  </span>
)}
        <div className="header__badge">
          <span className="header__badge-dot" />
          2026
        </div>
      </nav>
    </header>
  );
}