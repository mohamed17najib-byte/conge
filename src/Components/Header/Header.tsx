import React from 'react';
import './Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="header__brand">
        <span className="header__diamond">✦</span>
        <span className="header__name">Maroc Fériés</span>
      </div>
    </header>
  );
}