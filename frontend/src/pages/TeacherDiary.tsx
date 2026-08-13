import { BookMarked, ClipboardCheck, FileText, ListChecks, Plus, Save, Upload } from 'lucide-react';
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from 'react';

import { AppShell } from '../components/app/AppShell';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { Loading } from '../components/ui/Loading';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { getAssetUrl } from '../lib/assets';
import { formatClassName } from '../lib/classes';
import { getRoleLabel } from '../lib/roles';
import {
  createContent,
  createDiary,
  createTask,
  listAcademicSubjects,
  listTasks,
  listSubmissions,
  reviewSubmission,
  saveAttendance,
} from '../services/academic';
import { listPeople } from '../services/users';
import {
  AcademicTaskType,
  AttendanceStatus,
  SubmissionStatus,
  type AcademicSubject,
  type AcademicTask,
  type TaskSubmission,
} from '../types/academic';
import type { User } from '../types/auth';
import { Cargo } from '../types/auth';
import { weekdayLabels } from '../types/schedules';

type ClassContext = {
  disciplinaId: string;
  professorId?: string;
  turmaId: string;
};

const attendanceLabels: Record<AttendanceStatus, string> = {
  [AttendanceStatus.PRESENT]: 'Presente',
  [AttendanceStatus.ABSENT]: 'Falta',
  [AttendanceStatus.JUSTIFIED]: 'Justificada',
  [AttendanceStatus.LATE]: 'Atraso',
};

function classCode(className: string, year?: string): string {
  const simple = className
    .replace(/\s/g, '')
    .toUpperCase()
    .match(/^([123])([A-Z])$/);
  if (simple) return simple[0];

  return `${year?.match(/[123]/)?.[0] ?? ''}${
    className
      .replace(/\s/g, '')
      .toUpperCase()
      .match(/[A-Z]$/)?.[0] ?? ''
  }`;
}

