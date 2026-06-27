import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '../../lib/utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
};

// Botao reutilizavel para a interface do Portal Hormezinda.
export function Button({ children, className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' && 'bg-brand-blue text-white shadow-soft hover:bg-blue-700 focus:ring-blue-200',
        variant === 'secondary' && 'border border-slate-200 bg-white text-brand-navy hover:bg-slate-50 focus:ring-blue-100',
        variant === 'ghost' && 'bg-transparent text-brand-blue hover:bg-blue-50 focus:ring-blue-100',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
