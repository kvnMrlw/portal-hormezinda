import { CheckCircle2, Info, XCircle } from 'lucide-react';

import { cn } from '../../lib/utils';

type ToastProps = {
  message: string;
  type?: 'success' | 'error' | 'info';
};

export function Toast({ message, type = 'info' }: ToastProps) {
  const Icon = type === 'success' ? CheckCircle2 : type === 'error' ? XCircle : Info;

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-sm shadow-soft',
        type === 'success' && 'border-green-100 text-brand-green',
        type === 'error' && 'border-red-100 text-red-600',
        type === 'info' && 'border-blue-100 text-brand-blue'
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{message}</span>
    </div>
  );
}
