import { useState } from 'react';
import './MainLayout.css';
import HolidayCalendar from './CalendarPanel/HolidayCalendar';
import PlannerPanel from './PlannerPanel/PlannerPanel';
import { type CongePeriod } from '../../utilitis/congeAlgo';

export default function MainLayout() {
  const [selectedPeriod, setSelectedPeriod] = useState<CongePeriod | null>(null);
  const [activeTab, setActiveTab] = useState<'calendar' | 'planner'>('calendar');

  return (
    <div className="main-layout">

      {/* Mobile tabs */}
      <div className="main-layout__tabs">
        <button
          className={`main-layout__tab ${activeTab === 'calendar' ? 'main-layout__tab--active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          Calendrier
        </button>
        <button
          className={`main-layout__tab ${activeTab === 'planner' ? 'main-layout__tab--active' : ''}`}
          onClick={() => setActiveTab('planner')}
        >
          Planifier
        </button>
      </div>

      <div className="main-layout__body">

        {/* LEFT: explainer + calendar */}
        <div className={`main-layout__left ${activeTab === 'calendar' ? 'main-layout__panel--active' : ''}`}>
          <div className="main-layout__explainer">
  <div className="explainer-card">
    <div className="explainer-card__icon-wrap">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="3" width="16" height="15" rx="3" stroke="#c45c3a" strokeWidth="1.5" fill="none"/>
        <path d="M2 7h16" stroke="#c45c3a" strokeWidth="1.5"/>
        <rect x="5.5" y="10" width="2.5" height="2.5" rx="0.5" fill="#b8943f"/>
        <rect x="8.75" y="10" width="2.5" height="2.5" rx="0.5" fill="#b8943f"/>
        <rect x="12" y="10" width="2.5" height="2.5" rx="0.5" fill="#c45c3a"/>
        <rect x="5.5" y="13.5" width="2.5" height="2.5" rx="0.5" fill="#b8943f"/>
        <rect x="8.75" y="13.5" width="2.5" height="2.5" rx="0.5" fill="#b8943f"/>
        <path d="M6.5 1.5v3M13.5 1.5v3" stroke="#c45c3a" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
    <div className="explainer-card__body">
      <strong>Jours fériés marocains</strong>
      <p>Tous les jours fériés officiels sont marqués pour vous aider à planifier au mieux.</p>
    </div>
  </div>

  <div className="explainer-card">
    <div className="explainer-card__icon-wrap">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 10h14" stroke="#c45c3a" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M10 3v14" stroke="#c45c3a" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M5.5 5.5L10 10l4.5-4.5" stroke="#b8943f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="10" cy="10" r="7.5" stroke="#c45c3a" strokeWidth="1.5"/>
        <path d="M7 13l6-6" stroke="#b8943f" strokeWidth="1.2" strokeLinecap="round"/>
        <circle cx="7.5" cy="13.5" r="1" fill="#b8943f"/>
        <circle cx="12.5" cy="7.5" r="1" fill="#c45c3a"/>
      </svg>
    </div>
    <div className="explainer-card__body">
      <strong>Posez moins, profitez plus</strong>
      <p>Notre algorithme trouve les ponts idéaux pour maximiser vos vacances.</p>
    </div>
  </div>

  <div className="explainer-card">
    <div className="explainer-card__icon-wrap">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="7.5" stroke="#c45c3a" strokeWidth="1.5"/>
        <circle cx="10" cy="10" r="4.5" stroke="#b8943f" strokeWidth="1.5"/>
        <circle cx="10" cy="10" r="1.75" fill="#c45c3a"/>
        <path d="M10 2.5V4M10 16v1.5M2.5 10H4M16 10h1.5" stroke="#c45c3a" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M13 4.2l-.8 1.4" stroke="#b8943f" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    </div>
    <div className="explainer-card__body">
      <strong>Personnalisé pour vous</strong>
      <p>Indiquez combien de jours vous avez et obtenez un plan sur mesure.</p>
    </div>
  </div>
</div>

          <HolidayCalendar highlightPeriod={selectedPeriod} />
        </div>

        {/* RIGHT: planner */}
        <div className={`main-layout__planner ${activeTab === 'planner' ? 'main-layout__panel--active' : ''}`}>
          <PlannerPanel onPeriodSelect={setSelectedPeriod} />
        </div>

      </div>
    </div>
  );
}