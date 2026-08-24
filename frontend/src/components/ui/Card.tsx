import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '../../lib/utils';

type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

export function Card({ children, className, ...props }: CardProps) {
  return (
    <section
      className={cn(
        'portal-card rounded-[1.65rem] border p-6 transition-all duration-300',
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}
