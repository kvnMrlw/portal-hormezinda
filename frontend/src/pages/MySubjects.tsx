import { BookOpen, CalendarDays, FileText, UsersRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { AppShell } from '../components/app/AppShell';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Loading } from '../components/ui/Loading';
import { Modal } from '../components/ui/Modal';
import { getAssetUrl } from '../lib/assets';
import { formatClassName } from '../lib/classes';
import { getAcademicSubject, listAcademicSubjects } from '../services/academic';
import type { AcademicSubject, AcademicTask, DiaryEntry, LessonContent } from '../types/academic';
import { weekdayLabels } from '../types/schedules';

type SubjectDetails = AcademicSubject & {
  conteudos: LessonContent[];
  diarios: DiaryEntry[];
  tarefas: AcademicTask[];
};

export function MySubjects() {
  const [subjects, setSubjects] = useState<AcademicSubject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<SubjectDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSubjects() {
      try {
        setIsLoading(true);
        setSubjects(await listAcademicSubjects());
      } catch {
        setError('Nao foi possivel carregar as disciplinas.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadSubjects();
  }, []);

  async function openDetails(subjectId: string): Promise<void> {
    try {
      setIsDetailsLoading(true);
      setSelectedSubject(await getAcademicSubject(subjectId));
    } catch {
      setError('Nao foi possivel abrir os detalhes da disciplina.');
    } finally {
      setIsDetailsLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="rounded-3xl border border-slate-950/5 bg-portal-surface p-5 shadow-card ring-1 ring-white/80 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
              <BookOpen className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Gestao academica
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-normal text-brand-navy sm:text-4xl">
                Minhas Disciplinas
              </h1>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Disciplinas vinculadas a sua turma, grade ou permissao administrativa.
              </p>
            </div>
          </div>
        </header>

        {error ? (
          <div className="rounded-3xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}
        {isLoading ? <Loading className="min-h-64" /> : null}
        {!isLoading && !subjects.length ? (
          <EmptyState
            description="Assim que houver aulas cadastradas, as disciplinas aparecem aqui."
            icon={BookOpen}
            title="Nenhuma disciplina encontrada."
          />
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {subjects.map((item) => (
            <button
              className="group rounded-3xl border border-slate-950/5 bg-white p-5 text-left shadow-card ring-1 ring-white/80 transition duration-200 hover:-translate-y-1 hover:shadow-hover focus:outline-none focus:ring-4 focus:ring-blue-100"
              key={item.disciplina.id}
              onClick={() => void openDetails(item.disciplina.id)}
              type="button"
            >
              <div className="flex items-start justify-between gap-4">
                <span
                  className="h-12 w-12 rounded-2xl ring-4 ring-white shadow-sm"
                  style={{ backgroundColor: item.disciplina.cor }}
                />
                <Badge variant="info">{item.alunoQuantidade} alunos</Badge>
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-normal text-brand-navy">
                {item.disciplina.nome}
              </h2>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                {item.disciplina.professores.map((teacher) => teacher.nomeCompleto).join(', ') ||
                  'Sem professor vinculado'}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.turmas.map((classGroup) => (
                  <Badge key={classGroup.id}>{formatClassName(classGroup)}</Badge>
                ))}
              </div>
              <p className="mt-4 text-sm font-bold text-brand-blue">Abrir detalhes</p>
            </button>
          ))}
        </section>
      </div>

      <Modal
        className="max-h-[88vh] max-w-4xl overflow-y-auto"
        isOpen={Boolean(selectedSubject) || isDetailsLoading}
        onClose={() => setSelectedSubject(null)}
        title={selectedSubject?.disciplina.nome ?? 'Detalhes'}
      >
        {isDetailsLoading ? (
          <Loading className="min-h-40" />
        ) : selectedSubject ? (
          <SubjectDetailsPanel details={selectedSubject} />
        ) : null}
      </Modal>
    </AppShell>
  );
}

function SubjectDetailsPanel({ details }: { details: SubjectDetails }) {
  const sortedTasks = useMemo(
    () =>
      [...details.tarefas].sort(
        (first, second) =>
          new Date(first.dataEntrega).getTime() - new Date(second.dataEntrega).getTime(),
      ),
    [details.tarefas],
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <InfoTile icon={UsersRound} label="Alunos" value={String(details.alunoQuantidade)} />
        <InfoTile
          icon={CalendarDays}
          label="Turmas"
          value={details.turmas.map(formatClassName).join(', ') || '-'}
        />
        <InfoTile icon={FileText} label="Conteudos" value={String(details.conteudos.length)} />
      </div>

      {details.proximaAula ? (
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
            Proxima aula
          </p>
          <p className="mt-2 text-sm font-semibold text-brand-navy">
            {weekdayLabels[details.proximaAula.diaSemana]} das {details.proximaAula.horarioInicio}{' '}
            as {details.proximaAula.horarioFim} · {formatClassName(details.proximaAula.turma)}
          </p>
        </div>
      ) : null}

      <section>
        <h3 className="text-lg font-semibold text-brand-navy">Conteudos publicados</h3>
        <div className="mt-3 space-y-3">
          {details.conteudos.slice(0, 6).map((content) => (
            <div className="rounded-3xl border border-slate-100 p-4" key={content.id}>
              <p className="font-semibold text-brand-navy">{content.titulo}</p>
              <p className="mt-1 text-sm text-slate-500">{content.descricao}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {content.arquivos.map((file) => (
                  <a
                    className="text-sm font-semibold text-brand-blue"
                    href={getAssetUrl(file.url)}
                    key={file.url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {file.nome}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-brand-navy">Tarefas</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {sortedTasks.slice(0, 6).map((task) => (
            <div className="rounded-3xl bg-slate-50 p-4" key={task.id}>
              <Badge variant="info">{task.tipo}</Badge>
              <p className="mt-2 font-semibold text-brand-navy">{task.titulo}</p>
              <p className="mt-1 text-sm text-slate-500">
                Entrega: {new Date(task.dataEntrega).toLocaleDateString('pt-BR')}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UsersRound;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl bg-slate-50 p-4">
      <Icon className="h-5 w-5 text-brand-blue" />
      <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-brand-navy">{value}</p>
    </div>
  );
}
