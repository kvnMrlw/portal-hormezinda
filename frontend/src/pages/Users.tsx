import {
  CheckCircle2,
  Crown,
  Edit3,
  Filter,
  ImagePlus,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
  UsersRound
} from 'lucide-react';
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from 'react';

import { AppShell } from '../components/app/AppShell';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { Loading } from '../components/ui/Loading';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { getAssetUrl } from '../lib/assets';
import { getDisplayRoleLabel, getRoleLabel } from '../lib/roles';
import { cn } from '../lib/utils';
import {
  createAdminUser,
  deleteAdminUser,
  listAdminUsers,
  promoteUserToGremio,
  updateAdminUser
} from '../services/users';
import { Cargo, Sexo, Turma, Turno, turmasPorTurno, type AdminUserPayload, type User } from '../types/auth';

type RoleFilter = 'TODOS' | Cargo;
type SortMode = 'recentes' | 'antigos' | 'nome-az' | 'nome-za';

type UserFormState = {
  nomeCompleto: string;
  dataNascimento: string;
  usuario: string;
  senha: string;
  cargo: Cargo;
  pertenceGremio: boolean;
  sexo: Sexo | '';
  materia: string;
  turno: Turno | '';
  turma: Turma | '';
  ativo: boolean;
  fotoPerfil?: File;
  bannerPerfil?: File;
};

const emptyForm: UserFormState = {
  nomeCompleto: '',
  dataNascimento: '',
  usuario: '',
  senha: '',
  cargo: Cargo.ALUNO,
  pertenceGremio: false,
  sexo: '',
  materia: '',
  turno: '',
  turma: '',
  ativo: true
};

const roleFilters: { label: string; value: RoleFilter }[] = [
  { label: 'Todos', value: 'TODOS' },
  { label: 'Aluno', value: Cargo.ALUNO },
  { label: 'Professor', value: Cargo.PROFESSOR },
  { label: 'Coordenador', value: Cargo.COORDENADOR },
  { label: 'Diretor', value: Cargo.DIRETOR },
  { label: 'Administrador', value: Cargo.ADMIN },
  { label: 'Gremio', value: Cargo.GREMIO }
];

const sortOptions: { label: string; value: SortMode }[] = [
  { label: 'Mais recentes', value: 'recentes' },
  { label: 'Mais antigos', value: 'antigos' },
  { label: 'Nome A-Z', value: 'nome-az' },
  { label: 'Nome Z-A', value: 'nome-za' }
];

const roleOptions = [Cargo.ALUNO, Cargo.PROFESSOR, Cargo.COORDENADOR, Cargo.DIRETOR, Cargo.ADMIN];

const subjects = [
  'Matematica',
  'Portugues',
  'Historia',
  'Geografia',
  'Biologia',
  'Fisica',
  'Quimica',
  'Ingles',
  'Educacao Fisica',
  'Arte',
  'Filosofia',
  'Sociologia'
];

const usernameRegex = /^(?=.*[a-z])(?=.*\.)[a-z0-9.]{8,}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

function userToForm(user: User): UserFormState {
  return {
    nomeCompleto: user.nomeCompleto,
    dataNascimento: user.dataNascimento ? user.dataNascimento.slice(0, 10) : '',
    usuario: user.usuario,
    senha: '',
    cargo: user.cargo,
    pertenceGremio: user.pertenceGremio,
    sexo: user.sexo ?? '',
    materia: user.materia ?? '',
    turno: user.turno ?? '',
    turma: user.turma ?? '',
    ativo: user.ativo
  };
}

function buildPayload(form: UserFormState, editingUser?: User): AdminUserPayload {
  const payload: AdminUserPayload = {
    sexo: form.sexo || undefined,
    usuario: form.usuario.trim().toLowerCase(),
    ativo: form.ativo,
    dataNascimento: form.dataNascimento || undefined,
    materia: form.cargo === Cargo.PROFESSOR ? form.materia : undefined,
    pertenceGremio: (form.cargo === Cargo.ALUNO || form.cargo === Cargo.GREMIO) && form.pertenceGremio,
    turno: form.cargo === Cargo.ALUNO || form.cargo === Cargo.GREMIO ? form.turno || undefined : undefined,
    turma: form.cargo === Cargo.ALUNO || form.cargo === Cargo.GREMIO ? form.turma || undefined : undefined,
    fotoPerfil: form.fotoPerfil,
    bannerPerfil: form.bannerPerfil
  };

  if (!editingUser || editingUser.cargo !== form.cargo || form.cargo !== Cargo.GREMIO) {
    payload.cargo = form.cargo;
  }

  if (!editingUser) {
    payload.nomeCompleto = form.nomeCompleto.trim();
  }

  if (form.senha) {
    payload.senha = form.senha;
  }

  return payload;
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  return 'Nao foi possivel concluir a solicitacao.';
}

