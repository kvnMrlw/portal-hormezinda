import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '../../lib/utils';

type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

export function Card({ children, className, ...props }: CardProps) {
  return (
    <section
      className={cn(
        'rounded-[1.5rem] border border-slate-950/5 bg-portal-surface p-6 shadow-card ring-1 ring-white/80 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-hover',
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}
