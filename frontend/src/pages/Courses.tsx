import { BookOpenCheck, FileText, ImageIcon, LinkIcon, Plus, Search, Video, X } from 'lucide-react';
import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

import { AppShell } from '../components/app/AppShell';
import { CourseCard } from '../components/courses/CourseCard';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { Loading } from '../components/ui/Loading';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { useAuth } from '../contexts/useAuth';
import { getAssetUrl } from '../lib/assets';
import { isAdminRole } from '../lib/roles';
import { createCourse, deleteCourse, listCourses, updateCourse } from '../services/courses';
import { listUsers } from '../services/users';
import { Cargo, type User } from '../types/auth';
import {
  CourseContentType,
  CourseStatus,
  courseContentTypeLabels,
  courseStatusLabels,
  type Course,
  type CourseContent,
  type CoursePayload
} from '../types/courses';

type ContentDraft = Pick<CourseContent, 'link' | 'ordem' | 'texto' | 'tipo' | 'titulo'>;

const emptyContent: ContentDraft = {
  link: '',
  ordem: 0,
  texto: '',
  tipo: CourseContentType.TEXT,
  titulo: ''
};

const emptyPayload: CoursePayload = {
  categoria: '',
  conteudos: [],
  descricao: '',
  link: '',
  professorId: '',
  status: CourseStatus.DRAFT,
  titulo: ''
};

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  return 'Nao foi possivel concluir a solicitacao.';
}

function getContentIcon(type: CourseContentType) {
  if (type === CourseContentType.PDF) return FileText;
  if (type === CourseContentType.VIDEO) return Video;
  if (type === CourseContentType.IMAGE) return ImageIcon;
  if (type === CourseContentType.LINK) return LinkIcon;

  return BookOpenCheck;
}

function contentFromCourse(course: Course): ContentDraft[] {
  return course.conteudos
    .filter((content) => content.tipo === CourseContentType.TEXT || content.tipo === CourseContentType.LINK)
    .map((content) => ({
      link: content.link ?? '',
      ordem: content.ordem,
      texto: content.texto ?? '',
      tipo: content.tipo,
      titulo: content.titulo
    }));
}

