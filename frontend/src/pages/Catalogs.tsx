import { BookOpen, DoorOpen, Edit3, GraduationCap, Plus, Save, Trash2 } from 'lucide-react';
import { type FormEvent, useEffect, useMemo, useState } from 'react';

import { AppShell } from '../components/app/AppShell';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { Loading } from '../components/ui/Loading';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { listUsers } from '../services/users';
import {
  createClassGroup,
  createRoom,
  createSubject,
  deleteClassGroup,
  deleteRoom,
  deleteSubject,
  listCatalogs,
  updateClassGroup,
  updateRoom,
  updateSubject
} from '../services/catalogs';
import { Cargo, Turno, type User } from '../types/auth';
import type { ClassGroup, ClassGroupPayload, Room, RoomPayload, Subject, SubjectPayload } from '../types/catalogs';
import { subjectColors } from '../types/schedules';
import { cn } from '../lib/utils';

type Tab = 'classes' | 'subjects' | 'rooms';
type ModalState =
  | { tab: 'classes'; item?: ClassGroup }
  | { tab: 'subjects'; item?: Subject }
  | { tab: 'rooms'; item?: Room };

const iconOptions = ['BookOpen', 'Calculator', 'Languages', 'Landmark', 'Map', 'Palette', 'Dumbbell', 'FlaskConical', 'Coffee'];

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  return 'Nao foi possivel concluir a solicitacao.';
}

