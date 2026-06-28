import { Filter, Search } from 'lucide-react';

import { Select } from '../ui/Select';
import { categoryLabels, categoryOptions, priorityLabels, priorityOptions } from './noticeOptions';
import type { NoticeFilters as NoticeFilterValues } from '../../types/notices';

type NoticeFiltersProps = {
  filters: NoticeFilterValues;
  isAdmin: boolean;
  onChange: (filters: NoticeFilterValues) => void;
};

export function NoticeFilters({ filters, isAdmin, onChange }: NoticeFiltersProps) {
  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <label className="block" htmlFor="notice-search">
          <span className="text-sm font-medium text-brand-navy">Pesquisa</span>
          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-brand-blue focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              className="w-full bg-transparent text-sm text-brand-navy outline-none placeholder:text-slate-400"
              id="notice-search"
              onChange={(event) => onChange({ ...filters, search: event.target.value })}
              placeholder="Buscar por titulo, descricao, categoria ou autor"
              type="search"
              value={filters.search ?? ''}
            />
          </div>
        </label>

        <Select
          label="Categoria"
          onChange={(event) => onChange({ ...filters, categoria: event.target.value as NoticeFilterValues['categoria'] })}
          value={filters.categoria ?? 'TODAS'}
        >
          <option value="TODAS">Todas</option>
          {categoryOptions.map((category) => (
            <option key={category} value={category}>
              {categoryLabels[category]}
            </option>
          ))}
        </Select>

        <Select
          label="Prioridade"
          onChange={(event) => onChange({ ...filters, prioridade: event.target.value as NoticeFilterValues['prioridade'] })}
          value={filters.prioridade ?? 'TODAS'}
        >
          <option value="TODAS">Todas</option>
          {priorityOptions.map((priority) => (
            <option key={priority} value={priority}>
              {priorityLabels[priority]}
            </option>
          ))}
        </Select>

        <Select
          label="Filtro"
          onChange={(event) => onChange({ ...filters, status: event.target.value as NoticeFilterValues['status'] })}
          value={filters.status ?? 'TODOS'}
        >
          <option value="TODOS">Todos</option>
          <option value="FIXADOS">Fixados</option>
          <option value="ATIVOS">Ativos</option>
          {isAdmin ? <option value="EXPIRADOS">Expirados</option> : null}
        </Select>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-normal text-slate-400">
        <Filter className="h-4 w-4" />
        Filtros aplicados em tempo real
      </div>
    </section>
  );
}