function validateForm(form: UserFormState, users: User[], editingUser?: User): string | null {
  if (!editingUser && form.nomeCompleto.trim().length < 3) {
    return 'Informe o nome completo.';
  }

  if (!usernameRegex.test(form.usuario.trim().toLowerCase())) {
    return 'O username precisa ter 8 caracteres, letras e ponto.';
  }

  const duplicatedUser = users.find((user) => user.usuario === form.usuario.trim().toLowerCase() && user.id !== editingUser?.id);

  if (duplicatedUser) {
    return 'Este username ja esta em uso.';
  }

  if (!editingUser || form.senha) {
    if (!passwordRegex.test(form.senha)) {
      return 'A senha precisa ter 8 caracteres, letras e numeros.';
    }
  }

  if (!form.sexo) {
    return 'Selecione o sexo.';
  }

  if (form.cargo === Cargo.PROFESSOR && !form.materia) {
    return 'Selecione a materia.';
  }

  if ((form.cargo === Cargo.ALUNO || form.cargo === Cargo.GREMIO) && (!form.turno || !form.turma)) {
    return 'Selecione turno e turma.';
  }

  return null;
}

function sortUsers(users: User[], sortMode: SortMode): User[] {
  return [...users].sort((firstUser, secondUser) => {
    if (sortMode === 'antigos') {
      return new Date(firstUser.criadoEm).getTime() - new Date(secondUser.criadoEm).getTime();
    }

    if (sortMode === 'nome-az') {
      return firstUser.nomeCompleto.localeCompare(secondUser.nomeCompleto, 'pt-BR');
    }

    if (sortMode === 'nome-za') {
      return secondUser.nomeCompleto.localeCompare(firstUser.nomeCompleto, 'pt-BR');
    }

    return new Date(secondUser.criadoEm).getTime() - new Date(firstUser.criadoEm).getTime();
  });
}

