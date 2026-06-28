import { ArrowLeft, CalendarDays, Coffee, Copy, Pencil, Plus, Printer, RefreshCcw, Trash2, UsersRound } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { AppShell } from '../components/app/AppShell';
import { ScheduleModal } from '../components/schedules/ScheduleModal';
import { TeacherAgenda } from '../components/schedules/TeacherAgenda';
import { formatTimeRange, timeToMinutes } from '../components/schedules/scheduleUtils';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Loading } from '../components/ui/Loading';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { useAuth } from '../contexts/useAuth';
import { formatClassName, formatStudentClassName, getClassSortValue } from '../lib/classes';
import { isAdminRole } from '../lib/roles';
import { listCatalogs } from '../services/catalogs';
import { copyWeekSchedules, createSchedule, deleteSchedule, listSchedules, updateSchedule } from '../services/schedules';
import { Cargo } from '../types/auth';
import type { ClassGroup, Room, Subject } from '../types/catalogs';
import { ScheduleEntryKind, Weekday, weekdayLabels, weekdays, type ScheduleEntry, type SchedulePayload } from '../types/schedules';

type ModalState = {
  mode: 'create' | 'edit';
  day?: Weekday;
  end?: string;
  schedule?: ScheduleEntry;
  start?: string;
};

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  return 'Nao foi possivel concluir a solicitacao.';
}

function getScheduleSlots(schedules: ScheduleEntry[]): Array<{ end: string; key: string; start: string }> {
  return Array.from(new Set(schedules.map((schedule) => `${schedule.horarioInicio}-${schedule.horarioFim}`)))
    .sort((first, second) => timeToMinutes(first.split('-')[0]) - timeToMinutes(second.split('-')[0]))
    .map((slot) => {
      const [start, end] = slot.split('-');
      return { end, key: slot, start };
    });
}

