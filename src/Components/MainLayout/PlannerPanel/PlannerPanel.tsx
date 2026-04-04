import  { useState } from 'react';
import './PlannerPanel.css';
import CongeForm from './CongeForm/CongeForm';
import CongeResult from './CongeResult/CongeResult';
import { findBestPeriods, type CongePeriod } from '../../../utilitis/congeAlgo';
interface Props {
  onPeriodSelect: (p: CongePeriod | null) => void;
}

export default function PlannerPanel({ onPeriodSelect }: Props) {
  const [periods, setPeriods] = useState<CongePeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hasResult, setHasResult] = useState(false);

  const handleSubmit = (days: number, month?: number) => {
    setLoading(true);
    setSelectedIndex(null);
    onPeriodSelect(null);
    setTimeout(() => {
      const results = findBestPeriods(days, month);
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
      <CongeForm onSubmit={handleSubmit} loading={loading} />

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
          Calcul en cours...
        </div>
      )}
    </div>
  );
}