import React, { useState } from 'react';
import './MainLayout.css';
import HolidayCalendar from './CalendarPanel/HolidayCalendar';
import PlannerPanel from './PlannerPanel/PlannerPanel';
import { type CongePeriod } from '../../utilitis/congeAlgo';

export default function MainLayout() {
  const [selectedPeriod, setSelectedPeriod] = useState<CongePeriod | null>(null);

  return (
    <div className="main-layout">
      <div className="main-layout__calendar">
        <HolidayCalendar highlightPeriod={selectedPeriod} />
      </div>
      <div className="main-layout__planner">
        <PlannerPanel onPeriodSelect={setSelectedPeriod} />
      </div>
    </div>
  );
}