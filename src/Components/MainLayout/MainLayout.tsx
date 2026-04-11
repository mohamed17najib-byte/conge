import { useState } from 'react';
import './MainLayout.css';
import HolidayCalendar from './CalendarPanel/HolidayCalendar';
import PlannerPanel from './PlannerPanel/PlannerPanel';
import { type CongePeriod } from '../../utilitis/congeAlgo';
import { useApp } from '../../contexts/AppContext';
import { t } from '../../i18n/translations';
import type { Lang } from '../../i18n/translations';

export default function MainLayout() {
  const { lang } = useApp();
  const tr = t[lang as Lang] ?? t.fr;

  const [selectedPeriod, setSelectedPeriod] = useState<CongePeriod | null>(null);
  const [sixDayWeek, setSixDayWeek] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'planner'>('calendar');

  return (
    <div className="main-layout">

      {/* Mobile tabs */}
      <div className="main-layout__tabs">
        <button
          className={`main-layout__tab ${activeTab === 'calendar' ? 'main-layout__tab--active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          {tr.calendar}
        </button>
        <button
          className={`main-layout__tab ${activeTab === 'planner' ? 'main-layout__tab--active' : ''}`}
          onClick={() => setActiveTab('planner')}
        >
          {tr.planner}
        </button>
      </div>

      <div className="main-layout__body">

        {/* LEFT: explainer + calendar */}
        <div className={`main-layout__left ${activeTab === 'calendar' ? 'main-layout__panel--active' : ''}`}>
          <div className="main-layout__explainer">

            <div className="explainer-card">
              <div className="explainer-card__icon-wrap">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="3" width="16" height="15" rx="3" stroke="#2e6da4" strokeWidth="1.5" fill="none"/>
                  <path d="M2 7h16" stroke="#2e6da4" strokeWidth="1.5"/>
                  <rect x="5.5" y="10" width="2.5" height="2.5" rx="0.5" fill="#4a9eca"/>
                  <rect x="8.75" y="10" width="2.5" height="2.5" rx="0.5" fill="#4a9eca"/>
                  <rect x="12" y="10" width="2.5" height="2.5" rx="0.5" fill="#2e6da4"/>
                  <rect x="5.5" y="13.5" width="2.5" height="2.5" rx="0.5" fill="#4a9eca"/>
                  <rect x="8.75" y="13.5" width="2.5" height="2.5" rx="0.5" fill="#4a9eca"/>
                  <path d="M6.5 1.5v3M13.5 1.5v3" stroke="#2e6da4" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="explainer-card__body">
                <strong>{tr.card1Title}</strong>
                <p>{tr.card1Desc}</p>
              </div>
            </div>

            <div className="explainer-card">
              <div className="explainer-card__icon-wrap">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="7.5" stroke="#2e6da4" strokeWidth="1.5"/>
                  <path d="M6.5 13.5 L10 6.5 L13.5 13.5" stroke="#2e6da4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7.5 11.5h5" stroke="#4a9eca" strokeWidth="1.2" strokeLinecap="round"/>
                  <circle cx="10" cy="6.5" r="1" fill="#2e6da4"/>
                  <path d="M10 14v1" stroke="#4a9eca" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="explainer-card__body">
                <strong>{tr.card2Title}</strong>
                <p>{tr.card2Desc}</p>
              </div>
            </div>

            <div className="explainer-card">
              <div className="explainer-card__icon-wrap">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="7.5" stroke="#2e6da4" strokeWidth="1.5"/>
                  <circle cx="10" cy="10" r="4.5" stroke="#4a9eca" strokeWidth="1.5"/>
                  <circle cx="10" cy="10" r="1.75" fill="#2e6da4"/>
                  <path d="M10 2.5V4M10 16v1.5M2.5 10H4M16 10h1.5" stroke="#2e6da4" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M14.2 5.8l-1 1" stroke="#4a9eca" strokeWidth="1.2" strokeLinecap="round"/>
                  <path d="M5.8 14.2l-1 1" stroke="#4a9eca" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="explainer-card__body">
                <strong>{tr.card3Title}</strong>
                <p>{tr.card3Desc}</p>
              </div>
            </div>

          </div>

          <HolidayCalendar highlightPeriod={selectedPeriod} sixDayWeek={sixDayWeek} />
        </div>

        {/* RIGHT: planner */}
        <div className={`main-layout__planner ${activeTab === 'planner' ? 'main-layout__panel--active' : ''}`}>
          <PlannerPanel onPeriodSelect={setSelectedPeriod} onSixDayWeekChange={setSixDayWeek} />
        </div>

      </div>
    </div>
  );
}