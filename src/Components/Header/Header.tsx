import './Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="header__brand">
      
        <div className="header__text">
          <span className="header__name">CongéPlus</span>
          <span className="header__tagline">Planificateur de congés</span>
        </div>
      </div>

      <nav className="header__actions">
        <div className="header__badge">
          <span className="header__badge-dot" />
          2026
        </div>
      </nav>
    </header>
  );
}