import { Paperclip, Save, Trash2, UploadCloud } from 'lucide-react';
import { type FormEvent, useEffect, useMemo, useState } from 'react';

import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import type { Notice, NoticeAttachment, NoticePayload } from '../../types/notices';
import { NoticeCategory, NoticePriority } from '../../types/notices';
import { categoryLabels, categoryOptions, priorityLabels, priorityOptions } from './noticeOptions';

type NoticeModalProps = {
  isOpen: boolean;
  isSaving: boolean;
  notice?: Notice | null;
  onClose: () => void;
  onSubmit: (payload: NoticePayload) => Promise<void>;
};

type NoticeFormState = {
  titulo: string;
  descricao: string;
  categoria: NoticeCategory;
  prioridade: NoticePriority;
  dataInicio: string;
  dataFim: string;
  fixado: boolean;
  ativo: boolean;
};

function toInputDate(value?: string): string {
  if (!value) {
    return new Date().toISOString().slice(0, 10);
  }

  return new Date(value).toISOString().slice(0, 10);
}

function getInitialState(notice?: Notice | null): NoticeFormState {
  return {
    titulo: notice?.titulo ?? '',
    descricao: notice?.descricao ?? '',
    categoria: notice?.categoria ?? NoticeCategory.GERAL,
    prioridade: notice?.prioridade ?? NoticePriority.INFORMATIVO,
    dataInicio: toInputDate(notice?.dataInicio),
    dataFim: notice?.dataFim ? toInputDate(notice.dataFim) : '',
    fixado: notice?.fixado ?? false,
    ativo: notice?.ativo ?? true
  };
}

export function NoticeModal({ isOpen, isSaving, notice, onClose, onSubmit }: NoticeModalProps) {
  const [formState, setFormState] = useState<NoticeFormState>(() => getInitialState(notice));
  const [files, setFiles] = useState<File[]>([]);
  const [removedAttachments, setRemovedAttachments] = useState<string[]>([]);

  const visibleAttachments = useMemo(
    () => (notice?.anexos ?? []).filter((attachment) => !removedAttachments.includes(attachment.url)),
    [notice?.anexos, removedAttachments]
  );

  useEffect(() => {
    if (isOpen) {
      setFormState(getInitialState(notice));
      setFiles([]);
      setRemovedAttachments([]);
    }
  }, [isOpen, notice]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    await onSubmit({
      ...formState,
      dataFim: formState.dataFim || (notice?.dataFim ? '' : undefined),
      anexos: files,
      removerAnexos: removedAttachments
    });
  }

  function handleFileChange(selectedFiles: FileList | null): void {
    setFiles(Array.from(selectedFiles ?? []));
  }

  function removeExistingAttachment(attachment: NoticeAttachment): void {
    setRemovedAttachments((current) => [...current, attachment.url]);
  }

  return (
    <Modal
      className="max-h-[92vh] max-w-3xl overflow-y-auto rounded-[2rem]"
      isOpen={isOpen}
      onClose={onClose}
      title={notice ? 'Editar aviso' : 'Novo aviso'}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="Titulo"
              maxLength={120}
              name="titulo"
              onChange={(event) => setFormState((current) => ({ ...current, titulo: event.target.value }))}
              required
              value={formState.titulo}
            />
          </div>

          <div className="sm:col-span-2">
            <Textarea
              label="Descricao"
              maxLength={2000}
              name="descricao"
              onChange={(event) => setFormState((current) => ({ ...current, descricao: event.target.value }))}
              required
              rows={6}
              value={formState.descricao}
            />
          </div>

          <Select
            label="Categoria"
            name="categoria"
            onChange={(event) => setFormState((current) => ({ ...current, categoria: event.target.value as NoticeCategory }))}
            value={formState.categoria}
          >
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {categoryLabels[category]}
              </option>
            ))}
          </Select>

          <Select
            label="Prioridade"
            name="prioridade"
            onChange={(event) => setFormState((current) => ({ ...current, prioridade: event.target.value as NoticePriority }))}
            value={formState.prioridade}
          >
            {priorityOptions.map((priority) => (
              <option key={priority} value={priority}>
                {priorityLabels[priority]}
              </option>
            ))}
          </Select>

          <Input
            label="Data inicial"
            name="dataInicio"
            onChange={(event) => setFormState((current) => ({ ...current, dataInicio: event.target.value }))}
            required
            type="date"
            value={formState.dataInicio}
          />

          <Input
            label="Data final"
            name="dataFim"
            onChange={(event) => setFormState((current) => ({ ...current, dataFim: event.target.value }))}
            type="date"
            value={formState.dataFim}
          />
        </div>

        <div className="grid gap-3 rounded-3xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-2">
          <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-brand-navy">
            <input
              checked={formState.fixado}
              className="h-4 w-4 accent-brand-blue"
              onChange={(event) => setFormState((current) => ({ ...current, fixado: event.target.checked }))}
              type="checkbox"
            />
            Fixado
          </label>
          <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-brand-navy">
            <input
              checked={formState.ativo}
              className="h-4 w-4 accent-brand-blue"
              onChange={(event) => setFormState((current) => ({ ...current, ativo: event.target.checked }))}
              type="checkbox"
            />
            Ativo
          </label>
        </div>

        <label className="block rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-brand-blue hover:bg-blue-50/40">
          <UploadCloud className="mx-auto h-7 w-7 text-brand-blue" />
          <span className="mt-2 block text-sm font-semibold text-brand-navy">Upload de anexos</span>
          <span className="mt-1 block text-xs text-slate-500">PNG, JPG, JPEG, WEBP ou PDF</span>
          <input
            accept=".png,.jpg,.jpeg,.webp,.pdf,image/png,image/jpeg,image/webp,application/pdf"
            className="sr-only"
            multiple
            onChange={(event) => handleFileChange(event.target.files)}
            type="file"
          />
        </label>

        {files.length ? (
          <div className="flex flex-wrap gap-2">
            {files.map((file) => (
              <span
                className="inline-flex max-w-full items-center gap-2 rounded-2xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700"
                key={`${file.name}-${file.size}`}
              >
                <Paperclip className="h-4 w-4 shrink-0" />
                <span className="truncate">{file.name}</span>
              </span>
            ))}
          </div>
        ) : null}

        {visibleAttachments.length ? (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-brand-navy">Anexos atuais</p>
            <div className="flex flex-wrap gap-2">
              {visibleAttachments.map((attachment) => (
                <span
                  className="inline-flex max-w-full items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600"
                  key={attachment.url}
                >
                  <Paperclip className="h-4 w-4 shrink-0" />
                  <span className="truncate">{attachment.nome}</span>
                  <button
                    className="rounded-full p-1 text-red-500 transition hover:bg-red-50"
                    onClick={() => removeExistingAttachment(attachment)}
                    title="Remover anexo"
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <Button disabled={isSaving} onClick={onClose} type="button" variant="secondary">
            Cancelar
          </Button>
          <Button disabled={isSaving} type="submit">
            <Save className="h-4 w-4" />
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
