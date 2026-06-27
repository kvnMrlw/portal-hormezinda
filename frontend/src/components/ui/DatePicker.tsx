import { CalendarDays } from 'lucide-react';
import { useMemo, useState } from 'react';

import { cn } from '../../lib/utils';

type DatePickerProps = {
  error?: string;
  label: string;
  name: string;
  onChange: (value: string) => void;
  value: string;
};

function isoToBrazilianDate(value: string): string {
  if (!value) {
    return '';
  }

  const [year, month, day] = value.split('-');

  return `${day}/${month}/${year}`;
}

function brazilianDateToIso(value: string): string {
  const [day, month, year] = value.split('/');

  if (!day || !month || !year) {
    return value;
  }

  return `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export function DatePicker({ error, label, name, onChange, value }: DatePickerProps) {
  const [manualValue, setManualValue] = useState(() => isoToBrazilianDate(value));
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  function handleManualChange(nextValue: string): void {
    setManualValue(nextValue);

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(nextValue)) {
      onChange(brazilianDateToIso(nextValue));
    } else {
      onChange(nextValue);
    }
  }

  function handleCalendarChange(nextValue: string): void {
    onChange(nextValue);
    setManualValue(isoToBrazilianDate(nextValue));
  }

  return (
    <label className="block">
      <span className="text-sm font-medium text-brand-navy">{label}</span>
      <div className="mt-2 grid gap-3 sm:grid-cols-[1fr_auto]">
        <input
          className={cn(
            'w-full rounded-2xl border bg-white px-4 py-3 text-sm text-brand-navy outline-none transition placeholder:text-slate-400 focus:ring-4',
            error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-brand-blue focus:ring-blue-100'
          )}
          inputMode="numeric"
          name={name}
          onChange={(event) => handleManualChange(event.target.value)}
          placeholder="dd/mm/aaaa"
          value={manualValue}
        />
        <span className="relative inline-flex">
          <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-blue" />
          <input
            aria-label={label}
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-brand-navy outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100 sm:w-48"
            max={today}
            onChange={(event) => handleCalendarChange(event.target.value)}
            type="date"
            value={/^\d{4}-\d{2}-\d{2}$/.test(value) ? value : ''}
          />
        </span>
      </div>
      {error ? <span className="mt-2 block text-sm text-red-600">{error}</span> : null}
    </label>
  );
}