export function TeacherDiary() {
  const [subjects, setSubjects] = useState<AcademicSubject[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [context, setContext] = useState<ClassContext | null>(null);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [contentForm, setContentForm] = useState({
    data: new Date().toISOString().slice(0, 10),
    descricao: '',
    titulo: '',
  });
  const [taskForm, setTaskForm] = useState({
    dataEntrega: new Date().toISOString().slice(0, 10),
    descricao: '',
    tipo: AcademicTaskType.ACTIVITY,
    titulo: '',
  });
  const [contentFiles, setContentFiles] = useState<File[]>([]);
  const [taskFile, setTaskFile] = useState<File>();
  const [diaryTasks, setDiaryTasks] = useState<AcademicTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [submissionsTask, setSubmissionsTask] = useState<AcademicTask | null>(null);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);

  useEffect(() => {
    async function loadBaseData() {
      try {
        setIsLoading(true);
        const [loadedSubjects, loadedPeople] = await Promise.all([
          listAcademicSubjects(),
          listPeople({ limit: 250 }),
        ]);
        setSubjects(loadedSubjects);
        setStudents(
          loadedPeople.usuarios.filter(
            (user) => user.cargo === Cargo.ALUNO || user.cargo === Cargo.GREMIO,
          ),
        );
        const firstSubject = loadedSubjects[0];
        const firstClass = firstSubject?.turmas[0];
        setContext(
          firstSubject && firstClass
            ? {
                disciplinaId: firstSubject.disciplina.id,
                professorId: firstSubject.disciplina.professores[0]?.id,
                turmaId: firstClass.id,
              }
            : null,
        );
      } catch {
        setMessage('Nao foi possivel carregar o diario.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadBaseData();
  }, []);

  const selectedSubject = subjects.find(
    (subject) => subject.disciplina.id === context?.disciplinaId,
  );
  const selectedClass = selectedSubject?.turmas.find(
    (classGroup) => classGroup.id === context?.turmaId,
  );
  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    const code = classCode(selectedClass.nome, selectedClass.ano);

    return students.filter((student) => student.turma === code);
  }, [selectedClass, students]);
  const selectedProfessorId =
    context?.professorId || selectedSubject?.disciplina.professores[0]?.id;
  const nextLesson = selectedSubject?.proximaAula;

  useEffect(() => {
    setAttendance(
      Object.fromEntries(classStudents.map((student) => [student.id, AttendanceStatus.PRESENT])),
    );
  }, [classStudents]);

  useEffect(() => {
    async function loadDiaryTasks() {
      if (!context) return;

      setDiaryTasks(
        await listTasks({ disciplinaId: context.disciplinaId, turmaId: context.turmaId }),
      );
    }

    void loadDiaryTasks().catch(() => undefined);
  }, [context]);

  async function persistAttendance(nextAttendance = attendance): Promise<void> {
    if (!context) return;

    await saveAttendance({
      data: new Date().toISOString(),
      disciplinaId: context.disciplinaId,
      professorId: selectedProfessorId,
      registros: classStudents.map((student) => ({
        alunoId: student.id,
        status: nextAttendance[student.id] ?? AttendanceStatus.PRESENT,
      })),
      turmaId: context.turmaId,
    });
  }

  async function handleAttendanceChange(
    studentId: string,
    status: AttendanceStatus,
  ): Promise<void> {
    const nextAttendance = { ...attendance, [studentId]: status };
    setAttendance(nextAttendance);
    setMessage('Salvando chamada...');
    try {
      await persistAttendance(nextAttendance);
      setMessage('Chamada salva automaticamente.');
    } catch {
      setMessage('Nao foi possivel salvar a chamada.');
    }
  }

  async function handleContentSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!context) return;

    try {
      setIsSaving(true);
      const content = await createContent({
        ...contentForm,
        arquivos: contentFiles,
        disciplinaId: context.disciplinaId,
        professorId: selectedProfessorId,
        turmaId: context.turmaId,
      });
      await createDiary({
        data: contentForm.data,
        disciplinaId: context.disciplinaId,
        observacoes: `Conteudo registrado: ${content.titulo}`,
        professorId: selectedProfessorId,
        turmaId: context.turmaId,
      });
      setContentForm({ data: new Date().toISOString().slice(0, 10), descricao: '', titulo: '' });
      setContentFiles([]);
      setMessage('Conteudo publicado.');
    } catch {
      setMessage('Nao foi possivel publicar o conteudo.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTaskSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!context) return;

    try {
      setIsSaving(true);
      await createTask({
        ...taskForm,
        arquivo: taskFile,
        disciplinaId: context.disciplinaId,
        professorId: selectedProfessorId,
        turmaId: context.turmaId,
      });
      setTaskForm({
        dataEntrega: new Date().toISOString().slice(0, 10),
        descricao: '',
        tipo: AcademicTaskType.ACTIVITY,
        titulo: '',
      });
      setTaskFile(undefined);
      setDiaryTasks(
        await listTasks({ disciplinaId: context.disciplinaId, turmaId: context.turmaId }),
      );
      setMessage('Tarefa publicada.');
    } catch {
      setMessage('Nao foi possivel publicar a tarefa.');
    } finally {
      setIsSaving(false);
    }
  }

  async function openSubmissions(task: AcademicTask): Promise<void> {
    setSubmissionsTask(task);
    setSubmissions(await listSubmissions(task.id));
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="rounded-3xl border border-slate-950/5 bg-portal-surface p-5 shadow-card ring-1 ring-white/80 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-violet-50 text-violet-600 ring-1 ring-violet-100">
              <BookMarked className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Diario escolar
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-normal text-brand-navy sm:text-4xl">
                Diario do Professor
              </h1>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Chamada, conteudo da aula, tarefas e entregas por disciplina.
              </p>
            </div>
          </div>
        </header>

        {message ? (
          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-4 text-sm font-semibold text-brand-blue">
            {message}
          </div>
        ) : null}
        {isLoading ? <Loading className="min-h-64" /> : null}
        {!isLoading && !subjects.length ? (
          <EmptyState
            description="As disciplinas aparecem quando houver horarios cadastrados para professores."
            icon={BookMarked}
            title="Nenhuma disciplina para diario."
          />
        ) : null}

        {!isLoading && subjects.length ? (
          <>
            <Card className="p-5 shadow-sm">
              <div className="grid gap-4 lg:grid-cols-3">
                <Select
                  label="Disciplina"
                  name="disciplinaId"
                  onChange={(event) => {
                    const subject = subjects.find(
                      (item) => item.disciplina.id === event.target.value,
                    );
                    setContext({
                      disciplinaId: event.target.value,
                      professorId: subject?.disciplina.professores[0]?.id,
                      turmaId: subject?.turmas[0]?.id ?? '',
                    });
                  }}
                  value={context?.disciplinaId ?? ''}
                >
                  {subjects.map((subject) => (
                    <option key={subject.disciplina.id} value={subject.disciplina.id}>
                      {subject.disciplina.nome}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Turma"
                  name="turmaId"
                  onChange={(event) =>
                    setContext((current) =>
                      current ? { ...current, turmaId: event.target.value } : current,
                    )
                  }
                  value={context?.turmaId ?? ''}
                >
                  {selectedSubject?.turmas.map((classGroup) => (
                    <option key={classGroup.id} value={classGroup.id}>
                      {formatClassName(classGroup)}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Professor"
                  name="professorId"
                  onChange={(event) =>
                    setContext((current) =>
                      current ? { ...current, professorId: event.target.value } : current,
                    )
                  }
                  value={selectedProfessorId ?? ''}
                >
                  {selectedSubject?.disciplina.professores.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.nomeCompleto}
                    </option>
                  ))}
                </Select>
              </div>
              {nextLesson ? (
                <p className="mt-4 text-sm font-semibold text-slate-500">
                  Proxima aula: {weekdayLabels[nextLesson.diaSemana]} · {nextLesson.horarioInicio}{' '}
                  as {nextLesson.horarioFim} · {formatClassName(nextLesson.turma)}
                </p>
              ) : null}
            </Card>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
              <Card className="p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-brand-navy">Chamada</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Alteracoes sao salvas automaticamente.
                    </p>
                  </div>
                  <Button
                    onClick={() => void persistAttendance()}
                    type="button"
                    variant="secondary"
                  >
                    <Save className="h-4 w-4" />
                    Salvar
                  </Button>
                </div>
                <div className="mt-4 overflow-hidden rounded-3xl border border-slate-100">
                  {classStudents.map((student) => (
                    <div
                      className="grid gap-3 border-b border-slate-100 p-3 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_12rem]"
                      key={student.id}
                    >
                      <div>
                        <p className="font-semibold text-brand-navy">{student.nomeCompleto}</p>
                        <p className="text-xs font-semibold text-slate-400">
                          {getRoleLabel(student.cargo)}
                        </p>
                      </div>
                      <Select
                        aria-label={`Presenca de ${student.nomeCompleto}`}
                        label="Status"
                        name={`attendance-${student.id}`}
                        onChange={(event) =>
                          void handleAttendanceChange(
                            student.id,
                            event.target.value as AttendanceStatus,
                          )
                        }
                        value={attendance[student.id] ?? AttendanceStatus.PRESENT}
                      >
                        {Object.entries(attendanceLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </Select>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="space-y-5">
                <Card className="p-5 shadow-sm">
                  <h2 className="text-xl font-semibold text-brand-navy">Conteudo da aula</h2>
                  <form
                    className="mt-4 space-y-3"
                    onSubmit={(event) => void handleContentSubmit(event)}
                  >
                    <Input
                      label="Titulo"
                      name="contentTitle"
                      onChange={(event) =>
                        setContentForm((current) => ({ ...current, titulo: event.target.value }))
                      }
                      required
                      value={contentForm.titulo}
                    />
                    <Input
                      label="Data"
                      name="contentDate"
                      onChange={(event) =>
                        setContentForm((current) => ({ ...current, data: event.target.value }))
                      }
                      required
                      type="date"
                      value={contentForm.data}
                    />
                    <Textarea
                      label="Descricao"
                      name="contentDescription"
                      onChange={(event) =>
                        setContentForm((current) => ({ ...current, descricao: event.target.value }))
                      }
                      required
                      value={contentForm.descricao}
                    />
                    <FileField multiple onChange={(files) => setContentFiles(files)} />
                    <Button disabled={isSaving} type="submit">
                      <Plus className="h-4 w-4" />
                      Publicar conteudo
                    </Button>
                  </form>
                </Card>

                <Card className="p-5 shadow-sm">
                  <h2 className="text-xl font-semibold text-brand-navy">Nova tarefa</h2>
                  <form
                    className="mt-4 space-y-3"
                    onSubmit={(event) => void handleTaskSubmit(event)}
                  >
                    <Input
                      label="Titulo"
                      name="taskTitle"
                      onChange={(event) =>
                        setTaskForm((current) => ({ ...current, titulo: event.target.value }))
                      }
                      required
                      value={taskForm.titulo}
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Select
                        label="Tipo"
                        name="taskType"
                        onChange={(event) =>
                          setTaskForm((current) => ({
                            ...current,
                            tipo: event.target.value as AcademicTaskType,
                          }))
                        }
                        value={taskForm.tipo}
                      >
                        {Object.values(AcademicTaskType).map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </Select>
                      <Input
                        label="Data de entrega"
                        name="taskDueDate"
                        onChange={(event) =>
                          setTaskForm((current) => ({
                            ...current,
                            dataEntrega: event.target.value,
                          }))
                        }
                        required
                        type="date"
                        value={taskForm.dataEntrega}
                      />
                    </div>
                    <Textarea
                      label="Descricao"
                      name="taskDescription"
                      onChange={(event) =>
                        setTaskForm((current) => ({ ...current, descricao: event.target.value }))
                      }
                      required
                      value={taskForm.descricao}
                    />
                    <FileField onChange={(files) => setTaskFile(files[0])} />
                    <Button disabled={isSaving} type="submit">
                      <ListChecks className="h-4 w-4" />
                      Publicar tarefa
                    </Button>
                  </form>
                </Card>

                <Card className="p-5 shadow-sm">
                  <h2 className="text-xl font-semibold text-brand-navy">Entregas</h2>
                  <div className="mt-4 space-y-3">
                    {diaryTasks.slice(0, 8).map((task) => (
                      <button
                        className="w-full rounded-3xl border border-slate-100 p-4 text-left transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
                        key={task.id}
                        onClick={() => void openSubmissions(task)}
                        type="button"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-brand-navy">{task.titulo}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              {task.entregasQuantidade} entregas ·{' '}
                              {new Date(task.dataEntrega).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <Badge variant="info">{task.tipo}</Badge>
                        </div>
                      </button>
                    ))}
                    {!diaryTasks.length ? (
                      <p className="text-sm font-medium text-slate-500">
                        Nenhuma tarefa publicada para este contexto.
                      </p>
                    ) : null}
                  </div>
                </Card>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <Modal
        className="max-h-[88vh] max-w-3xl overflow-y-auto"
        isOpen={Boolean(submissionsTask)}
        onClose={() => setSubmissionsTask(null)}
        title="Entregas da tarefa"
      >
        <SubmissionsPanel
          onReviewed={() => (submissionsTask ? void openSubmissions(submissionsTask) : undefined)}
          submissions={submissions}
        />
      </Modal>
    </AppShell>
  );
}

function FileField({
  multiple = false,
  onChange,
}: {
  multiple?: boolean;
  onChange: (files: File[]) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50/50">
      <span className="flex items-center gap-2">
        <Upload className="h-4 w-4 text-brand-blue" />
        Arquivo opcional
      </span>
      <input
        accept=".pdf,.doc,.docx,image/png,image/jpeg,image/webp"
        className="sr-only"
        multiple={multiple}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(Array.from(event.target.files ?? []))
        }
        type="file"
      />
    </label>
  );
}

function SubmissionsPanel({
  onReviewed,
  submissions,
}: {
  onReviewed: () => void;
  submissions: TaskSubmission[];
}) {
  if (!submissions.length) {
    return (
      <EmptyState
        description="As entregas dos alunos aparecem nesta lista."
        icon={FileText}
        title="Nenhuma entrega ainda."
      />
    );
  }

  return (
    <div className="space-y-3">
      {submissions.map((submission) => (
        <div className="rounded-3xl border border-slate-100 p-4" key={submission.id}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-semibold text-brand-navy">{submission.aluno.nomeCompleto}</p>
              <p className="text-sm text-slate-500">
                Entregue em {new Date(submission.entregueEm).toLocaleString('pt-BR')}
              </p>
              {submission.observacaoProfessor ? (
                <p className="mt-2 text-sm text-slate-600">{submission.observacaoProfessor}</p>
              ) : null}
            </div>
            <Badge variant={submission.status === SubmissionStatus.CONFIRMED ? 'success' : 'info'}>
              {submission.status}
            </Badge>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-50 px-4 py-2 text-sm font-semibold text-brand-blue"
              href={getAssetUrl(submission.arquivo.url)}
              rel="noreferrer"
              target="_blank"
            >
              <FileText className="h-4 w-4" />
              Baixar arquivo
            </a>
            <Button
              onClick={async () => {
                await reviewSubmission(submission.id, { status: SubmissionStatus.CONFIRMED });
                onReviewed();
              }}
              type="button"
              variant="secondary"
            >
              <ClipboardCheck className="h-4 w-4" />
              Marcar entregue
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
