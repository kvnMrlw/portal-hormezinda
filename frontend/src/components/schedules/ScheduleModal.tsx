import { Copy, Save } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';

import type { ClassGroup, Room, Subject } from '../../types/catalogs';
import { formatClassName } from '../../lib/classes';
import { ScheduleEntryKind, Weekday, weekdayLabels, type ScheduleEntry, type SchedulePayload } from '../../types/schedules';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';

type ScheduleModalProps = {
  classes: ClassGroup[];
  error?: string;
  isOpen: boolean;
  isSaving: boolean;
  mode: 'create' | 'duplicate' | 'edit';
  onClose: () => void;
  onSubmit: (payload: SchedulePayload) => Promise<void>;
  rooms: Room[];
  schedule?: ScheduleEntry;
  subjects: Subject[];
  initialClassId?: string;
  initialEnd?: string;
  initialStart?: string;
  initialWeekday?: Weekday;
};

type ScheduleFormState = {
  diaSemana: Weekday;
  disciplinaId: string;
  horarioFim: string;
  horarioInicio: string;
  observacao: string;
  professorId: string;
  salaId: string;
  tipo: ScheduleEntryKind;
  turmaId: string;
};

function getInitialState(schedule?: ScheduleEntry, initialClassId = '', initialWeekday = Weekday.MONDAY, initialStart = '07:00', initialEnd = '07:50'): ScheduleFormState {
  return {
    diaSemana: schedule?.diaSemana ?? initialWeekday,
    disciplinaId: schedule?.disciplina?.id ?? '',
    horarioFim: schedule?.horarioFim ?? initialEnd,
    horarioInicio: schedule?.horarioInicio ?? initialStart,
    observacao: schedule?.observacao ?? '',
    professorId: schedule?.professor?.id ?? schedule?.disciplina?.professores[0]?.id ?? '',
    salaId: schedule?.sala?.id ?? '',
    tipo: schedule?.tipo ?? ScheduleEntryKind.LESSON,
    turmaId: schedule?.turma?.id ?? initialClassId
  };
}

