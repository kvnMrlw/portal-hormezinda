import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '../../lib/utils';

type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

// Superficie reutilizavel para agrupar conteudo de formulario.
export function Card({ children, className, ...props }: CardProps) {
  return (
    <section className={cn('rounded-3xl border border-white/80 bg-white/90 p-6 shadow-soft backdrop-blur', className)} {...props}>
      {children}
    </section>
  );
}
