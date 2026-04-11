import { useState } from 'react';
import './PlannerPanel.css';
import CongeForm from './CongeForm/CongeForm';
import CongeResult from './CongeResult/CongeResult';
import { findBestPeriods, type CongePeriod } from '../../../utilitis/congeAlgo';
import { useApp } from '../../../contexts/AppContext';
import { t } from '../../../i18n/translations';
import type { Lang } from '../../../i18n/translations';

interface Props {
  onPeriodSelect: (p: CongePeriod | null) => void;
  onSixDayWeekChange: (value: boolean) => void;
}

export default function PlannerPanel({ onPeriodSelect, onSixDayWeekChange }: Props) {
  const [periods, setPeriods] = useState<CongePeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hasResult, setHasResult] = useState(false);
  const { holidays, weekendDays, loadingCountry, lang } = useApp();
  const tr = t[lang as Lang] ?? t.fr;

  const handleSubmit = (days: number, month?: number, sixDayWeek?: boolean) => {
    setLoading(true);
    setSelectedIndex(null);
    onPeriodSelect(null);
    onSixDayWeekChange(sixDayWeek ?? false);
    setTimeout(() => {
      const results = findBestPeriods(days, holidays, weekendDays, month, sixDayWeek ?? false);
      setPeriods(results);
      setHasResult(true);
      setLoading(false);
      if (results.length > 0) {
        setSelectedIndex(0);
        onPeriodSelect(results[0]);
      }
    }, 400);
  };

  const handleSelect = (p: CongePeriod, i: number) => {
    setSelectedIndex(i);
    onPeriodSelect(p);
  };

  return (
    <div className="planner-panel">
      <CongeForm onSubmit={handleSubmit} loading={loading || loadingCountry} />

      {hasResult && !loading && (
        <div className="planner-panel__divider" />
      )}

      {!loading && hasResult && (
        <CongeResult
          periods={periods}
          selectedIndex={selectedIndex}
          onSelect={(p) => handleSelect(p, periods.indexOf(p))}
        />
      )}

      {loading && (
        <div className="planner-panel__loading">
          <span className="planner-panel__spinner">✦</span>
          {tr.calculating}
        </div>
      )}
    </div>
  );
}