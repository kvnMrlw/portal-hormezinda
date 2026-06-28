import { Copy, Save } from 'lucide-react';
import { type FormEvent, useEffect, useMemo, useState } from 'react';

import { Turma, type User } from '../../types/auth';
import { ScheduleEntryKind, Weekday, subjectColors, weekdayLabels, type ScheduleEntry, type SchedulePayload } from '../../types/schedules';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';

type ScheduleModalProps = {
  error?: string;
  isOpen: boolean;
  isSaving: boolean;
  mode: 'create' | 'duplicate' | 'edit';
  onClose: () => void;
  onSubmit: (payload: SchedulePayload) => Promise<void>;
  schedule?: ScheduleEntry;
  teachers: User[];
};

type ScheduleFormState = {
  cor: string;
  diaSemana: Weekday;
  disciplina: string;
  horarioFim: string;
  horarioInicio: string;
  observacao: string;
  professorId: string;
  sala: string;
  tipo: ScheduleEntryKind;
  turma: Turma | '';
};

const subjects = [
  'Matematica',
  'Portugues',
  'Historia',
  'Ciencias',
  'Geografia',
  'Artes',
  'Educacao Fisica',
  'Biologia',
  'Fisica',
  'Quimica',
  'Ingles',
  'Sociologia'
];

function getInitialState(schedule?: ScheduleEntry, mode: ScheduleModalProps['mode'] = 'create'): ScheduleFormState {
  return {
    cor: schedule?.cor ?? subjectColors.Matematica,
    diaSemana: schedule?.diaSemana ?? Weekday.MONDAY,
    disciplina: mode === 'duplicate' && schedule ? `${schedule.disciplina} (copia)` : schedule?.disciplina ?? 'Matematica',
    horarioFim: schedule?.horarioFim ?? '07:50',
    horarioInicio: schedule?.horarioInicio ?? '07:00',
    observacao: schedule?.observacao ?? '',
    professorId: schedule?.professor?.id ?? '',
    sala: schedule?.sala ?? '',
    tipo: schedule?.tipo ?? ScheduleEntryKind.LESSON,
    turma: schedule?.turma ?? ''
  };
}

export function ScheduleModal({ error, isOpen, isSaving, mode, onClose, onSubmit, schedule, teachers }: ScheduleModalProps) {
  const [form, setForm] = useState<ScheduleFormState>(() => getInitialState(schedule, mode));
  const isLesson = form.tipo === ScheduleEntryKind.LESSON;
  const title = mode === 'edit' ? 'Editar horario' : mode === 'duplicate' ? 'Duplicar horario' : 'Novo horario';

  useEffect(() => {
    if (isOpen) {
      setForm(getInitialState(schedule, mode));
    }
  }, [isOpen, mode, schedule]);

  const selectedSubjectColor = useMemo(() => subjectColors[form.disciplina] ?? form.cor, [form.cor, form.disciplina]);

  function updateSubject(subject: string): void {
    setForm((current) => ({
      ...current,
      cor: subjectColors[subject] ?? current.cor,
      disciplina: subject
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    await onSubmit({
      cor: form.cor,
      diaSemana: form.diaSemana,
      disciplina: form.disciplina.trim(),
      horarioFim: form.horarioFim,
      horarioInicio: form.horarioInicio,
      observacao: form.observacao.trim(),
      professorId: isLesson ? form.professorId : undefined,
      sala: isLesson ? form.sala.trim() : undefined,
      tipo: form.tipo,
      turma: form.turma || undefined
    });
  }

  return (
    <Modal className="max-h-[92vh] max-w-3xl overflow-y-auto rounded-[2rem]" isOpen={isOpen} onClose={onClose} title={title}>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Tipo"
            name="tipo"
            onChange={(event) => setForm((current) => ({ ...current, tipo: event.target.value as ScheduleEntryKind }))}
            value={form.tipo}
          >
            <option value={ScheduleEntryKind.LESSON}>Aula</option>
            <option value={ScheduleEntryKind.INTERVAL}>Intervalo</option>
          </Select>

          <Select
            label={isLesson ? 'Disciplina' : 'Intervalo'}
            name="disciplina"
            onChange={(event) => updateSubject(event.target.value)}
            value={subjects.includes(form.disciplina) ? form.disciplina : ''}
          >
            <option value="">{form.disciplina || 'Personalizado'}</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </Select>

          {!subjects.includes(form.disciplina) || !isLesson ? (
            <Input
              label={isLesson ? 'Nome da disciplina' : 'Nome do intervalo'}
              name="disciplinaCustom"
              onChange={(event) => setForm((current) => ({ ...current, disciplina: event.target.value }))}
              required
              value={form.disciplina}
            />
          ) : null}

          <Select
            label="Turma"
            name="turma"
            onChange={(event) => setForm((current) => ({ ...current, turma: event.target.value as Turma | '' }))}
            required={isLesson}
            value={form.turma}
          >
            <option value="">Todas</option>
            {Object.values(Turma).map((turma) => (
              <option key={turma} value={turma}>
                {turma}
              </option>
            ))}
          </Select>

          {isLesson ? (
            <Select
              label="Professor"
              name="professorId"
              onChange={(event) => setForm((current) => ({ ...current, professorId: event.target.value }))}
              required
              value={form.professorId}
            >
              <option value="">Selecione</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.nomeCompleto}
                </option>
              ))}
            </Select>
          ) : null}

          {isLesson ? (
            <Input
              label="Sala"
              name="sala"
              onChange={(event) => setForm((current) => ({ ...current, sala: event.target.value }))}
              placeholder="Sala 08"
              required
              value={form.sala}
            />
          ) : null}

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

          <label className="block" htmlFor="cor">
            <span className="text-sm font-medium text-brand-navy">Cor</span>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <span className="h-7 w-7 rounded-full ring-1 ring-black/10" style={{ backgroundColor: selectedSubjectColor }} />
              <input
                className="h-8 w-14 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                id="cor"
                onChange={(event) => setForm((current) => ({ ...current, cor: event.target.value }))}
                type="color"
                value={form.cor}
              />
            </div>
          </label>

          <div className="sm:col-span-2">
            <Textarea
              label="Observacoes"
              name="observacao"
              onChange={(event) => setForm((current) => ({ ...current, observacao: event.target.value }))}
              rows={3}
              value={form.observacao}
            />
          </div>
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
