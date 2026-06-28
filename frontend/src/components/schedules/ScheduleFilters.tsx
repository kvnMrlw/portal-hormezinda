import { Filter, Search } from 'lucide-react';

import { Cargo, Turma, type User } from '../../types/auth';
import { Weekday, weekdayLabels, type ScheduleFilters as ScheduleFilterValues } from '../../types/schedules';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

type ScheduleFiltersProps = {
  currentUser?: User | null;
  filters: ScheduleFilterValues;
  onChange: (filters: ScheduleFilterValues) => void;
  teachers: User[];
};

const turmaOptions = Object.values(Turma);
const weekdayOptions = Object.values(Weekday);

export function ScheduleFilters({ currentUser, filters, onChange, teachers }: ScheduleFiltersProps) {
  const canFilterAll = currentUser?.cargo === Cargo.ADMIN || currentUser?.cargo === Cargo.DIRETOR || currentUser?.cargo === Cargo.COORDENADOR;
  const isProfessor = currentUser?.cargo === Cargo.PROFESSOR;

  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-brand-navy">
        <Filter className="h-4 w-4 text-brand-blue" />
        Filtros
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <label className="block md:col-span-2 xl:col-span-1" htmlFor="schedule-search">
          <span className="text-sm font-medium text-brand-navy">Pesquisa</span>
          <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-4 transition focus-within:border-brand-blue focus-within:ring-4 focus-within:ring-blue-100">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              className="h-11 w-full bg-transparent px-3 text-sm font-medium text-brand-navy outline-none placeholder:text-slate-400"
              id="schedule-search"
              onChange={(event) => onChange({ ...filters, search: event.target.value })}
              placeholder="Disciplina, sala..."
              value={filters.search ?? ''}
            />
          </div>
        </label>

        <Select
          disabled={!canFilterAll}
          label="Turma"
          name="turma"
          onChange={(event) => onChange({ ...filters, turma: event.target.value as Turma | '' })}
          value={canFilterAll ? filters.turma ?? '' : currentUser?.turma ?? ''}
        >
          <option value="">Todas</option>
          {turmaOptions.map((turma) => (
            <option key={turma} value={turma}>
              {turma}
            </option>
          ))}
        </Select>

        <Select
          disabled={!canFilterAll || isProfessor}
          label="Professor"
          name="professorId"
          onChange={(event) => onChange({ ...filters, professorId: event.target.value })}
          value={canFilterAll && !isProfessor ? filters.professorId ?? '' : currentUser?.cargo === Cargo.PROFESSOR ? currentUser.id : ''}
        >
          <option value="">Todos</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.nomeCompleto}
            </option>
          ))}
        </Select>

        <Select
          label="Dia"
          name="diaSemana"
          onChange={(event) => onChange({ ...filters, diaSemana: event.target.value as Weekday | '' })}
          value={filters.diaSemana ?? ''}
        >
          <option value="">Todos</option>
          {weekdayOptions.map((weekday) => (
            <option key={weekday} value={weekday}>
              {weekdayLabels[weekday]}
            </option>
          ))}
        </Select>

        <Input
          label="Disciplina"
          name="disciplina"
          onChange={(event) => onChange({ ...filters, disciplina: event.target.value })}
          placeholder="Matematica"
          value={filters.disciplina ?? ''}
        />
      </div>
    </section>
  );
}
