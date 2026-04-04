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
      {/* Mobile tab switcher — hidden on desktop */}
      <div className="main-layout__tabs">
        <button
          className={`main-layout__tab ${activeTab === 'calendar' ? 'main-layout__tab--active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          Calendar
        </button>
        <button
          className={`main-layout__tab ${activeTab === 'planner' ? 'main-layout__tab--active' : ''}`}
          onClick={() => setActiveTab('planner')}
        >
          Planner
        </button>
      </div>

      <div className="main-layout__body">
        <div className={`main-layout__calendar ${activeTab === 'calendar' ? 'main-layout__panel--active' : ''}`}>
          <HolidayCalendar highlightPeriod={selectedPeriod} />
        </div>
        <div className={`main-layout__planner ${activeTab === 'planner' ? 'main-layout__panel--active' : ''}`}>
          <PlannerPanel onPeriodSelect={setSelectedPeriod} />
        </div>
      </div>
    </div>
  );
}