export function Catalogs() {
  const [activeTab, setActiveTab] = useState<Tab>('classes');
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const teachers = useMemo(() => users.filter((user) => user.cargo === Cargo.PROFESSOR && user.ativo), [users]);

  useEffect(() => {
    void load();
  }, []);

  async function load(): Promise<void> {
    try {
      setIsLoading(true);
      setError('');
      const [catalogs, loadedUsers] = await Promise.all([listCatalogs(), listUsers()]);
      setClasses(catalogs.turmas);
      setSubjects(catalogs.disciplinas);
      setRooms(catalogs.salas);
      setUsers(loadedUsers);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(tab: Tab, id: string): Promise<void> {
    if (!window.confirm('Deseja realmente excluir este cadastro?')) {
      return;
    }

    try {
      if (tab === 'classes') {
        await deleteClassGroup(id);
        setClasses((current) => current.filter((item) => item.id !== id));
      }

      if (tab === 'subjects') {
        await deleteSubject(id);
        setSubjects((current) => current.filter((item) => item.id !== id));
      }

      if (tab === 'rooms') {
        await deleteRoom(id);
        setRooms((current) => current.filter((item) => item.id !== id));
      }
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Administracao</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-normal text-brand-navy">Cadastros</h1>
            </div>
            <Button onClick={() => setModalState({ tab: activeTab })} type="button">
              <Plus className="h-4 w-4" />
              Novo cadastro
            </Button>
          </div>
        </header>

        <div className="flex flex-wrap gap-2 rounded-3xl border border-slate-100 bg-white p-2 shadow-sm">
          {[
            { icon: GraduationCap, label: 'Turmas', value: 'classes' as const },
            { icon: BookOpen, label: 'Disciplinas', value: 'subjects' as const },
            { icon: DoorOpen, label: 'Salas', value: 'rooms' as const }
          ].map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                className={cn(
                  'inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-blue-100',
                  activeTab === tab.value ? 'bg-brand-blue text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-brand-navy'
                )}
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                type="button"
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {error ? <div className="rounded-3xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div> : null}
        {isLoading ? <Loading className="min-h-64" /> : null}
        {!isLoading && activeTab === 'classes' ? (
          <CatalogList
            emptyTitle="Nenhuma turma cadastrada."
            items={classes}
            onDelete={(item) => void handleDelete('classes', item.id)}
            onEdit={(item) => setModalState({ tab: 'classes', item })}
            renderMeta={(item) => `${item.ano} - ${item.turno}`}
            renderTitle={(item) => item.nome}
          />
        ) : null}
        {!isLoading && activeTab === 'subjects' ? (
          <CatalogList
            emptyTitle="Nenhuma disciplina cadastrada."
            items={subjects}
            onDelete={(item) => void handleDelete('subjects', item.id)}
            onEdit={(item) => setModalState({ tab: 'subjects', item })}
            renderAccent={(item) => item.cor}
            renderMeta={(item) =>
              item.professores.length
                ? `${item.professores.length} ${item.professores.length === 1 ? 'professor' : 'professores'}`
                : 'Sem professores vinculados'
            }
            renderTitle={(item) => item.nome}
          />
        ) : null}
        {!isLoading && activeTab === 'rooms' ? (
          <CatalogList
            emptyTitle="Nenhuma sala cadastrada."
            items={rooms}
            onDelete={(item) => void handleDelete('rooms', item.id)}
            onEdit={(item) => setModalState({ tab: 'rooms', item })}
            renderMeta={(item) => `${item.bloco || 'Sem bloco'} - ${item.capacidade} lugares`}
            renderTitle={(item) => item.nome}
          />
        ) : null}
      </div>

      <CatalogModal
        error={error}
        isOpen={Boolean(modalState)}
        isSaving={isSaving}
        modalState={modalState}
        onClose={() => {
          if (!isSaving) {
            setModalState(null);
            setError('');
          }
        }}
        reload={load}
        setError={setError}
        setIsSaving={setIsSaving}
        teachers={teachers}
      />
    </AppShell>
  );
}

type CatalogListProps<TItem> = {
  emptyTitle: string;
  items: TItem[];
  onDelete: (item: TItem) => void;
  onEdit: (item: TItem) => void;
  renderAccent?: (item: TItem) => string;
  renderMeta: (item: TItem) => string;
  renderTitle: (item: TItem) => string;
};

function CatalogList<TItem extends { id: string }>({ emptyTitle, items, onDelete, onEdit, renderAccent, renderMeta, renderTitle }: CatalogListProps<TItem>) {
  if (!items.length) {
    return <EmptyState description="Use o botao de novo cadastro para adicionar o primeiro item." title={emptyTitle} />;
  }

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <article className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm" key={item.id}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {renderAccent ? <span className="h-4 w-4 rounded-full" style={{ backgroundColor: renderAccent(item) }} /> : null}
                <h2 className="truncate text-lg font-semibold text-brand-navy">{renderTitle(item)}</h2>
              </div>
              <p className="mt-1 text-sm font-medium text-slate-500">{renderMeta(item)}</p>
            </div>
            <div className="flex shrink-0 gap-1">
              <button className="rounded-full p-2 text-slate-500 transition hover:bg-blue-50 hover:text-brand-blue" onClick={() => onEdit(item)} type="button">
                <Edit3 className="h-4 w-4" />
              </button>
              <button className="rounded-full p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600" onClick={() => onDelete(item)} type="button">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

type CatalogModalProps = {
  error: string;
  isOpen: boolean;
  isSaving: boolean;
  modalState: ModalState | null;
  onClose: () => void;
  reload: () => Promise<void>;
  setError: (error: string) => void;
  setIsSaving: (value: boolean) => void;
  teachers: User[];
};

function CatalogModal({ error, isOpen, isSaving, modalState, onClose, reload, setError, setIsSaving, teachers }: CatalogModalProps) {
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen || !modalState) {
      return;
    }

    const item = modalState.item;

    if (modalState.tab === 'classes') {
      const classGroup = item as ClassGroup | undefined;
      setForm({
        ano: classGroup?.ano ?? '',
        nome: classGroup?.nome ?? '',
        observacoes: classGroup?.observacoes ?? '',
        turno: classGroup?.turno ?? Turno.MATUTINO
      });
    }

    if (modalState.tab === 'subjects') {
      const subject = item as Subject | undefined;
      setForm({
        cor: subject?.cor ?? subjectColors.Matematica,
        icone: subject?.icone ?? 'BookOpen',
        nome: subject?.nome ?? '',
        professorIds: subject?.professores.map((teacher) => teacher.id).join(',') ?? ''
      });
    }

    if (modalState.tab === 'rooms') {
      const room = item as Room | undefined;
      setForm({
        bloco: room?.bloco ?? '',
        capacidade: String(room?.capacidade ?? 30),
        nome: room?.nome ?? '',
        observacoes: room?.observacoes ?? ''
      });
    }
  }, [isOpen, modalState]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!modalState) {
      return;
    }

    try {
      setIsSaving(true);
      setError('');

      if (modalState.tab === 'classes') {
        const payload: ClassGroupPayload = {
          ano: form.ano,
          nome: form.nome,
          observacoes: form.observacoes,
          turno: form.turno as Turno
        };
        await (modalState.item ? updateClassGroup(modalState.item.id, payload) : createClassGroup(payload));
      }

      if (modalState.tab === 'subjects') {
        const payload: SubjectPayload = {
          cor: form.cor,
          icone: form.icone,
          nome: form.nome,
          professorIds: form.professorIds ? form.professorIds.split(',').filter(Boolean) : []
        };
        await (modalState.item ? updateSubject(modalState.item.id, payload) : createSubject(payload));
      }

      if (modalState.tab === 'rooms') {
        const payload: RoomPayload = {
          bloco: form.bloco,
          capacidade: Number(form.capacidade),
          nome: form.nome,
          observacoes: form.observacoes
        };
        await (modalState.item ? updateRoom(modalState.item.id, payload) : createRoom(payload));
      }

      onClose();
      await reload();
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal className="max-w-2xl" isOpen={isOpen} onClose={onClose} title="Cadastro">
      <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
        {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}

        {modalState?.tab === 'classes' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nome" name="nome" onChange={(event) => setForm((current) => ({ ...current, nome: event.target.value }))} required value={form.nome ?? ''} />
            <Input label="Ano" name="ano" onChange={(event) => setForm((current) => ({ ...current, ano: event.target.value }))} required value={form.ano ?? ''} />
            <Select label="Turno" name="turno" onChange={(event) => setForm((current) => ({ ...current, turno: event.target.value }))} value={form.turno ?? Turno.MATUTINO}>
              <option value={Turno.MATUTINO}>Matutino</option>
              <option value={Turno.VESPERTINO}>Vespertino</option>
            </Select>
            <div className="sm:col-span-2">
              <Textarea label="Observacoes" name="observacoes" onChange={(event) => setForm((current) => ({ ...current, observacoes: event.target.value }))} value={form.observacoes ?? ''} />
            </div>
          </div>
        ) : null}

        {modalState?.tab === 'subjects' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nome" name="nome" onChange={(event) => setForm((current) => ({ ...current, nome: event.target.value }))} required value={form.nome ?? ''} />
            <label className="block" htmlFor="cor">
              <span className="text-sm font-medium text-brand-navy">Cor</span>
              <input className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white p-2" id="cor" onChange={(event) => setForm((current) => ({ ...current, cor: event.target.value }))} type="color" value={form.cor ?? '#2563eb'} />
            </label>
            <Select label="Icone" name="icone" onChange={(event) => setForm((current) => ({ ...current, icone: event.target.value }))} value={form.icone ?? 'BookOpen'}>
              {iconOptions.map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </Select>
            <fieldset className="sm:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <legend className="px-1 text-sm font-semibold text-brand-navy">Professores</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {teachers.map((teacher) => {
                  const selectedIds = form.professorIds ? form.professorIds.split(',').filter(Boolean) : [];
                  const checked = selectedIds.includes(teacher.id);

                  return (
                    <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-600 ring-1 ring-slate-100" key={teacher.id}>
                      <input
                        checked={checked}
                        className="h-4 w-4 accent-brand-blue"
                        onChange={(event) => {
                          const nextIds = event.target.checked
                            ? [...selectedIds, teacher.id]
                            : selectedIds.filter((teacherId) => teacherId !== teacher.id);
                          setForm((current) => ({ ...current, professorIds: nextIds.join(',') }));
                        }}
                        type="checkbox"
                      />
                      {teacher.nomeCompleto}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </div>
        ) : null}

        {modalState?.tab === 'rooms' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nome" name="nome" onChange={(event) => setForm((current) => ({ ...current, nome: event.target.value }))} required value={form.nome ?? ''} />
            <Input label="Bloco" name="bloco" onChange={(event) => setForm((current) => ({ ...current, bloco: event.target.value }))} value={form.bloco ?? ''} />
            <Input label="Capacidade" min={1} name="capacidade" onChange={(event) => setForm((current) => ({ ...current, capacidade: event.target.value }))} required type="number" value={form.capacidade ?? '30'} />
            <div className="sm:col-span-2">
              <Textarea label="Observacoes" name="observacoes" onChange={(event) => setForm((current) => ({ ...current, observacoes: event.target.value }))} value={form.observacoes ?? ''} />
            </div>
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
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
