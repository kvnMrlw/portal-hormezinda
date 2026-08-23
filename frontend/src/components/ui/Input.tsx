import type { InputHTMLAttributes } from 'react';

import { cn } from '../../lib/utils';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

// Campo de formulario com label e mensagem de erro amigavel.
export function Input({ className, error, label, id, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="block" htmlFor={inputId}>
      <span className="text-sm font-semibold text-brand-navy">{label}</span>
      <input
        className={cn(
          'portal-field mt-2 w-full rounded-2xl border px-4 py-3.5 text-sm font-medium text-brand-navy outline-none transition-all placeholder:text-slate-400 focus:-translate-y-0.5 focus:ring-4',
          error
            ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
            : 'border-slate-950/10 focus:border-brand-blue focus:bg-white focus:ring-blue-100',
          className,
        )}
        id={inputId}
        {...props}
      />
      {error ? <span className="mt-2 block text-sm text-red-600">{error}</span> : null}
    </label>
  );
}
