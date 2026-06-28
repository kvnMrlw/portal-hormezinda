import { CheckCircle2, Crown, Search, ShieldCheck, UsersRound } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { AppShell } from '../components/app/AppShell';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Loading } from '../components/ui/Loading';
import { getAssetUrl } from '../lib/assets';
import { getDisplayRoleLabel } from '../lib/roles';
import { cn } from '../lib/utils';
import { listPeople } from '../services/users';
import { Cargo, type Pagination, type User } from '../types/auth';

const pageSize = 18;
const verifiedRoles = new Set([Cargo.PROFESSOR, Cargo.COORDENADOR, Cargo.DIRETOR]);

function isVerified(user: User): boolean {
  return verifiedRoles.has(user.cargo);
}

export function People() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasError, setHasError] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    async function loadPeople() {
      try {
        setHasError(false);
        setIsLoading(page === 1);
        setIsLoadingMore(page > 1);

        const response = await listPeople({ limit: pageSize, page, search: query.trim() });

        if (requestIdRef.current !== requestId) {
          return;
        }

        setUsers((currentUsers) => (page === 1 ? response.usuarios : [...currentUsers, ...response.usuarios]));
        setPagination(response.paginacao);
      } catch {
        if (requestIdRef.current === requestId) {
          setHasError(true);
        }
      } finally {
        if (requestIdRef.current === requestId) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    }

    void loadPeople();
  }, [page, query]);

  const totalLabel = useMemo(() => {
    if (!pagination) {
      return '';
    }

    return `${pagination.total} ${pagination.total === 1 ? 'pessoa' : 'pessoas'}`;
  }, [pagination]);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="rounded-[1.75rem] border border-white/80 bg-white/80 p-5 shadow-soft backdrop-blur-xl sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-brand-blue ring-1 ring-blue-100">
                  <UsersRound className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Comunidade</p>
                  <h1 className="text-3xl font-semibold tracking-normal text-brand-navy sm:text-4xl">Pessoas</h1>
                </div>
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
                Encontre alunos, professores e colaboradores da escola.
              </p>
            </div>
            {totalLabel ? (
              <span className="w-fit rounded-full bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 ring-1 ring-slate-100">
                {totalLabel}
              </span>
            ) : null}
          </div>

          <label className="mt-7 block" htmlFor="pesquisa-pessoas">
            <span className="sr-only">Pesquisar pessoas</span>
            <div className="flex items-center rounded-[1.35rem] border border-slate-200 bg-white px-5 shadow-sm transition focus-within:border-brand-blue focus-within:ring-4 focus-within:ring-blue-100">
              <Search className="h-5 w-5 shrink-0 text-slate-400" />
              <input
                className="h-16 w-full bg-transparent px-4 text-base font-medium text-brand-navy outline-none placeholder:text-slate-400"
                id="pesquisa-pessoas"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Pesquisar por nome ou username"
                value={query}
              />
            </div>
          </label>
        </header>

        {isLoading ? <Loading className="min-h-64" /> : null}
        {!isLoading && hasError ? (
          <EmptyState description="Tente novamente em alguns instantes." icon={Search} title="Nao foi possivel carregar as pessoas." />
        ) : null}
        {!isLoading && !hasError && !users.length ? (
          <EmptyState description="Ajuste a busca para encontrar outros perfis." icon={UsersRound} title="Nenhuma pessoa encontrada." />
        ) : null}
        {!isLoading && !hasError && users.length ? (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Pessoas da escola">
              {users.map((user) => (
                <Link
                  className="group overflow-hidden rounded-[1.5rem] border border-white/80 bg-white/85 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-soft focus:outline-none focus:ring-4 focus:ring-blue-100"
                  key={user.id}
                  to={`/pessoas/${user.id}`}
                >
                  <div className="h-20 bg-slate-100">
                    {user.bannerPerfil ? (
                      <img
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                        src={getAssetUrl(user.bannerPerfil)}
                      />
                    ) : (
                      <div className="h-full bg-[linear-gradient(135deg,#dbeafe,#ffffff_45%,#dcfce7)]" />
                    )}
                  </div>
                  <div className="px-4 pb-4">
                    <div className="-mt-8 flex items-end justify-between gap-3">
                      <div className="h-16 w-16 overflow-hidden rounded-full border-4 border-white bg-blue-100 text-brand-blue shadow-sm">
                        {user.fotoPerfil ? (
                          <img
                            alt={user.nomeCompleto}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            src={getAssetUrl(user.fotoPerfil)}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xl font-semibold">
                            {user.nomeCompleto.trim().charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1.5">
                        {user.cargo === Cargo.GREMIO ? (
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue text-white shadow-sm" title="Gremio">
                            <Crown className="h-4 w-4" />
                          </span>
                        ) : null}
                        {isVerified(user) ? (
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100" title="Verificado">
                            <ShieldCheck className="h-4 w-4" />
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 min-w-0">
                      <div className="flex min-w-0 items-center gap-2">
                        <h2 className="truncate text-lg font-semibold text-brand-navy">{user.nomeCompleto}</h2>
                        {user.cargo === Cargo.GREMIO ? <CheckCircle2 className="h-5 w-5 shrink-0 fill-brand-blue text-white" /> : null}
                      </div>
                      <p className="mt-1 truncate text-sm font-medium text-slate-500">@{user.usuario}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span
                        className={cn(
                          'rounded-full px-3 py-1 text-xs font-semibold',
                          user.cargo === Cargo.GREMIO ? 'bg-blue-50 text-brand-blue' : 'bg-slate-100 text-slate-700'
                        )}
                      >
                        {getDisplayRoleLabel(user)}
                      </span>
                      {user.turma ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{user.turma}</span> : null}
                    </div>
                  </div>
                </Link>
              ))}
            </section>

            {pagination?.hasMore ? (
              <div className="flex justify-center">
                <Button disabled={isLoadingMore} onClick={() => setPage((currentPage) => currentPage + 1)} type="button" variant="secondary">
                  {isLoadingMore ? 'Carregando...' : 'Carregar mais'}
                </Button>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