export function Courses() {
  const { user } = useAuth();
  const isAdmin = isAdminRole(user?.cargo);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [payload, setPayload] = useState<CoursePayload>(emptyPayload);
  const [contents, setContents] = useState<ContentDraft[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  const categories = useMemo(() => Array.from(new Set(courses.map((course) => course.categoria))).filter(Boolean).sort(), [courses]);

  const loadCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      setCourses(await listCourses({ categoria: category, search }));
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    async function loadTeachers() {
      try {
        const loadedUsers = await listUsers();
        setTeachers(loadedUsers.filter((item) => item.cargo === Cargo.PROFESSOR && item.ativo));
      } catch {
        setTeachers([]);
      }
    }

    void loadTeachers();
  }, []);

  function openCreate(): void {
    setEditingCourse(null);
    setPayload({ ...emptyPayload, professorId: teachers[0]?.id ?? '' });
    setContents([]);
    setIsModalOpen(true);
  }

  function openEdit(course: Course): void {
    setEditingCourse(course);
    setPayload({
      categoria: course.categoria,
      conteudos: contentFromCourse(course),
      descricao: course.descricao,
      link: course.link ?? '',
      professorId: course.professor.id,
      status: course.status,
      titulo: course.titulo
    });
    setContents(contentFromCourse(course));
    setIsModalOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    try {
      setIsSaving(true);
      setError('');
      const nextPayload = {
        ...payload,
        conteudos: contents.map((content, index) => ({ ...content, ordem: index }))
      };

      if (editingCourse) {
        await updateCourse(editingCourse.id, nextPayload);
      } else {
        await createCourse(nextPayload);
      }

      setIsModalOpen(false);
      await loadCourses();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(course: Course): Promise<void> {
    if (!window.confirm(`Excluir "${course.titulo}"?`)) {
      return;
    }

    try {
      await deleteCourse(course.id);
      setCourses((current) => current.filter((item) => item.id !== course.id));
      if (selectedCourse?.id === course.id) {
        setSelectedCourse(null);
      }
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-sky-50 text-brand-blue ring-1 ring-sky-100">
                <BookOpenCheck className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Apple Education mood</p>
                <h1 className="mt-1 text-3xl font-semibold tracking-normal text-brand-navy sm:text-4xl">Cursos</h1>
              </div>
            </div>
            {isAdmin ? (
              <Button onClick={openCreate} type="button">
                <Plus className="h-4 w-4" />
                Novo curso
              </Button>
            ) : null}
          </div>
        </header>

        <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_16rem]">
            <label className="block" htmlFor="course-search">
              <span className="text-sm font-medium text-brand-navy">Busca</span>
              <div className="mt-2 flex items-center rounded-2xl border border-slate-200 px-4 focus-within:ring-4 focus-within:ring-blue-100">
                <Search className="h-4 w-4 text-slate-400" />
                <input className="h-11 w-full bg-transparent px-3 text-sm font-medium outline-none" id="course-search" onChange={(event) => setSearch(event.target.value)} placeholder="Titulo, categoria..." value={search} />
              </div>
            </label>
            <Select label="Categoria" name="categoria" onChange={(event) => setCategory(event.target.value)} value={category}>
              <option value="">Todas</option>
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
          </div>
        </section>

        {error ? <div className="rounded-3xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div> : null}
        {isLoading ? <Loading className="min-h-64" /> : null}
        {!isLoading && !courses.length ? <EmptyState description="Nenhum material interno encontrado." icon={BookOpenCheck} title="Nenhum curso disponivel." /> : null}
        {!isLoading && courses.length ? (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <CourseCard canManage={isAdmin} course={course} key={course.id} onDelete={(item) => void handleDelete(item)} onEdit={openEdit} onOpen={setSelectedCourse} />
            ))}
          </section>
        ) : null}
      </div>

      <CourseDetail course={selectedCourse} onClose={() => setSelectedCourse(null)} />

      <Modal className="max-h-[92vh] max-w-4xl overflow-y-auto" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCourse ? 'Editar curso' : 'Novo curso'}>
        <form className="space-y-5" onSubmit={(event) => void handleSubmit(event)}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Titulo" name="titulo" onChange={(event) => setPayload((current) => ({ ...current, titulo: event.target.value }))} required value={payload.titulo} />
            <Input label="Categoria" name="categoria" onChange={(event) => setPayload((current) => ({ ...current, categoria: event.target.value }))} required value={payload.categoria} />
            <Select label="Professor responsavel" name="professorId" onChange={(event) => setPayload((current) => ({ ...current, professorId: event.target.value }))} required value={payload.professorId}>
              <option value="">Selecione</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>{teacher.nomeCompleto}</option>
              ))}
            </Select>
            <Select label="Status" name="status" onChange={(event) => setPayload((current) => ({ ...current, status: event.target.value as CourseStatus }))} value={payload.status}>
              {Object.values(CourseStatus).map((status) => (
                <option key={status} value={status}>{courseStatusLabels[status]}</option>
              ))}
            </Select>
            <Input label="Link opcional" name="link" onChange={(event) => setPayload((current) => ({ ...current, link: event.target.value }))} type="url" value={payload.link ?? ''} />
            <Input accept="image/*" label="Imagem de capa" name="capa" onChange={(event) => setPayload((current) => ({ ...current, capa: event.target.files?.[0] }))} type="file" />
            <div className="md:col-span-2">
              <Textarea label="Descricao" name="descricao" onChange={(event) => setPayload((current) => ({ ...current, descricao: event.target.value }))} required rows={4} value={payload.descricao} />
            </div>
            <div className="md:col-span-2">
              <Input accept=".pdf,image/*,video/mp4,video/webm" label="Arquivos opcionais" multiple name="arquivos" onChange={(event) => setPayload((current) => ({ ...current, arquivos: Array.from(event.target.files ?? []) }))} type="file" />
            </div>
          </div>

          <section className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-brand-navy">Conteudos</h3>
              <Button className="px-3 py-2" onClick={() => setContents((current) => [...current, { ...emptyContent, ordem: current.length }])} type="button" variant="secondary">
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </div>
            <div className="mt-4 space-y-3">
              {contents.map((content, index) => (
                <div className="rounded-2xl border border-slate-200 bg-white p-3" key={index}>
                  <div className="grid gap-3 md:grid-cols-[1fr_10rem_auto]">
                    <Input label="Titulo" name={`content-title-${index}`} onChange={(event) => setContents((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, titulo: event.target.value } : item))} value={content.titulo} />
                    <Select label="Tipo" name={`content-type-${index}`} onChange={(event) => setContents((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, tipo: event.target.value as CourseContentType } : item))} value={content.tipo}>
                      <option value={CourseContentType.TEXT}>Texto</option>
                      <option value={CourseContentType.LINK}>Link</option>
                    </Select>
                    <button aria-label="Remover conteudo" className="mt-7 inline-flex h-11 items-center justify-center rounded-2xl bg-red-50 px-3 text-red-600" onClick={() => setContents((current) => current.filter((_, itemIndex) => itemIndex !== index))} type="button">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {content.tipo === CourseContentType.LINK ? (
                    <Input className="mt-3" label="URL" name={`content-link-${index}`} onChange={(event) => setContents((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, link: event.target.value } : item))} type="url" value={content.link ?? ''} />
                  ) : (
                    <div className="mt-3">
                      <Textarea label="Texto" name={`content-text-${index}`} onChange={(event) => setContents((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, texto: event.target.value } : item))} rows={3} value={content.texto ?? ''} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Button disabled={isSaving} onClick={() => setIsModalOpen(false)} type="button" variant="secondary">Cancelar</Button>
            <Button disabled={isSaving} type="submit">Salvar curso</Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}

