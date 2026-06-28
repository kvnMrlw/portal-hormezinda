import { Search, UsersRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { AppShell } from '../components/app/AppShell';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { Loading } from '../components/ui/Loading';
import { Select } from '../components/ui/Select';
import { useAuth } from '../contexts/useAuth';
import { getAssetUrl } from '../lib/assets';
import { getRoleLabel, canViewRole } from '../lib/roles';
import { cn } from '../lib/utils';
import { listUsers } from '../services/users';
import { Cargo, Turma, Turno, type User } from '../types/auth';

type FilterMode = 'todos' | 'turno' | 'turma' | 'cargo';

const filterModes: { label: string; value: FilterMode }[] = [
  { label: 'Todos', value: 'todos' },
  { label: 'Turno', value: 'turno' },
  { label: 'Turma', value: 'turma' },
  { label: 'Cargo', value: 'cargo' }
];

export function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [query, setQuery] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('todos');
  const [filterValue, setFilterValue] = useState('');

  useEffect(() => {
    async function loadUsers() {
      try {
        setIsLoading(true);
        setHasError(false);
        setUsers(await listUsers());
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }

    void loadUsers();
  }, []);

  const visibleUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return users.filter((user) => {
      if (!canViewRole(currentUser?.cargo, user.cargo)) {
        return false;
      }

      const matchesQuery =
        !normalizedQuery ||
        user.nomeCompleto.toLowerCase().includes(normalizedQuery) ||
        user.usuario.toLowerCase().includes(normalizedQuery);

      const matchesFilter =
        filterMode === 'todos' ||
        !filterValue ||
        (filterMode === 'turno' && user.turno === filterValue) ||
        (filterMode === 'turma' && user.turma === filterValue) ||
        (filterMode === 'cargo' && user.cargo === filterValue);

      return matchesQuery && matchesFilter;
    });
  }, [currentUser?.cargo, filterMode, filterValue, query, users]);

  function handleFilterModeChange(mode: FilterMode) {
    setFilterMode(mode);
    setFilterValue('');
  }

  return (
    <AppShell>
      <div className="space-y-5">
        <header className="rounded-[2rem] bg-white/85 p-5 shadow-sm ring-1 ring-white sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-3xl bg-blue-50 text-brand-blue">
              <UsersRound className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-normal text-brand-navy">Usuarios</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Encontre pessoas da comunidade escolar e acesse perfis publicos.
              </p>
            </div>
          </div>
        </header>

        <Card className="space-y-4 p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_16rem]">
            <Input label="Pesquisa" name="pesquisa" onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome ou usuario" value={query} />
            {filterMode !== 'todos' ? (
              <Select label="Filtro" name="filtro" onChange={(event) => setFilterValue(event.target.value)} value={filterValue}>
                <option value="">Todos</option>
                {filterMode === 'turno' ? Object.values(Turno).map((value) => <option key={value} value={value}>{value}</option>) : null}
                {filterMode === 'turma' ? Object.values(Turma).map((value) => <option key={value} value={value}>{value}</option>) : null}
                {filterMode === 'cargo' ? Object.values(Cargo).map((value) => <option key={value} value={value}>{getRoleLabel(value)}</option>) : null}
              </Select>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {filterModes.map((mode) => (
              <button
                className={cn(
                  'rounded-2xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-blue-100',
                  filterMode === mode.value ? 'bg-brand-blue text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-brand-blue'
                )}
                key={mode.value}
                onClick={() => handleFilterModeChange(mode.value)}
                type="button"
              >
                {mode.label}
              </button>
            ))}
          </div>
        </Card>

        {isLoading ? <Loading className="min-h-64" /> : null}
        {!isLoading && hasError ? (
          <EmptyState description="Tente novamente em alguns instantes." icon={Search} title="Nao foi possivel carregar os usuarios." />
        ) : null}
        {!isLoading && !hasError && !visibleUsers.length ? (
          <EmptyState description="Ajuste a busca ou os filtros para encontrar outros perfis." icon={UsersRound} title="Nenhum usuario encontrado." />
        ) : null}
        {!isLoading && !hasError && visibleUsers.length ? (
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-label="Lista de usuarios">
            {visibleUsers.map((user) => (
              <Card className="group p-0 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-soft" key={user.id}>
                <Link className="flex h-full gap-4 p-4 outline-none focus-visible:ring-4 focus-visible:ring-blue-100" to={`/usuarios/${user.id}`}>
                  <Avatar className="h-14 w-14 shrink-0" name={user.nomeCompleto} src={getAssetUrl(user.fotoPerfil)} />
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-semibold text-brand-navy">{user.nomeCompleto}</h2>
                    <p className="mt-1 truncate text-sm text-slate-500">@{user.usuario}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="info">{getRoleLabel(user.cargo)}</Badge>
                      {user.turma ? <Badge>{user.turma}</Badge> : null}
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}
