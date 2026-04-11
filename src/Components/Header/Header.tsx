import { useEffect, useState } from 'react';
import './Header.css';

export default function Header() {
  const [country, setCountry] = useState<string | null>(null);

  useEffect(() => {
   fetch("/api/geo")
      .then(r => r.json())
      .then(d => setCountry(d.country_name));
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
          <span className="header__country">📍 {country}</span>
        )}
        <div className="header__badge">
          <span className="header__badge-dot" />
          2026
        </div>
      </nav>
    </header>
  );
}