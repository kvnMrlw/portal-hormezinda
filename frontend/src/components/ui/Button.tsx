import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '../../lib/utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
};

export function Button({
  children,
  className,
  disabled,
  isLoading = false,
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      aria-busy={isLoading || undefined}
      className={cn(
        'portal-button relative inline-flex min-h-11 items-center justify-center gap-2 overflow-hidden rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-4 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' &&
          'bg-portal-blue text-white shadow-card ring-1 ring-blue-500/20 hover:-translate-y-0.5 hover:shadow-hover focus:ring-blue-200',
        variant === 'secondary' &&
          'border border-slate-950/5 bg-white text-brand-navy shadow-card ring-1 ring-white/80 hover:-translate-y-0.5 hover:border-blue-100 hover:text-brand-blue hover:shadow-soft focus:ring-blue-100',
        variant === 'ghost' &&
          'bg-transparent text-brand-blue hover:bg-blue-50/80 hover:shadow-sm focus:ring-blue-100',
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-white/45" />
      {children}
    </button>
  );
}