function CourseDetail({ course, onClose }: { course: Course | null; onClose: () => void }) {
  if (!course) return null;

  return (
    <Modal className="max-h-[92vh] max-w-5xl overflow-y-auto p-0" isOpen={Boolean(course)} onClose={onClose} title={course.titulo}>
      <div className="-mx-6 -mt-5">
        <div className="relative aspect-[16/7] bg-slate-100">
          {course.capa ? <img alt={course.capa.alt || course.titulo} className="h-full w-full object-cover" src={getAssetUrl(course.capa.url)} /> : null}
        </div>
      </div>
      <div className="space-y-5 pt-5">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand-blue">{course.categoria}</p>
          <p className="mt-2 text-sm font-semibold text-slate-500">Prof. {course.professor.nomeCompleto}</p>
          <p className="mt-4 leading-7 text-slate-600">{course.descricao}</p>
          {course.link ? <a className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand-blue" href={course.link} rel="noreferrer" target="_blank"><LinkIcon className="h-4 w-4" />Abrir link do curso</a> : null}
        </div>
        <div className="grid gap-3">
          {course.conteudos.map((content) => {
            const Icon = getContentIcon(content.tipo);
            return (
              <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4" key={content.id ?? `${content.titulo}-${content.ordem}`}>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-brand-blue ring-1 ring-slate-100"><Icon className="h-5 w-5" /></span>
                  <div>
                    <h3 className="font-semibold text-brand-navy">{content.titulo}</h3>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{courseContentTypeLabels[content.tipo]}</p>
                  </div>
                </div>
                {content.texto ? <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{content.texto}</p> : null}
                {content.link ? <a className="mt-3 inline-flex text-sm font-bold text-brand-blue" href={content.link} rel="noreferrer" target="_blank">Abrir link</a> : null}
                {content.arquivo ? <a className="mt-3 inline-flex text-sm font-bold text-brand-blue" href={getAssetUrl(content.arquivo.url)} rel="noreferrer" target="_blank">Abrir arquivo</a> : null}
              </article>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
