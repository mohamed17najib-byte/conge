import './Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="header__brand">
        <div className="header__logo">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1L9.8 5.8L15 6.3L11.2 9.7L12.4 15L8 12.3L3.6 15L4.8 9.7L1 6.3L6.2 5.8L8 1Z"
              fill="white" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
          </svg>
        </div>
        <div className="header__text">
          <span className="header__name">Maroc Fériés</span>
          <span className="header__tagline">Planificateur de congés</span>
        </div>
      </div>

      <div className="header__badge">
        <span className="header__badge-dot" />
        2026
      </div>
    </header>
  );
}