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
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
        variant === 'neutral' && 'bg-slate-100 text-slate-700',
        variant === 'success' && 'bg-green-50 text-brand-green',
        variant === 'error' && 'bg-red-50 text-red-600',
        variant === 'info' && 'bg-blue-50 text-brand-blue',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
