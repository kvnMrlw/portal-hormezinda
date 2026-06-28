import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';

import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

type DeletePostDialogProps = {
  isDeleting: boolean;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeletePostDialog({ isDeleting, isOpen, onClose, onConfirm }: DeletePostDialogProps) {
  return (
    <Modal className="max-w-md" isOpen={isOpen} onClose={onClose} title="Excluir publicacao">
      <div className="space-y-5">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-brand-navy">Deseja excluir esta publicacao?</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">Essa acao remove o item do feed imediatamente.</p>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button disabled={isDeleting} onClick={onClose} type="button" variant="secondary">
            Cancelar
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 focus:ring-red-200"
            disabled={isDeleting}
            onClick={onConfirm}
            type="button"
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Excluir
          </Button>
        </div>
      </div>
    </Modal>
  );
}
