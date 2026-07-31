import { CalendarClock, CheckCircle2, FileUp, Search, XCircle } from 'lucide-react';
import { type ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';

import { AppShell } from '../components/app/AppShell';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Loading } from '../components/ui/Loading';
import { Select } from '../components/ui/Select';
import { getAssetUrl } from '../lib/assets';
import { formatClassName } from '../lib/classes';
import { listTasks, submitTask } from '../services/academic';
import type { AcademicTask } from '../types/academic';
import type { AcademicFilters } from '../types/academic';

const statusOptions: Array<{ label: string; value: AcademicFilters['status'] }> = [
  { label: 'Todas', value: '' },
  { label: 'Pendentes', value: 'PENDENTE' },
  { label: 'Entregues', value: 'ENTREGUE' },
  { label: 'Atrasadas', value: 'ATRASADA' }
];

export function MyTasks() {
  const [tasks, setTasks] = useState<AcademicTask[]>([]);
  const [status, setStatus] = useState<AcademicFilters['status']>('');
  const [isLoading, setIsLoading] = useState(true);
  const [savingTaskId, setSavingTaskId] = useState('');
  const [error, setError] = useState('');

  const loadTasks = useCallback(async (nextStatus = status): Promise<void> => {
    try {
      setIsLoading(true);
      setTasks(await listTasks({ status: nextStatus }));
    } catch {
      setError('Nao foi possivel carregar as tarefas.');
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  async function handleSubmit(task: AcademicTask, event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setSavingTaskId(task.id);
      await submitTask(task.id, file);
      await loadTasks(status);
    } catch {
      setError('Nao foi possivel enviar a atividade.');
    } finally {
      setSavingTaskId('');
      event.target.value = '';
    }
  }

  const sortedTasks = useMemo(() => [...tasks].sort((first, second) => new Date(first.dataEntrega).getTime() - new Date(second.dataEntrega).getTime()), [tasks]);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                <CalendarClock className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Entregas</p>
                <h1 className="mt-1 text-3xl font-semibold tracking-normal text-brand-navy sm:text-4xl">Minhas Tarefas</h1>
                <p className="mt-2 text-sm font-medium text-slate-500">Atividades ordenadas por data de entrega.</p>
              </div>
            </div>
            <Select
              className="min-w-48"
              label="Status"
              name="taskStatus"
              onChange={(event) => {
                const nextStatus = event.target.value as AcademicFilters['status'];
                setStatus(nextStatus);
                void loadTasks(nextStatus);
              }}
              value={status}
            >
              {statusOptions.map((option) => (
                <option key={option.label} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </div>
        </header>

        {error ? <div className="rounded-3xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div> : null}
        {isLoading ? <Loading className="min-h-64" /> : null}
        {!isLoading && !sortedTasks.length ? <EmptyState description="Nenhuma tarefa encontrada para o filtro atual." icon={Search} title="Sem tarefas por aqui." /> : null}

        <section className="grid gap-4 lg:grid-cols-2">
          {sortedTasks.map((task) => {
            const isLate = !task.entrega && new Date(task.dataEntrega) < new Date();

            return (
              <Card className="p-5 shadow-sm" key={task.id}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="info">{task.tipo}</Badge>
                      <Badge variant={task.entrega ? 'success' : isLate ? 'error' : 'neutral'}>{task.entrega ? 'Entregue' : isLate ? 'Atrasada' : 'Pendente'}</Badge>
                    </div>
                    <h2 className="mt-3 text-xl font-semibold text-brand-navy">{task.titulo}</h2>
                    <p className="mt-1 text-sm font-semibold text-slate-500">{task.disciplina.nome} · {formatClassName(task.turma)}</p>
                  </div>
                  {task.entrega ? <CheckCircle2 className="h-6 w-6 text-brand-green" /> : isLate ? <XCircle className="h-6 w-6 text-red-500" /> : null}
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{task.descricao}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-500">
                  <span>Entrega: {new Date(task.dataEntrega).toLocaleDateString('pt-BR')}</span>
                  {task.arquivo ? <a className="text-brand-blue" href={getAssetUrl(task.arquivo.url)} rel="noreferrer" target="_blank">Arquivo da tarefa</a> : null}
                  {task.entrega ? <a className="text-brand-blue" href={getAssetUrl(task.entrega.arquivo.url)} rel="noreferrer" target="_blank">Sua entrega</a> : null}
                </div>
                <label className="mt-5 inline-flex">
                  <input accept=".pdf,.doc,.docx,image/png,image/jpeg,image/webp" className="sr-only" disabled={savingTaskId === task.id} onChange={(event) => void handleSubmit(task, event)} type="file" />
                  <span className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-brand-blue px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-blue-700">
                    <FileUp className="h-4 w-4" />
                    {savingTaskId === task.id ? 'Enviando...' : task.entrega ? 'Reenviar atividade' : 'Entregar atividade'}
                  </span>
                </label>
              </Card>
            );
          })}
        </section>
      </div>
    </AppShell>
  );
}
