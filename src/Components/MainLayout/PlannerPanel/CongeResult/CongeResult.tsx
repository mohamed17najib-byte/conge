import React from 'react';
import './CongeResult.css';
import type { CongePeriod } from '../../../../utilitis/congeAlgo';

const MONTHS_FR = [
  'jan', 'fév', 'mar', 'avr', 'mai', 'jun',
  'jul', 'aoû', 'sep', 'oct', 'nov', 'déc',
];

const formatDate = (d: Date) =>
  `${d.getDate()} ${MONTHS_FR[d.getMonth()]}`;

const MEDALS = ['✦', '◆', '◇'];

interface Props {
  periods: CongePeriod[];
  onSelect: (p: CongePeriod) => void;
  selectedIndex: number | null;
}

export default function CongeResult({ periods, onSelect, selectedIndex }: Props) {
  if (periods.length === 0) {
    return (
      <div className="conge-result__empty">
        Aucune période trouvée pour ce mois.
      </div>
    );
  }

  return (
    <div className="conge-result">
      <p className="conge-result__title">Meilleures périodes</p>
      {periods.map((p, i) => (
        <button
          key={i}
          className={`conge-result__card ${selectedIndex === i ? 'conge-result__card--active' : ''}`}
          onClick={() => onSelect(p)}
        >
          <div className="conge-result__card-top">
            <span className="conge-result__medal">{MEDALS[i]}</span>
            <span className="conge-result__dates">
              {formatDate(p.start)} → {formatDate(p.end)}
            </span>
            <span className="conge-result__eff">
              ×{p.efficiency.toFixed(1)}
            </span>
          </div>
          <div className="conge-result__card-stats">
            <span>{p.congeUsed}j posés</span>
            <span className="conge-result__dot-sep">·</span>
            <span>{p.totalDaysOff}j de repos total</span>
            {p.holidaysInPeriod.length > 0 && (
              <>
                <span className="conge-result__dot-sep">·</span>
                <span className="conge-result__holidays">
                  {p.holidaysInPeriod.length} férié{p.holidaysInPeriod.length > 1 ? 's' : ''} inclus
                </span>
              </>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}