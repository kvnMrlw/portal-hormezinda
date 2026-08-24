import type { SelectHTMLAttributes } from 'react';

import { cn } from '../../lib/utils';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
};

export function Select({ children, className, id, label, ...props }: SelectProps) {
  const inputId = id ?? props.name;

  return (
    <label className="block" htmlFor={inputId}>
      <span className="text-sm font-semibold text-brand-navy">{label}</span>
      <select
        className={cn(
          'portal-field mt-2 w-full rounded-2xl border px-4 py-3.5 text-sm font-semibold text-brand-navy outline-none transition-all focus:-translate-y-0.5 focus:border-brand-blue focus:ring-4 focus:ring-blue-100',
          className,
        )}
        id={inputId}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