function isStudent(user: User): boolean {
  return user.cargo === Cargo.ALUNO || user.cargo === Cargo.GREMIO;
}

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('TODOS');
  const [sortMode, setSortMode] = useState<SortMode>('recentes');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [form, setForm] = useState<UserFormState>(emptyForm);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [actionUserId, setActionUserId] = useState<string | null>(null);

  useEffect(() => {
    void loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setIsLoading(true);
      setHasError(false);
      setUsers(await listAdminUsers());
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }

  const visibleUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filteredUsers = users.filter((user) => {
      const roleLabel = getDisplayRoleLabel(user).toLowerCase();
      const matchesQuery =
        !normalizedQuery ||
        user.nomeCompleto.toLowerCase().includes(normalizedQuery) ||
        user.usuario.toLowerCase().includes(normalizedQuery) ||
        roleLabel.includes(normalizedQuery) ||
        getRoleLabel(user.cargo).toLowerCase().includes(normalizedQuery) ||
        user.turma?.toLowerCase().includes(normalizedQuery);

      const matchesRole = roleFilter === 'TODOS' || user.cargo === roleFilter;

      return matchesQuery && matchesRole;
    });

    return sortUsers(filteredUsers, sortMode);
  }, [query, roleFilter, sortMode, users]);

  const totalActive = users.filter((user) => user.ativo).length;
  const totalGremio = users.filter((user) => user.cargo === Cargo.GREMIO || user.pertenceGremio).length;

  function openCreateModal() {
    setEditingUser(undefined);
    setForm(emptyForm);
    setFormError('');
    setIsModalOpen(true);
  }

  function openEditModal(user: User) {
    setEditingUser(user);
    setForm(userToForm(user));
    setFormError('');
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSaving) {
      return;
    }

    setIsModalOpen(false);
    setEditingUser(undefined);
    setForm(emptyForm);
    setFormError('');
  }

  function updateForm<Key extends keyof UserFormState>(key: Key, value: UserFormState[Key]) {
    setForm((current) => {
      const next = { ...current, [key]: value };

      if (key === 'cargo' && value !== Cargo.PROFESSOR) {
        next.materia = '';
      }

      if (key === 'cargo' && value !== Cargo.ALUNO && value !== Cargo.GREMIO) {
        next.turno = '';
        next.turma = '';
        next.pertenceGremio = false;
      }

      if (key === 'turno') {
        next.turma = '';
      }

      return next;
    });
  }

  function handleFileChange(key: 'fotoPerfil' | 'bannerPerfil', event: ChangeEvent<HTMLInputElement>) {
    updateForm(key, event.target.files?.[0]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateForm(form, users, editingUser);

    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setIsSaving(true);
      setFormError('');
      const payload = buildPayload(form, editingUser);
      const savedUser = editingUser ? await updateAdminUser(editingUser.id, payload) : await createAdminUser(payload);

      setUsers((currentUsers) =>
        editingUser
          ? currentUsers.map((user) => (user.id === savedUser.id ? savedUser : user))
          : [savedUser, ...currentUsers]
      );
      closeModal();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(user: User) {
    if (!window.confirm('Deseja realmente excluir este usuario?')) {
      return;
    }

    try {
      setActionUserId(user.id);
      await deleteAdminUser(user.id);
      setUsers((currentUsers) => currentUsers.filter((currentUser) => currentUser.id !== user.id));
    } finally {
      setActionUserId(null);
    }
  }

  async function handlePromote(user: User) {
    try {
      setActionUserId(user.id);
      const promotedUser = await promoteUserToGremio(user.id);
      setUsers((currentUsers) => currentUsers.map((currentUser) => (currentUser.id === promotedUser.id ? promotedUser : currentUser)));
    } finally {
      setActionUserId(null);
    }
  }

  return (
    <AppShell>
      <div className="space-y-5">
        <header className="overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/80 p-5 shadow-soft backdrop-blur-xl sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-brand-blue ring-1 ring-blue-100">
                <UserCog className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Administracao</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-normal text-brand-navy sm:text-3xl">Usuarios</h1>
              </div>
            </div>
            <Button className="w-full sm:w-auto" onClick={openCreateModal} type="button">
              <Plus className="h-4 w-4" />
              Novo usuario
            </Button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50/90 p-4 ring-1 ring-slate-100">
              <p className="text-xs font-semibold text-slate-500">Total</p>
              <strong className="mt-1 block text-2xl text-brand-navy">{users.length}</strong>
            </div>
            <div className="rounded-2xl bg-emerald-50/80 p-4 ring-1 ring-emerald-100">
              <p className="text-xs font-semibold text-emerald-700">Ativos</p>
              <strong className="mt-1 block text-2xl text-emerald-700">{totalActive}</strong>
            </div>
            <div className="rounded-2xl bg-blue-50/80 p-4 ring-1 ring-blue-100">
              <p className="text-xs font-semibold text-brand-blue">Gremio</p>
              <strong className="mt-1 block text-2xl text-brand-blue">{totalGremio}</strong>
            </div>
          </div>
        </header>

        <section className="rounded-[1.75rem] border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur-xl">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_14rem]">
            <label className="block" htmlFor="pesquisa-usuarios">
              <span className="text-sm font-medium text-brand-navy">Pesquisa</span>
              <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-4 transition focus-within:border-brand-blue focus-within:ring-4 focus-within:ring-blue-100">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  className="w-full bg-transparent px-3 py-3 text-sm text-brand-navy outline-none placeholder:text-slate-400"
                  id="pesquisa-usuarios"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Nome, username, cargo ou turma"
                  value={query}
                />
              </div>
            </label>
            <Select label="Ordenacao" name="ordenacao" onChange={(event) => setSortMode(event.target.value as SortMode)} value={sortMode}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {roleFilters.map((filter) => (
              <button
                className={cn(
                  'inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100',
                  roleFilter === filter.value
                    ? 'bg-brand-navy text-white shadow-sm'
                    : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:-translate-y-0.5 hover:bg-blue-50 hover:text-brand-blue hover:ring-blue-100'
                )}
                key={filter.value}
                onClick={() => setRoleFilter(filter.value)}
                type="button"
              >
                <Filter className="h-4 w-4" />
                {filter.label}
              </button>
            ))}
          </div>
        </section>

        {isLoading ? <Loading className="min-h-64" /> : null}
        {!isLoading && hasError ? (
          <EmptyState description="Tente novamente em alguns instantes." icon={Search} title="Nao foi possivel carregar os usuarios." />
        ) : null}
        {!isLoading && !hasError && !visibleUsers.length ? (
          <EmptyState description="Ajuste a busca ou os filtros para encontrar outros usuarios." icon={UsersRound} title="Nenhum usuario encontrado." />
        ) : null}
        {!isLoading && !hasError && visibleUsers.length ? (
          <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3" aria-label="Lista administrativa de usuarios">
            {visibleUsers.map((user) => (
              <article
                className="group overflow-hidden rounded-[1.5rem] border border-white/80 bg-white/85 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-soft"
                key={user.id}
              >
                <div className="h-20 bg-slate-100">
                  {user.bannerPerfil ? (
                    <img alt="" className="h-full w-full object-cover" src={getAssetUrl(user.bannerPerfil)} />
                  ) : (
                    <div className="h-full w-full bg-[linear-gradient(135deg,#dbeafe,#f8fafc_48%,#dcfce7)]" />
                  )}
                </div>

                <div className="px-4 pb-4">
                  <div className="-mt-8 flex items-end justify-between gap-3">
                    <Avatar className="h-16 w-16 border-4 border-white shadow-sm" name={user.nomeCompleto} src={getAssetUrl(user.fotoPerfil)} />
                    <Badge variant={user.ativo ? 'success' : 'error'}>{user.ativo ? 'Ativo' : 'Inativo'}</Badge>
                  </div>

                  <div className="mt-4 min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <h2 className="truncate text-lg font-semibold text-brand-navy">{user.nomeCompleto}</h2>
                      {user.cargo === Cargo.GREMIO || user.pertenceGremio ? (
                        <span aria-label="Selo do Gremio" className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-blue text-white">
                          <CheckCircle2 className="h-4 w-4" />
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 truncate text-sm font-medium text-slate-500">@{user.usuario}</p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="info">{getDisplayRoleLabel(user)}</Badge>
                    {user.pertenceGremio ? <Badge variant="info">Gremio Estudantil</Badge> : null}
                    {user.materia ? <Badge>{user.materia}</Badge> : null}
                    {isStudent(user) && user.turma ? <Badge>{user.turma}</Badge> : null}
                  </div>

                  <div className="mt-5 grid gap-2 sm:grid-cols-3">
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-semibold text-brand-navy transition hover:bg-blue-50 hover:text-brand-blue focus:outline-none focus:ring-4 focus:ring-blue-100"
                      onClick={() => openEditModal(user)}
                      type="button"
                    >
                      <Edit3 className="h-4 w-4" />
                      Editar
                    </button>
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100 disabled:opacity-60"
                      disabled={actionUserId === user.id}
                      onClick={() => void handleDelete(user)}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </button>
                    {user.cargo === Cargo.ALUNO && !user.pertenceGremio ? (
                      <button
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-50 px-3 py-2 text-sm font-semibold text-brand-blue transition hover:bg-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                        disabled={actionUserId === user.id}
                        onClick={() => void handlePromote(user)}
                        type="button"
                      >
                        <Crown className="h-4 w-4" />
                        Promover
                      </button>
                    ) : (
                      <span className="hidden sm:block" />
                    )}
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : null}
      </div>

      <Modal
        className="max-h-[92vh] max-w-3xl overflow-y-auto rounded-[1.5rem]"
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingUser ? 'Editar usuario' : 'Novo usuario'}
      >
        <form className="space-y-5" onSubmit={(event) => void handleSubmit(event)}>
          {formError ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{formError}</div> : null}

          <div className="grid gap-4 md:grid-cols-2">
            {!editingUser ? (
              <Input
                label="Nome completo"
                name="nomeCompleto"
                onChange={(event) => updateForm('nomeCompleto', event.target.value)}
                required
                value={form.nomeCompleto}
              />
            ) : null}
            <Input
              label="Data nascimento"
              name="dataNascimento"
              onChange={(event) => updateForm('dataNascimento', event.target.value)}
              type="date"
              value={form.dataNascimento}
            />
            <Input
              label="Username"
              name="usuario"
              onChange={(event) => updateForm('usuario', event.target.value.toLowerCase())}
              required
              value={form.usuario}
            />
            <Input
              label={editingUser ? 'Nova senha' : 'Senha'}
              name="senha"
              onChange={(event) => updateForm('senha', event.target.value)}
              placeholder={editingUser ? 'Deixe vazio para manter' : undefined}
              required={!editingUser}
              type="password"
              value={form.senha}
            />
            <Select label="Cargo" name="cargo" onChange={(event) => updateForm('cargo', event.target.value as Cargo)} value={form.cargo}>
              {[...roleOptions, ...(editingUser?.cargo === Cargo.GREMIO ? [Cargo.GREMIO] : [])].map((role) => (
                <option key={role} value={role}>
                  {getRoleLabel(role)}
                </option>
              ))}
            </Select>
            <Select label="Sexo" name="sexo" onChange={(event) => updateForm('sexo', event.target.value as Sexo)} required value={form.sexo}>
              <option value="">Selecione</option>
              <option value={Sexo.MASCULINO}>Masculino</option>
              <option value={Sexo.FEMININO}>Feminino</option>
            </Select>
            {form.cargo === Cargo.PROFESSOR ? (
              <Select label="Materia" name="materia" onChange={(event) => updateForm('materia', event.target.value)} required value={form.materia}>
                <option value="">Selecione</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </Select>
            ) : null}
            {form.cargo === Cargo.ALUNO || form.cargo === Cargo.GREMIO ? (
              <>
                <Select label="Turno" name="turno" onChange={(event) => updateForm('turno', event.target.value as Turno)} required value={form.turno}>
                  <option value="">Selecione</option>
                  {Object.values(Turno).map((turno) => (
                    <option key={turno} value={turno}>
                      {turno}
                    </option>
                  ))}
                </Select>
                <Select label="Turma" name="turma" onChange={(event) => updateForm('turma', event.target.value as Turma)} required value={form.turma}>
                  <option value="">Selecione</option>
                  {(form.turno ? turmasPorTurno[form.turno] : Object.values(Turma)).map((turma) => (
                    <option key={turma} value={turma}>
                      {turma}
                    </option>
                  ))}
                </Select>
              </>
            ) : null}
            <Select
              label="Status"
              name="ativo"
              onChange={(event) => updateForm('ativo', event.target.value === 'true')}
              value={String(form.ativo)}
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </Select>
          </div>

          {form.cargo === Cargo.ALUNO || form.cargo === Cargo.GREMIO ? (
            <fieldset className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <legend className="px-1 text-sm font-semibold text-brand-navy">Gremio Estudantil</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-600 ring-1 ring-slate-100">
                  <input
                    checked={!form.pertenceGremio}
                    className="h-4 w-4 accent-brand-blue"
                    onChange={() => updateForm('pertenceGremio', false)}
                    type="radio"
                  />
                  Nao pertence
                </label>
                <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-brand-blue ring-1 ring-blue-100">
                  <input
                    checked={form.pertenceGremio}
                    className="h-4 w-4 accent-brand-blue"
                    onChange={() => updateForm('pertenceGremio', true)}
                    type="radio"
                  />
                  Pertence ao Gremio
                </label>
              </div>
            </fieldset>
          ) : null}

          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm font-semibold text-brand-navy transition hover:border-blue-200 hover:bg-blue-50">
              <ImagePlus className="h-5 w-5 text-brand-blue" />
              Foto
              <input accept="image/*" className="sr-only" name="fotoPerfil" onChange={(event) => handleFileChange('fotoPerfil', event)} type="file" />
              {form.fotoPerfil ? <span className="ml-auto max-w-32 truncate text-xs text-slate-500">{form.fotoPerfil.name}</span> : null}
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm font-semibold text-brand-navy transition hover:border-blue-200 hover:bg-blue-50">
              <ImagePlus className="h-5 w-5 text-brand-blue" />
              Banner
              <input accept="image/*" className="sr-only" name="bannerPerfil" onChange={(event) => handleFileChange('bannerPerfil', event)} type="file" />
              {form.bannerPerfil ? <span className="ml-auto max-w-32 truncate text-xs text-slate-500">{form.bannerPerfil.name}</span> : null}
            </label>
          </div>

          {form.cargo === Cargo.PROFESSOR || form.cargo === Cargo.DIRETOR || form.cargo === Cargo.COORDENADOR ? (
            <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-brand-blue">
              <ShieldCheck className="mr-2 inline h-4 w-4" />
              Exibicao: {getDisplayRoleLabel({ cargo: form.cargo, sexo: form.sexo || undefined })}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button disabled={isSaving} onClick={closeModal} type="button" variant="secondary">
              Cancelar
            </Button>
            <Button disabled={isSaving} type="submit">
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
