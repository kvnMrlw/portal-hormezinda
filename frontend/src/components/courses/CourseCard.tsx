import { BookOpenCheck, Edit3, ExternalLink, Layers3, Trash2, UserRound } from 'lucide-react';

import { getAssetUrl } from '../../lib/assets';
import type { Course } from '../../types/courses';
import { CourseStatus, courseStatusLabels } from '../../types/courses';

type CourseCardProps = {
  canManage: boolean;
  course: Course;
  onDelete: (course: Course) => void;
  onEdit: (course: Course) => void;
  onOpen: (course: Course) => void;
};

export function CourseCard({ canManage, course, onDelete, onEdit, onOpen }: CourseCardProps) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-soft">
      <button className="block w-full text-left" onClick={() => onOpen(course)} type="button">
        <div className="relative aspect-[16/10] bg-slate-100">
          {course.capa ? (
            <img alt={course.capa.alt || course.titulo} className="h-full w-full object-cover" decoding="async" loading="lazy" src={getAssetUrl(course.capa.url)} />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-sky-50 via-white to-emerald-50">
              <BookOpenCheck className="h-16 w-16 text-brand-blue" />
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-brand-navy shadow-sm">
            {course.categoria}
          </span>
          {course.status !== CourseStatus.PUBLISHED ? (
            <span className="absolute right-3 top-3 rounded-full bg-slate-950/75 px-3 py-1 text-xs font-bold text-white">
              {courseStatusLabels[course.status]}
            </span>
          ) : null}
        </div>
        <div className="space-y-4 p-5">
          <div>
            <h2 className="line-clamp-2 text-xl font-semibold tracking-normal text-brand-navy">{course.titulo}</h2>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{course.descricao}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-brand-blue ring-1 ring-blue-100">
              <UserRound className="h-3.5 w-3.5" />
              {course.professor.nomeCompleto}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-100">
              <Layers3 className="h-3.5 w-3.5" />
              {course.quantidadeConteudos} conteudos
            </span>
          </div>
          <span className="inline-flex items-center gap-2 text-sm font-bold text-brand-blue">
            Abrir curso
            <ExternalLink className="h-4 w-4" />
          </span>
        </div>
      </button>

      {canManage ? (
        <div className="flex gap-2 border-t border-slate-100 p-4">
          <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-semibold text-brand-navy transition hover:bg-blue-50 hover:text-brand-blue" onClick={() => onEdit(course)} type="button">
            <Edit3 className="h-4 w-4" />
            Editar
          </button>
          <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50" onClick={() => onDelete(course)} type="button">
            <Trash2 className="h-4 w-4" />
            Excluir
          </button>
        </div>
      ) : null}
    </article>
  );
}
