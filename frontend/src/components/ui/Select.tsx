import type { SelectHTMLAttributes } from 'react';

import { cn } from '../../lib/utils';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
};

export function Select({ children, className, id, label, ...props }: SelectProps) {
  const inputId = id ?? props.name;

  return (
    <label className="block" htmlFor={inputId}>
      <span className="text-sm font-medium text-brand-navy">{label}</span>
      <select
        className={cn(
          'mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-brand-navy outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100',
          className
        )}
        id={inputId}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
