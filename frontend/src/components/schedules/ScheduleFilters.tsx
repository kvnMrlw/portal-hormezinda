import { Filter, Search } from 'lucide-react';

import { Cargo, type User } from '../../types/auth';
import type { ClassGroup, Room, Subject } from '../../types/catalogs';
import { Weekday, weekdayLabels, type ScheduleFilters as ScheduleFilterValues } from '../../types/schedules';
import { Select } from '../ui/Select';

type ScheduleFiltersProps = {
  currentUser?: User | null;
  filters: ScheduleFilterValues;
  onChange: (filters: ScheduleFilterValues) => void;
  rooms: Room[];
  subjects: Subject[];
  teachers: User[];
  classes: ClassGroup[];
};

const weekdayOptions = Object.values(Weekday);

export function ScheduleFilters({ classes, currentUser, filters, onChange, rooms, subjects, teachers }: ScheduleFiltersProps) {
  const canFilterAll = currentUser?.cargo === Cargo.ADMIN || currentUser?.cargo === Cargo.DIRETOR || currentUser?.cargo === Cargo.COORDENADOR;
  const isProfessor = currentUser?.cargo === Cargo.PROFESSOR;
  const currentUserClass = classes.find((classGroup) => classGroup.nome === currentUser?.turma);

  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-brand-navy">
        <Filter className="h-4 w-4 text-brand-blue" />
        Filtros
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <label className="block md:col-span-2 xl:col-span-1" htmlFor="schedule-search">
          <span className="text-sm font-medium text-brand-navy">Pesquisa</span>
          <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-4 transition focus-within:border-brand-blue focus-within:ring-4 focus-within:ring-blue-100">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              className="h-11 w-full bg-transparent px-3 text-sm font-medium text-brand-navy outline-none placeholder:text-slate-400"
              id="schedule-search"
              onChange={(event) => onChange({ ...filters, search: event.target.value })}
              placeholder="Observacoes..."
              value={filters.search ?? ''}
            />
          </div>
        </label>

        <Select
          disabled={!canFilterAll}
          label="Turma"
          name="turmaId"
          onChange={(event) => onChange({ ...filters, turmaId: event.target.value })}
          value={canFilterAll ? filters.turmaId ?? '' : currentUserClass?.id ?? ''}
        >
          <option value="">Todas</option>
          {classes.map((classGroup) => (
            <option key={classGroup.id} value={classGroup.id}>
              {classGroup.nome}
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

        <Select
          label="Disciplina"
          name="disciplinaId"
          onChange={(event) => onChange({ ...filters, disciplinaId: event.target.value })}
          value={filters.disciplinaId ?? ''}
        >
          <option value="">Todas</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.nome}
            </option>
          ))}
        </Select>

        <Select
          disabled={!canFilterAll}
          label="Sala"
          name="salaId"
          onChange={(event) => onChange({ ...filters, salaId: event.target.value })}
          value={filters.salaId ?? ''}
        >
          <option value="">Todas</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.nome}
            </option>
          ))}
        </Select>
      </div>
    </section>
  );
}
