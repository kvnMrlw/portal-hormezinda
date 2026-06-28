import { ArrowRight, CheckCircle2, Crown, Search, ShieldCheck, UsersRound } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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
  return verifiedRoles.has(user.cargo) || user.pertenceGremio;
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
      <div className="mx-auto max-w-4xl space-y-5">
        <header className="border-b border-slate-100 pb-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-brand-blue ring-1 ring-blue-100">
                  <UsersRound className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Comunidade</p>
                  <h1 className="text-2xl font-semibold tracking-normal text-brand-navy sm:text-3xl">Pessoas</h1>
                </div>
              </div>
            </div>
            {totalLabel ? (
              <span className="w-fit text-sm font-semibold text-slate-500">
                {totalLabel}
              </span>
            ) : null}
          </div>

          <label className="mt-6 block" htmlFor="pesquisa-pessoas">
            <span className="sr-only">Pesquisar pessoas</span>
            <div className="flex items-center rounded-full border border-slate-200 bg-white px-5 shadow-sm transition focus-within:border-brand-blue focus-within:ring-4 focus-within:ring-blue-100">
              <Search className="h-5 w-5 shrink-0 text-slate-400" />
              <input
                className="h-14 w-full bg-transparent px-4 text-base font-medium text-brand-navy outline-none placeholder:text-slate-400"
                id="pesquisa-pessoas"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Pesquisar"
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
            <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm" aria-label="Pessoas da escola">
              {users.map((user) => (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="border-b border-slate-100 last:border-b-0"
                  initial={{ opacity: 0, y: 8 }}
                  key={user.id}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                  <Link
                    className="group grid gap-4 px-4 py-4 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-inset focus:ring-blue-100 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:px-5"
                    to={`/pessoas/${user.id}`}
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-blue-100 text-brand-blue ring-1 ring-slate-100 sm:h-[4.5rem] sm:w-[4.5rem]">
                        {user.fotoPerfil ? (
                          <img
                            alt={user.nomeCompleto}
                            className="h-full w-full object-cover"
                            decoding="async"
                            loading="lazy"
                            src={getAssetUrl(user.fotoPerfil)}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xl font-semibold">
                            {user.nomeCompleto.trim().charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-2">
                          <h2 className="truncate text-base font-semibold text-brand-navy sm:text-lg">{user.nomeCompleto}</h2>
                          {user.cargo === Cargo.GREMIO || user.pertenceGremio ? <CheckCircle2 className="h-5 w-5 shrink-0 fill-brand-blue text-white" /> : null}
                        </div>
                        <p className="mt-0.5 truncate text-sm font-medium text-slate-500">@{user.usuario}</p>
                      </div>
                    </div>

                    <div className="flex min-w-0 flex-wrap items-center gap-2 pl-20 sm:pl-0">
                      <span className="truncate text-sm font-semibold text-slate-600">{getDisplayRoleLabel(user)}</span>
                      {user.cargo === Cargo.GREMIO || user.pertenceGremio ? (
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-blue text-white" title="Gremio">
                          <Crown className="h-4 w-4" />
                        </span>
                      ) : null}
                      {isVerified(user) ? (
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100" title="Verificado">
                          <ShieldCheck className="h-4 w-4" />
                        </span>
                      ) : null}
                      {user.turma ? <span className="text-sm font-medium text-slate-400">{user.turma}</span> : null}
                    </div>

                    <div className="flex items-center justify-end pl-20 sm:pl-0">
                      <span className={cn(
                        'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
                        'bg-slate-50 text-brand-navy ring-1 ring-slate-100 group-hover:bg-brand-blue group-hover:text-white group-hover:ring-brand-blue'
                      )}>
                        Ver Perfil
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
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
