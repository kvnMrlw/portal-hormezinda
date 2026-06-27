import type { ReactNode } from 'react';

import { Button } from './Button';
import { Modal } from './Modal';

type DialogProps = {
  cancelLabel?: string;
  children: ReactNode;
  confirmLabel?: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
};

export function Dialog({
  cancelLabel = 'Cancelar',
  children,
  confirmLabel = 'Confirmar',
  isOpen,
  onClose,
  onConfirm,
  title
}: DialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-5">
        <div className="text-sm leading-6 text-slate-600">{children}</div>
        <div className="flex justify-end gap-3">
          <Button onClick={onClose} type="button" variant="secondary">
            {cancelLabel}
          </Button>
          <Button onClick={onConfirm} type="button">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
