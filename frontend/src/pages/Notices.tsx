import { ArrowLeft, BellRing, Megaphone, Plus, RefreshCcw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { AppShell } from '../components/app/AppShell';
import { NoticeCard } from '../components/notices/NoticeCard';
import { NoticeFilters } from '../components/notices/NoticeFilters';
import { NoticeModal } from '../components/notices/NoticeModal';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { useAuth } from '../contexts/useAuth';
import { canManageInstitutionalContent, isAdminRole } from '../lib/roles';
import { createNotice, deleteNotice, listNotices, updateNotice } from '../services/notices';
import type { Notice, NoticeFilters as NoticeFilterValues, NoticePayload } from '../types/notices';

const initialFilters: NoticeFilterValues = {
  categoria: 'TODAS',
  prioridade: 'TODAS',
  search: '',
  status: 'TODOS'
};

export function Notices() {
  const { user } = useAuth();
  const isAdmin = isAdminRole(user?.cargo);
  const canManageNotices = canManageInstitutionalContent(user);
  const [filters, setFilters] = useState<NoticeFilterValues>(initialFilters);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pinnedCount = useMemo(() => notices.filter((notice) => notice.fixado).length, [notices]);

  const loadNotices = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const loadedNotices = await listNotices(filters);
      setNotices(loadedNotices);
    } catch {
      setError('Nao foi possivel carregar os avisos.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void loadNotices();
  }, [loadNotices]);

  function openCreateModal(): void {
    setEditingNotice(null);
    setIsModalOpen(true);
  }

  function openEditModal(notice: Notice): void {
    setEditingNotice(notice);
    setIsModalOpen(true);
  }

  function closeModal(): void {
    if (!isSaving) {
      setIsModalOpen(false);
      setEditingNotice(null);
    }
  }

  async function handleSubmit(payload: NoticePayload): Promise<void> {
    try {
      setIsSaving(true);

      if (editingNotice) {
        await updateNotice(editingNotice.id, payload);
      } else {
        await createNotice(payload);
      }

      setIsModalOpen(false);
      setEditingNotice(null);
      await loadNotices();
    } catch {
      setError('Nao foi possivel salvar o aviso.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(notice: Notice): Promise<void> {
    const confirmed = window.confirm(`Excluir o aviso "${notice.titulo}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteNotice(notice.id);
      await loadNotices();
    } catch {
      setError('Nao foi possivel excluir o aviso.');
    }
  }

  async function handleTogglePin(notice: Notice): Promise<void> {
    try {
      await updateNotice(notice.id, { fixado: !notice.fixado });
      await loadNotices();
    } catch {
      setError('Nao foi possivel atualizar o destaque do aviso.');
    }
  }

  async function handleToggleActive(notice: Notice): Promise<void> {
    try {
      await updateNotice(notice.id, { ativo: !notice.ativo });
      await loadNotices();
    } catch {
      setError('Nao foi possivel atualizar o status do aviso.');
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-6">
        <Link
          className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-brand-navy focus:outline-none focus:ring-4 focus:ring-blue-100"
          to="/home"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <section className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                <Megaphone className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-semibold tracking-normal text-brand-navy">Avisos</h1>
                <p className="mt-2 max-w-2xl text-base leading-7 text-slate-500">Comunicados oficiais da escola</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                    <BellRing className="h-4 w-4" />
                    {notices.length} avisos
                  </span>
                  <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700">
                    {pinnedCount} fixados
                  </span>
                </div>
              </div>
            </div>

            {canManageNotices ? (
              <Button className="w-full sm:w-auto" onClick={openCreateModal} type="button">
                <Plus className="h-4 w-4" />
                Novo aviso
              </Button>
            ) : null}
          </div>
        </section>

        <NoticeFilters filters={filters} isAdmin={isAdmin} onChange={setFilters} />

        {error ? (
          <div className="flex flex-col gap-3 rounded-3xl border border-red-100 bg-red-50 p-5 text-red-700 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-semibold">{error}</span>
            <Button onClick={() => void loadNotices()} type="button" variant="secondary">
              <RefreshCcw className="h-4 w-4" />
              Tentar novamente
            </Button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center rounded-3xl border border-slate-100 bg-white">
            <Spinner />
          </div>
        ) : notices.length ? (
          <div className="space-y-4">
            {notices.map((notice) => (
              <NoticeCard
                isAdmin={isAdmin}
                canManage={isAdmin || notice.autor.id === user?.id}
                key={notice.id}
                notice={notice}
                onDelete={(selectedNotice) => void handleDelete(selectedNotice)}
                onEdit={openEditModal}
                onToggleActive={(selectedNotice) => void handleToggleActive(selectedNotice)}
                onTogglePin={(selectedNotice) => void handleTogglePin(selectedNotice)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-brand-blue">
              <Megaphone className="h-8 w-8" />
            </div>
            <h2 className="mt-5 text-xl font-semibold tracking-normal text-brand-navy">Nenhum aviso encontrado</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Ajuste a pesquisa ou os filtros para consultar os comunicados disponiveis.
            </p>
          </div>
        )}
      </div>

      <NoticeModal
        isOpen={isModalOpen}
        isAdmin={isAdmin}
        isSaving={isSaving}
        notice={editingNotice}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </AppShell>
  );
}
