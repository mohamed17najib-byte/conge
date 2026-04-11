import './CongeResult.css';
import type { CongePeriod } from '../../../../utilitis/congeAlgo';
import { useApp } from '../../../../contexts/AppContext';
import { t } from '../../../../i18n/translations';
import type { Lang } from '../../../../i18n/translations';

const MEDALS = ['✦', '◆', '◇'];

interface Props {
  periods: CongePeriod[];
  onSelect: (p: CongePeriod) => void;
  selectedIndex: number | null;
}

export default function CongeResult({ periods, onSelect, selectedIndex }: Props) {
  const { lang } = useApp();
  const tr = t[lang as Lang] ?? t.fr;

  const formatDate = (d: Date) =>
    `${d.getDate()} ${tr.months[d.getMonth()].slice(0, 3).toLowerCase()}`;

  if (periods.length === 0) {
    return (
      <div className="conge-result__empty">
        {tr.noPeriods}
      </div>
    );
  }

  return (
    <div className="conge-result">
      <p className="conge-result__title">{tr.bestPeriods}</p>
      {periods.map((p, i) => (
        <button
          key={i}
          className={`conge-result__card ${selectedIndex === i ? 'conge-result__card--active' : ''}`}
          onClick={() => onSelect(p)}
        >
          <div className="conge-result__card-top">
            <span className="conge-result__medal">{MEDALS[i] ?? '·'}</span>
            <span className="conge-result__dates">
              {formatDate(p.start)} → {formatDate(p.end)}
            </span>
            <span className="conge-result__eff">
              ×{p.efficiency.toFixed(1)}
            </span>
          </div>
          <div className="conge-result__card-stats">
            <span>{p.congeUsed}{tr.daysUsed}</span>
            <span className="conge-result__dot-sep">·</span>
            <span>{p.totalDaysOff}{tr.totalRest}</span>
            {p.holidaysInPeriod.length > 0 && (
              <>
                <span className="conge-result__dot-sep">·</span>
                <span className="conge-result__holidays">
                  {p.holidaysInPeriod.length} {p.holidaysInPeriod.length > 1 ? tr.holidays : tr.holiday}
                </span>
              </>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}