export function Schedules() {
  const { user } = useAuth();
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const isAdmin = isAdminRole(user?.cargo);
  const isTeacher = user?.cargo === Cargo.PROFESSOR;
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [copyTargetId, setCopyTargetId] = useState('');
  const [copyOverwrite, setCopyOverwrite] = useState(true);
  const [isCopyOpen, setIsCopyOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const selectedClass = classes.find((classGroup) => classGroup.id === classId);
  const activeClassId = isAdmin ? classId ?? '' : schedules[0]?.turma.id ?? '';
  const visibleSchedules = useMemo(
    () => schedules.filter((schedule) => !activeClassId || schedule.turma.id === activeClassId),
    [activeClassId, schedules]
  );

  const loadBaseData = useCallback(async () => {
    try {
      setError('');
      const catalogs = await listCatalogs();
      setClasses(catalogs.turmas);
      setRooms(catalogs.salas);
      setSubjects(catalogs.disciplinas);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    }
  }, []);

  const loadSchedules = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      setSchedules(await listSchedules(isAdmin && classId ? { turmaId: classId } : {}));
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [classId, isAdmin]);

  useEffect(() => {
    void loadBaseData();
  }, [loadBaseData]);

  useEffect(() => {
    void loadSchedules();
  }, [loadSchedules]);

  function openCreate(day = Weekday.MONDAY, start?: string, end?: string): void {
    setError('');
    setModalState({ day, end, mode: 'create', start });
  }

  function openEdit(schedule: ScheduleEntry): void {
    setError('');
    setModalState({ mode: 'edit', schedule });
  }

  async function handleSubmit(payload: SchedulePayload): Promise<void> {
    try {
      setIsSaving(true);
      setError('');
      const nextPayload = {
        ...payload,
        diaSemana: modalState?.schedule?.diaSemana ?? modalState?.day ?? payload.diaSemana,
        turmaId: payload.turmaId || activeClassId
      };

      if (modalState?.mode === 'edit' && modalState.schedule) {
        await updateSchedule(modalState.schedule.id, nextPayload);
      } else {
        await createSchedule(nextPayload);
      }

      setModalState(null);
      await loadSchedules();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(schedule: ScheduleEntry): Promise<void> {
    const label = schedule.tipo === ScheduleEntryKind.INTERVAL ? 'Intervalo' : schedule.disciplina?.nome ?? 'horario';

    if (!window.confirm(`Excluir "${label}"?`)) return;

    try {
      await deleteSchedule(schedule.id);
      setSchedules((current) => current.filter((item) => item.id !== schedule.id));
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    }
  }

  async function handleCopyWeek(): Promise<void> {
    if (!classId) return;

    try {
      setIsSaving(true);
      setError('');
      await copyWeekSchedules({
        destinoTurmaId: copyTargetId,
        origemTurmaId: classId,
        sobrescrever: copyOverwrite
      });
      setIsCopyOpen(false);
      await loadSchedules();
    } catch (copyError) {
      setError(getErrorMessage(copyError));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell>
      <style>
        {`
          @media print {
            aside, header, .schedule-no-print { display: none !important; }
            main, body { background: #ffffff !important; }
          }
        `}
      </style>

      <div className="mx-auto max-w-7xl space-y-5">
        <header className="schedule-no-print rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-blue-50 text-brand-blue ring-1 ring-blue-100">
                <CalendarDays className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Grade semanal</p>
                <h1 className="mt-1 text-3xl font-semibold tracking-normal text-brand-navy sm:text-4xl">
                  {isAdmin && selectedClass ? formatClassName(selectedClass) : 'Horarios'}
                </h1>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  {isTeacher ? 'Suas aulas da semana.' : isAdmin ? 'Tabela semanal por turma.' : `Horario da turma ${formatStudentClassName(user?.turma)}.`}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              {isAdmin && classId ? (
                <Button onClick={() => navigate('/horarios')} type="button" variant="secondary">
                  <ArrowLeft className="h-4 w-4" />
                  Salas
                </Button>
              ) : null}
              <Button onClick={() => window.print()} type="button" variant="secondary">
                <Printer className="h-4 w-4" />
                Imprimir
              </Button>
              {isAdmin && classId ? (
                <>
                  <Button onClick={() => setIsCopyOpen(true)} type="button" variant="secondary">
                    <Copy className="h-4 w-4" />
                    Copiar semana
                  </Button>
                  <Button onClick={() => openCreate()} type="button">
                    <Plus className="h-4 w-4" />
                    Novo horario
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        </header>

        {error ? (
          <div className="schedule-no-print flex flex-col gap-3 rounded-3xl border border-red-100 bg-red-50 p-4 text-red-700 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-semibold">{error}</span>
            <Button onClick={() => void loadSchedules()} type="button" variant="secondary">
              <RefreshCcw className="h-4 w-4" />
              Recarregar
            </Button>
          </div>
        ) : null}

        {isLoading ? <Loading className="min-h-64" /> : null}

        {!isLoading && isAdmin && !classId ? <ClassGrid classes={classes} /> : null}
        {!isLoading && isTeacher ? <TeacherAgenda schedules={visibleSchedules} /> : null}
        {!isLoading && !isTeacher && isAdmin && classId ? (
          <WeeklyScheduleTable
            canManage
            onCreate={openCreate}
            onDelete={(schedule) => void handleDelete(schedule)}
            onEdit={openEdit}
            schedules={visibleSchedules}
          />
        ) : null}
        {!isLoading && !isTeacher && !isAdmin ? <WeeklyScheduleTable schedules={visibleSchedules} /> : null}
      </div>

      <ScheduleModal
        classes={classes}
        error={error}
        initialClassId={activeClassId}
        initialEnd={modalState?.end}
        initialStart={modalState?.start}
        initialWeekday={modalState?.schedule?.diaSemana ?? modalState?.day ?? Weekday.MONDAY}
        isOpen={Boolean(modalState)}
        isSaving={isSaving}
        mode={modalState?.mode ?? 'create'}
        onClose={() => {
          if (!isSaving) {
            setModalState(null);
            setError('');
          }
        }}
        onSubmit={handleSubmit}
        rooms={rooms}
        schedule={modalState?.schedule}
        subjects={subjects}
      />

      <Modal className="max-w-xl" isOpen={isCopyOpen} onClose={() => setIsCopyOpen(false)} title="Copiar semana">
        <div className="space-y-4">
          <p className="text-sm font-medium text-slate-500">Copiar todos os horarios de {formatClassName(selectedClass)} para outra sala.</p>
          <Select label="Sala destino" name="copyTarget" onChange={(event) => setCopyTargetId(event.target.value)} value={copyTargetId}>
            <option value="">Selecione</option>
            {classes.filter((classGroup) => classGroup.id !== classId).map((classGroup) => (
              <option key={classGroup.id} value={classGroup.id}>{formatClassName(classGroup)}</option>
            ))}
          </Select>
          <label className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600 ring-1 ring-slate-100">
            <input checked={copyOverwrite} className="h-4 w-4 accent-brand-blue" onChange={(event) => setCopyOverwrite(event.target.checked)} type="checkbox" />
            Sobrescrever horarios existentes
          </label>
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <Button onClick={() => setIsCopyOpen(false)} type="button" variant="secondary">Cancelar</Button>
            <Button disabled={!copyTargetId || isSaving} onClick={() => void handleCopyWeek()} type="button">Copiar</Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}

function ClassGrid({ classes }: { classes: ClassGroup[] }) {
  if (!classes.length) {
    return <EmptyState description="Cadastre salas em Cadastros para montar a grade." icon={UsersRound} title="Nenhuma sala cadastrada." />;
  }

  const sortedClasses = [...classes].sort((first, second) => getClassSortValue(first).localeCompare(getClassSortValue(second), 'pt-BR'));

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {sortedClasses.map((classGroup) => (
        <Link className="group rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-soft" key={classGroup.id} to={`/horarios/turma/${classGroup.id}`}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-brand-blue ring-1 ring-blue-100">
            <UsersRound className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-normal text-brand-navy">{formatClassName(classGroup)}</h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">{classGroup.turno}</p>
          <span className="mt-5 inline-flex text-sm font-bold text-brand-blue">Abrir tabela semanal</span>
        </Link>
      ))}
    </section>
  );
}

function WeeklyScheduleTable({
  canManage = false,
  onCreate,
  onDelete,
  onEdit,
  schedules
}: {
  canManage?: boolean;
  onCreate?: (day: Weekday, start?: string, end?: string) => void;
  onDelete?: (schedule: ScheduleEntry) => void;
  onEdit?: (schedule: ScheduleEntry) => void;
  schedules: ScheduleEntry[];
}) {
  const slots = getScheduleSlots(schedules);

  if (!slots.length) {
    return (
      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <EmptyState description={canManage ? 'Crie o primeiro horario livremente, sem grade fixa.' : 'Sem horarios cadastrados para esta semana.'} icon={CalendarDays} title="Tabela semanal vazia." />
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
      <div className="hidden lg:block">
        <div className="grid grid-cols-[8rem_repeat(5,minmax(0,1fr))] border-b border-slate-100 bg-slate-50">
          <div className="px-4 py-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Horario</div>
          {weekdays.map((weekday) => (
            <div className="border-l border-slate-100 px-4 py-4 text-sm font-semibold text-brand-navy" key={weekday}>
              {weekdayLabels[weekday]}
            </div>
          ))}
        </div>
        {slots.map((slot) => (
          <div className="grid grid-cols-[8rem_repeat(5,minmax(0,1fr))] border-b border-slate-100 last:border-b-0" key={slot.key}>
            <div className="px-4 py-4 text-sm font-bold text-brand-navy">
              <p>{slot.start}</p>
              <p className="text-xs text-slate-400">{slot.end}</p>
            </div>
            {weekdays.map((weekday) => {
              const schedule = schedules.find((item) => item.diaSemana === weekday && item.horarioInicio === slot.start && item.horarioFim === slot.end);

              return (
                <ScheduleCell
                  canManage={canManage}
                  key={`${weekday}-${slot.key}`}
                  onCreate={() => onCreate?.(weekday, slot.start, slot.end)}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  schedule={schedule}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="grid gap-3 p-3 lg:hidden">
        {weekdays.map((weekday) => {
          const daySchedules = schedules
            .filter((schedule) => schedule.diaSemana === weekday)
            .sort((first, second) => timeToMinutes(first.horarioInicio) - timeToMinutes(second.horarioInicio));

          return (
            <div className="rounded-3xl border border-slate-100 bg-white p-3 shadow-sm" key={weekday}>
              <h2 className="px-1 text-sm font-bold uppercase tracking-[0.12em] text-slate-400">{weekdayLabels[weekday]}</h2>
              <div className="mt-3 space-y-2">
                {daySchedules.length ? daySchedules.map((schedule) => (
                  <ScheduleCell
                    canManage={canManage}
                    compact
                    key={schedule.id}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    schedule={schedule}
                  />
                )) : (
                  <p className="rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-slate-500">Sem horario disponivel.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ScheduleCell({
  canManage,
  compact,
  onCreate,
  onDelete,
  onEdit,
  schedule
}: {
  canManage: boolean;
  compact?: boolean;
  onCreate?: () => void;
  onDelete?: (schedule: ScheduleEntry) => void;
  onEdit?: (schedule: ScheduleEntry) => void;
  schedule?: ScheduleEntry;
}) {
  if (!schedule) {
    return (
      <button
        className="min-h-28 border-l border-slate-100 p-2 text-left transition hover:bg-slate-50 disabled:cursor-default disabled:hover:bg-transparent"
        disabled={!canManage}
        onClick={onCreate}
        type="button"
      >
        {canManage ? <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">Adicionar</span> : null}
      </button>
    );
  }

  const isInterval = schedule.tipo === ScheduleEntryKind.INTERVAL;
  const content = (
    <article className={`${compact ? '' : 'min-h-24'} rounded-2xl p-3 ring-1 ${isInterval ? 'bg-amber-50 text-amber-800 ring-amber-100' : 'bg-white text-brand-navy ring-slate-100'}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-bold">{formatTimeRange(schedule)}</p>
        {canManage ? (
          <div className="flex gap-1">
            <button aria-label="Editar horario" className="rounded-lg bg-slate-50 p-1.5 text-slate-500 hover:text-brand-blue" onClick={(event) => { event.stopPropagation(); onEdit?.(schedule); }} type="button">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button aria-label="Excluir horario" className="rounded-lg bg-red-50 p-1.5 text-red-600" onClick={(event) => { event.stopPropagation(); onDelete?.(schedule); }} type="button">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}
      </div>
      {isInterval ? (
        <h3 className="mt-2 flex items-center gap-1.5 text-sm font-bold"><Coffee className="h-4 w-4" />Intervalo</h3>
      ) : (
        <>
          <div className="mt-2 flex items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: schedule.disciplina?.cor ?? '#2563eb' }} />
            <h3 className="truncate text-sm font-bold">{schedule.disciplina?.nome}</h3>
          </div>
          <p className="mt-1 truncate text-xs font-semibold text-slate-500">Prof. {schedule.professor?.nomeCompleto}</p>
          {schedule.sala ? <p className="mt-1 text-xs font-bold text-slate-500">{schedule.sala.nome}</p> : null}
        </>
      )}
    </article>
  );

  if (!canManage) return <div className="border-l border-slate-100 p-2">{content}</div>;

  return (
    <button className="border-l border-slate-100 p-2 text-left transition hover:bg-blue-50/40" onClick={() => onEdit?.(schedule)} type="button">
      {content}
    </button>
  );
}
