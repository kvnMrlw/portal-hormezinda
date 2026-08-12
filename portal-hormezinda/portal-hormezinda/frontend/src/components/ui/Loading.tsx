import { cn } from '../../lib/utils';
import { Spinner } from './Spinner';

type LoadingProps = {
  className?: string;
  label?: string;
};

// Indicador visual reutilizavel para estados de carregamento.
export function Loading({ className, label = 'Carregando' }: LoadingProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2 text-sm text-slate-600', className)}>
      <Spinner className="h-4 w-4" />
      <span>{label}</span>
    </div>
  );
}
