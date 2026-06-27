import { X } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '../../lib/utils';

type ModalProps = {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  className?: string;
};

export function Modal({ children, className, isOpen, onClose, title }: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
      <section className={cn('w-full max-w-lg rounded-3xl bg-white p-6 shadow-soft', className)}>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-brand-navy">{title}</h2>
          <button className="rounded-full p-2 text-slate-500 hover:bg-slate-100" onClick={onClose} type="button">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </section>
    </div>
  );
}