export function ScheduleModal({
  classes,
  error,
  isOpen,
  isSaving,
  mode,
  onClose,
  onSubmit,
  rooms,
  schedule,
  subjects,
  initialClassId,
  initialEnd,
  initialStart,
  initialWeekday
}: ScheduleModalProps) {
  const [form, setForm] = useState<ScheduleFormState>(() => getInitialState(schedule, initialClassId, initialWeekday, initialStart, initialEnd));
  const isLesson = form.tipo === ScheduleEntryKind.LESSON;
  const isEditing = mode === 'edit';
  const title = mode === 'edit' ? 'Editar horario' : mode === 'duplicate' ? 'Duplicar horario' : 'Novo horario';
  const selectedSubject = subjects.find((subject) => subject.id === form.disciplinaId);
  const availableTeachers = selectedSubject?.professores.length ? selectedSubject.professores : [];

  useEffect(() => {
    if (isOpen) {
      setForm(getInitialState(schedule, initialClassId, initialWeekday, initialStart, initialEnd));
    }
  }, [initialClassId, initialEnd, initialStart, initialWeekday, isOpen, schedule]);

  function updateSubject(subjectId: string): void {
    const subject = subjects.find((item) => item.id === subjectId);

    setForm((current) => ({
      ...current,
      disciplinaId: subjectId,
      professorId: subject?.professores.some((teacher) => teacher.id === current.professorId)
        ? current.professorId
        : subject?.professores[0]?.id ?? ''
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    await onSubmit({
      diaSemana: form.diaSemana,
      disciplinaId: isLesson ? form.disciplinaId : undefined,
      horarioFim: form.horarioFim,
      horarioInicio: form.horarioInicio,
      observacao: form.observacao.trim(),
      professorId: isLesson ? form.professorId : undefined,
      salaId: isLesson ? form.salaId : undefined,
      tipo: form.tipo,
      turmaId: form.turmaId
    });
  }

  return (
    <Modal className="max-h-[92vh] max-w-3xl overflow-y-auto rounded-[2rem]" isOpen={isOpen} onClose={onClose} title={title}>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          {!isEditing ? (
            <Select
              label="Tipo"
              name="tipo"
              onChange={(event) => setForm((current) => ({ ...current, tipo: event.target.value as ScheduleEntryKind }))}
              value={form.tipo}
            >
              <option value={ScheduleEntryKind.LESSON}>Aula</option>
              <option value={ScheduleEntryKind.INTERVAL}>Intervalo</option>
            </Select>
          ) : null}

          {isLesson ? (
            <Select label="Disciplina" name="disciplinaId" onChange={(event) => updateSubject(event.target.value)} required value={form.disciplinaId}>
              <option value="">Selecione</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.nome}
                </option>
              ))}
            </Select>
          ) : null}

          {!isEditing ? (
            <Select
              label="Sala"
              name="turmaId"
              onChange={(event) => setForm((current) => ({ ...current, turmaId: event.target.value }))}
              required
              value={form.turmaId}
            >
              <option value="">Selecione</option>
              {classes.map((classGroup) => (
                <option key={classGroup.id} value={classGroup.id}>
                  {formatClassName(classGroup)}
                </option>
              ))}
            </Select>
          ) : null}

          {isLesson ? (
            <Select
              label="Professor"
              name="professorId"
              onChange={(event) => setForm((current) => ({ ...current, professorId: event.target.value }))}
              required
              value={form.professorId}
            >
              <option value="">Selecione</option>
              {availableTeachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.nomeCompleto}
                </option>
              ))}
            </Select>
          ) : null}

          {isLesson ? (
            <Select
              label="Sala da aula"
              name="salaId"
              onChange={(event) => setForm((current) => ({ ...current, salaId: event.target.value }))}
              required
              value={form.salaId}
            >
              <option value="">Selecione</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.nome}
                </option>
              ))}
            </Select>
          ) : null}

          {!isEditing ? (
            <Select
              label="Dia da semana"
              name="diaSemana"
              onChange={(event) => setForm((current) => ({ ...current, diaSemana: event.target.value as Weekday }))}
              value={form.diaSemana}
            >
              {Object.values(Weekday).map((weekday) => (
                <option key={weekday} value={weekday}>
                  {weekdayLabels[weekday]}
                </option>
              ))}
            </Select>
          ) : null}

          <Input
            label="Horario inicial"
            name="horarioInicio"
            onChange={(event) => setForm((current) => ({ ...current, horarioInicio: event.target.value }))}
            required
            type="time"
            value={form.horarioInicio}
          />

          <Input
            label="Horario final"
            name="horarioFim"
            onChange={(event) => setForm((current) => ({ ...current, horarioFim: event.target.value }))}
            required
            type="time"
            value={form.horarioFim}
          />

          {isLesson ? <div>
            <span className="text-sm font-medium text-brand-navy">Cor da disciplina</span>
            <div className="mt-2 flex h-11 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-600">
              <span className="h-6 w-6 rounded-full ring-1 ring-black/10" style={{ backgroundColor: selectedSubject?.cor ?? '#e2e8f0' }} />
              {selectedSubject?.cor ?? 'Selecione uma disciplina'}
            </div>
          </div> : null}

          {isLesson ? <div className="sm:col-span-2">
            <Textarea
              label="Observacoes"
              name="observacao"
              onChange={(event) => setForm((current) => ({ ...current, observacao: event.target.value }))}
              rows={3}
              value={form.observacao}
            />
          </div> : null}
        </div>

        {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <Button disabled={isSaving} onClick={onClose} type="button" variant="secondary">
            Cancelar
          </Button>
          <Button disabled={isSaving} type="submit">
            {mode === 'duplicate' ? <Copy className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
