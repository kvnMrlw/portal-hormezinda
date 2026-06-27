import { LoaderCircle } from 'lucide-react';

import { cn } from '../../lib/utils';

type LoadingProps = {
  className?: string;
  label?: string;
};

// Indicador visual reutilizavel para estados de carregamento.
export function Loading({ className, label = 'Carregando' }: LoadingProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2 text-sm text-slate-600', className)}>
      <LoaderCircle className="h-4 w-4 animate-spin" />
      <span>{label}</span>
    </div>
  );
}
