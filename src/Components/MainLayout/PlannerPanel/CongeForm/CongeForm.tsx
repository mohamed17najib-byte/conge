import React, { useState } from 'react';
import './CongeForm.css';

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const currentMonth = new Date().getMonth();
const futureMonths = MONTHS_FR.map((name, i) => ({ name, index: i }))
  .filter((m) => m.index >= currentMonth);

interface Props {
  onSubmit: (days: number, month?: number) => void;
  loading: boolean;
}

export default function CongeForm({ onSubmit, loading }: Props) {
  const [days, setDays] = useState<string>('');
  const [month, setMonth] = useState<string>('');

  const handleSubmit = () => {
    const n = parseInt(days);
    if (!n || n < 1 || n > 30) return;
    onSubmit(n, month !== '' ? parseInt(month) : undefined);
  };

  return (
    <div className="conge-form">
      <p className="conge-form__title">Optimiser mes congés</p>
      <p className="conge-form__desc">
        Entrez vos jours disponibles et l'algorithme trouve les meilleures périodes.
      </p>

      <div className="conge-form__field">
        <label className="conge-form__label">Jours de congé disponibles</label>
        <div className="conge-form__row">
          <button
            className="conge-form__stepper"
            onClick={() => setDays((d) => String(Math.max(1, (parseInt(d) || 0) - 1)))}
          >−</button>
          <input
            className="conge-form__input"
            type="number"
            min={1}
            max={30}
            value={days}
            onChange={(e) => setDays(e.target.value)}
            placeholder="ex: 5"
          />
          <button
            className="conge-form__stepper"
            onClick={() => setDays((d) => String(Math.min(30, (parseInt(d) || 0) + 1)))}
          >+</button>
        </div>
      </div>

      <div className="conge-form__field">
        <label className="conge-form__label">
          Mois souhaité
          <span className="conge-form__optional">optionnel</span>
        </label>
        <select
          className="conge-form__select"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        >
          <option value="">Meilleur mois automatique</option>
          {futureMonths.map((m) => (
            <option key={m.index} value={m.index}>{m.name} 2026</option>
          ))}
        </select>
      </div>

      <button
        className="conge-form__btn"
        onClick={handleSubmit}
        disabled={!days || loading}
      >
        {loading ? 'Calcul...' : 'Trouver les meilleures périodes ✦'}
      </button>
    </div>
  );
}