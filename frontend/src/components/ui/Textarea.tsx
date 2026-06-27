import type { TextareaHTMLAttributes } from 'react';

import { cn } from '../../lib/utils';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
};

export function Textarea({ className, error, id, label, ...props }: TextareaProps) {
  const inputId = id ?? props.name;

  return (
    <label className="block" htmlFor={inputId}>
      <span className="text-sm font-medium text-brand-navy">{label}</span>
      <textarea
        className={cn(
          'mt-2 min-h-28 w-full resize-none rounded-2xl border bg-white px-4 py-3 text-sm text-brand-navy outline-none transition placeholder:text-slate-400 focus:ring-4',
          error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-brand-blue focus:ring-blue-100',
          className
        )}
        id={inputId}
        {...props}
      />
      {error ? <span className="mt-2 block text-sm text-red-600">{error}</span> : null}
    </label>
  );
}
