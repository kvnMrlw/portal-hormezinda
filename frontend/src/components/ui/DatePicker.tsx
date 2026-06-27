import { CalendarDays } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { cn } from '../../lib/utils';

type DatePickerProps = {
  error?: string;
  label: string;
  name: string;
  onChange: (value: string) => void;
  value: string;
};

function isoToBrazilianDate(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
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

function maskDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function isValidBrazilianDate(value: string): boolean {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    return false;
  }

  const [day, month, year] = value.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date <= today
  );
}

export function DatePicker({ error, label, name, onChange, value }: DatePickerProps) {
  const [manualValue, setManualValue] = useState(() => isoToBrazilianDate(value));
  const [localError, setLocalError] = useState<string>();
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const displayedError = error ?? localError;

  useEffect(() => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      setManualValue(isoToBrazilianDate(value));
      return;
    }

    setManualValue(maskDate(value));
  }, [value]);

  function handleManualChange(nextValue: string): void {
    const maskedValue = maskDate(nextValue);
    setManualValue(maskedValue);
    setLocalError(undefined);

    if (maskedValue.length === 10) {
      if (isValidBrazilianDate(maskedValue)) {
        onChange(brazilianDateToIso(maskedValue));
      } else {
        setLocalError('Informe uma data valida, sem datas futuras');
        onChange(maskedValue);
      }
    } else {
      onChange(maskedValue);
    }
  }

  function handleCalendarChange(nextValue: string): void {
    setLocalError(undefined);
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
            displayedError ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-brand-blue focus:ring-blue-100'
          )}
          inputMode="numeric"
          maxLength={10}
          name={name}
          onChange={(event) => handleManualChange(event.target.value)}
          placeholder="dd/mm/aaaa"
          value={manualValue}
        />
        <span className="relative inline-flex">
          <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-blue" />
          <input
            aria-label={label}
            className={cn(
              'w-full rounded-2xl border bg-white py-3 pl-11 pr-4 text-sm text-brand-navy outline-none transition focus:ring-4 sm:w-48',
              displayedError ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-brand-blue focus:ring-blue-100'
            )}
            max={today}
            onChange={(event) => handleCalendarChange(event.target.value)}
            type="date"
            value={/^\d{4}-\d{2}-\d{2}$/.test(value) ? value : ''}
          />
        </span>
      </div>
      {displayedError ? <span className="mt-2 block text-sm text-red-600">{displayedError}</span> : null}
    </label>
  );
}
