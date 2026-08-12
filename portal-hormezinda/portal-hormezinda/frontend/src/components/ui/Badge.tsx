import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '../../lib/utils';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  variant?: 'neutral' | 'success' | 'error' | 'info';
};

export function Badge({ children, className, variant = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1',
        variant === 'neutral' && 'bg-slate-100/90 text-slate-700 ring-slate-200',
        variant === 'success' && 'bg-green-50 text-brand-green ring-green-100',
        variant === 'error' && 'bg-red-50 text-red-600 ring-red-100',
        variant === 'info' && 'bg-blue-50 text-brand-blue ring-blue-100',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
