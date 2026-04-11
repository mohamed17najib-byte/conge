import { useState } from 'react';
import './CongeForm.css';
import { useApp } from '../../../../contexts/AppContext';
import { t } from '../../../../i18n/translations';
import type { Lang } from '../../../../i18n/translations';

interface Props {
  onSubmit: (days: number, month?: number, sixDayWeek?: boolean) => void;
  loading: boolean;
}

export default function CongeForm({ onSubmit, loading }: Props) {
  const { lang } = useApp();
  const tr = t[lang as Lang] ?? t.fr;

  const [days, setDays] = useState<string>('');
  const [month, setMonth] = useState<string>('');
  const [sixDayWeek, setSixDayWeek] = useState(false);

  const currentMonth = new Date().getMonth();
  const futureMonths = tr.months
    .map((name, i) => ({ name, index: i }))
    .filter((m) => m.index >= currentMonth);

  const handleSubmit = () => {
    const n = parseInt(days);
    if (!n || n < 1 || n > 30) return;
    onSubmit(n, month !== '' ? parseInt(month) : undefined, sixDayWeek);
  };

  return (
    <div className="conge-form">
      <p className="conge-form__title">{tr.formTitle}</p>
      <p className="conge-form__desc">{tr.formDesc}</p>

      <div className="conge-form__field">
        <label className="conge-form__label">{tr.daysLabel}</label>
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
          {tr.monthLabel}
          <span className="conge-form__optional">{tr.monthOptional}</span>
        </label>
        <select
          className="conge-form__select"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        >
          <option value="">{tr.monthAuto}</option>
          {futureMonths.map((m) => (
            <option key={m.index} value={m.index}>{m.name} 2026</option>
          ))}
        </select>
      </div>

      <div className="conge-form__field">
        <label
          className="conge-form__toggle"
          onClick={() => setSixDayWeek((v) => !v)}
        >
          <span className={`conge-form__checkbox ${sixDayWeek ? 'conge-form__checkbox--checked' : ''}`}>
            {sixDayWeek && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6.5L5 9L9.5 3.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </span>
          <span className="conge-form__toggle-text">
            <span className="conge-form__toggle-title">{tr.sixDayTitle}</span>
            <span className="conge-form__toggle-hint">{tr.sixDayHint}</span>
          </span>
        </label>
      </div>

      <button
        className="conge-form__btn"
        onClick={handleSubmit}
        disabled={!days || loading}
      >
        {loading ? tr.calculating : tr.submitBtn}
      </button>
    </div>
  );
}