import { CalendarDays, Plus, Printer, RefreshCcw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AppShell } from '../components/app/AppShell';
import { ScheduleDayCards } from '../components/schedules/ScheduleDayCards';
import { ScheduleFilters } from '../components/schedules/ScheduleFilters';
import { ScheduleModal } from '../components/schedules/ScheduleModal';
import { ScheduleTable } from '../components/schedules/ScheduleTable';
import { ScheduleTopSummary } from '../components/schedules/ScheduleTopSummary';
import { TeacherAgenda } from '../components/schedules/TeacherAgenda';
import { getPrintTitle } from '../components/schedules/scheduleUtils';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Loading } from '../components/ui/Loading';
import { useAuth } from '../contexts/useAuth';
import { getDisplayRoleLabel, isAdminRole } from '../lib/roles';
import { listCatalogs } from '../services/catalogs';
import { createSchedule, deleteSchedule, listSchedules, updateSchedule } from '../services/schedules';
import { listUsers } from '../services/users';
import { Cargo, type User } from '../types/auth';
import type { ClassGroup, Room, Subject } from '../types/catalogs';
import type { ScheduleEntry, ScheduleFilters as ScheduleFilterValues, SchedulePayload } from '../types/schedules';

type ModalState = {
  mode: 'create' | 'duplicate' | 'edit';
  schedule?: ScheduleEntry;
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

export function Schedules() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<ScheduleFilterValues>({});
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [formError, setFormError] = useState('');
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const requestIdRef = useRef(0);
  const isAdmin = isAdminRole(user?.cargo);

  const teachers = useMemo(() => users.filter((item) => item.cargo === Cargo.PROFESSOR && item.ativo), [users]);
  const selectedTeacher = useMemo(
    () => teachers.find((teacher) => teacher.id === filters.professorId)?.nomeCompleto,
    [filters.professorId, teachers]
  );
  const selectedClass = classes.find((classGroup) => classGroup.id === filters.turmaId)?.nome;
  const printTitle = getPrintTitle({ professor: selectedTeacher, turma: selectedClass || user?.turma });
  const isTeacherView = user?.cargo === Cargo.PROFESSOR;

  const loadSchedules = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    try {
      setHasError(false);
      setIsLoading(true);
      const loadedSchedules = await listSchedules(filters);

      if (requestIdRef.current === requestId) {
        setSchedules(loadedSchedules);
      }
    } catch {
      if (requestIdRef.current === requestId) {
        setHasError(true);
      }
    } finally {
      if (requestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [filters]);

  useEffect(() => {
    void loadSchedules();
  }, [loadSchedules]);

  useEffect(() => {
    async function loadBaseData() {
      try {
        const [loadedUsers, catalogs] = await Promise.all([listUsers(), listCatalogs()]);
        setUsers(loadedUsers);
        setClasses(catalogs.turmas);
        setRooms(catalogs.salas);
        setSubjects(catalogs.disciplinas);
      } catch {
        setUsers([]);
      }
    }

    void loadBaseData();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSchedules((current) => [...current]);
    }, 30000);

    return () => window.clearInterval(interval);
  }, []);

  function openCreateModal(): void {
    setFormError('');
    setModalState({ mode: 'create' });
  }

  function openEditModal(schedule: ScheduleEntry): void {
    setFormError('');
    setModalState({ mode: 'edit', schedule });
  }

  function openDuplicateModal(schedule: ScheduleEntry): void {
    setFormError('');
    setModalState({ mode: 'duplicate', schedule });
  }

  async function handleSubmit(payload: SchedulePayload): Promise<void> {
    try {
      setIsSaving(true);
      setFormError('');

      if (modalState?.mode === 'edit' && modalState.schedule) {
        await updateSchedule(modalState.schedule.id, payload);
      } else {
        await createSchedule(payload);
      }

      setModalState(null);
      await loadSchedules();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(schedule: ScheduleEntry): Promise<void> {
    const confirmed = window.confirm(`Excluir "${schedule.disciplina.nome}" deste horario?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteSchedule(schedule.id);
      setSchedules((current) => current.filter((item) => item.id !== schedule.id));
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  return (
    <AppShell>
      <style>
        {`
          @media print {
            aside, header, .schedule-no-print { display: none !important; }
            main, body { background: #ffffff !important; }
            .schedule-print-root { max-width: none !important; padding: 0 !important; }
            .schedule-print-surface { box-shadow: none !important; border-color: #d8dee9 !important; }
          }
        `}
      </style>
      <div className="schedule-print-root mx-auto max-w-7xl space-y-5">
        <section className="schedule-no-print rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-blue-50 text-brand-blue ring-1 ring-blue-100">
                <CalendarDays className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Calendario escolar</p>
                <h1 className="mt-1 text-3xl font-semibold tracking-normal text-brand-navy sm:text-4xl">Horarios</h1>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  {user?.cargo === Cargo.PROFESSOR
                    ? 'Suas aulas organizadas por semana.'
                    : user?.turma
                      ? `Horario da turma ${user.turma}.`
                      : 'Aulas, salas e intervalos da semana.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={() => window.print()} type="button" variant="secondary">
                <Printer className="h-4 w-4" />
                Imprimir horario
              </Button>
              {isAdmin ? (
                <Button onClick={openCreateModal} type="button">
                  <Plus className="h-4 w-4" />
                  Criar horario
                </Button>
              ) : null}
            </div>
          </div>
        </section>

        <div className="hidden print:block">
          <h1 className="text-3xl font-semibold text-brand-navy">{printTitle}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {user ? `${user.nomeCompleto} - ${getDisplayRoleLabel(user)}` : 'Portal Hormezinda'}
          </p>
        </div>

        <div className="schedule-no-print">
          {!isTeacherView ? <ScheduleTopSummary schedules={schedules} /> : null}
        </div>

        <div className="schedule-no-print">
          <ScheduleFilters
            classes={classes}
            currentUser={user}
            filters={filters}
            onChange={setFilters}
            rooms={rooms}
            subjects={subjects}
            teachers={teachers}
          />
        </div>

        {formError && !modalState ? (
          <div className="schedule-no-print flex flex-col gap-3 rounded-3xl border border-red-100 bg-red-50 p-5 text-red-700 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-semibold">{formError}</span>
            <Button onClick={() => setFormError('')} type="button" variant="secondary">
              Fechar
            </Button>
          </div>
        ) : null}

        {isLoading ? <Loading className="min-h-64" /> : null}

        {!isLoading && hasError ? (
          <div className="schedule-no-print rounded-3xl border border-red-100 bg-red-50 p-6">
            <p className="font-semibold text-red-700">Nao foi possivel carregar os horarios.</p>
            <Button className="mt-4" onClick={() => void loadSchedules()} type="button" variant="secondary">
              <RefreshCcw className="h-4 w-4" />
              Tentar novamente
            </Button>
          </div>
        ) : null}

        {!isLoading && !hasError && !schedules.length ? (
          <EmptyState description="Ajuste os filtros ou cadastre um novo horario." icon={CalendarDays} title="Nenhum horario encontrado." />
        ) : null}

        {!isLoading && !hasError && schedules.length && isTeacherView ? (
          <TeacherAgenda schedules={schedules} />
        ) : null}

        {!isLoading && !hasError && schedules.length && !isTeacherView ? (
          <div className="schedule-print-surface">
            <ScheduleTable
              canManage={isAdmin}
              onDelete={(schedule) => void handleDelete(schedule)}
              onDuplicate={openDuplicateModal}
              onEdit={openEditModal}
              schedules={schedules}
            />
            <ScheduleDayCards
              canManage={isAdmin}
              onDelete={(schedule) => void handleDelete(schedule)}
              onDuplicate={openDuplicateModal}
              onEdit={openEditModal}
              schedules={schedules}
            />
          </div>
        ) : null}
      </div>

      <ScheduleModal
        error={formError}
        isOpen={Boolean(modalState)}
        isSaving={isSaving}
        mode={modalState?.mode ?? 'create'}
        classes={classes}
        onClose={() => {
          if (!isSaving) {
            setModalState(null);
            setFormError('');
          }
        }}
        onSubmit={handleSubmit}
        rooms={rooms}
        schedule={modalState?.schedule}
        subjects={subjects}
      />
    </AppShell>
  );
}
