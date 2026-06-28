import {
  BookOpen,
  Bus,
  CalendarDays,
  Megaphone,
  PenTool,
  ShieldCheck,
  Soup,
  Wrench
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { NoticeCategory, NoticePriority } from '../../types/notices';

export const categoryLabels: Record<NoticeCategory, string> = {
  [NoticeCategory.GERAL]: 'Geral',
  [NoticeCategory.PEDAGOGICO]: 'Pedagogico',
  [NoticeCategory.EVENTOS]: 'Eventos',
  [NoticeCategory.REFEITORIO]: 'Refeitorio',
  [NoticeCategory.BIBLIOTECA]: 'Biblioteca',
  [NoticeCategory.TRANSPORTE]: 'Transporte',
  [NoticeCategory.GREMIO]: 'Gremio',
  [NoticeCategory.MANUTENCAO]: 'Manutencao'
};

export const priorityLabels: Record<NoticePriority, string> = {
  [NoticePriority.URGENTE]: 'Urgente',
  [NoticePriority.IMPORTANTE]: 'Importante',
  [NoticePriority.INFORMATIVO]: 'Informativo'
};

export const categoryIcons: Record<NoticeCategory, LucideIcon> = {
  [NoticeCategory.GERAL]: Megaphone,
  [NoticeCategory.PEDAGOGICO]: PenTool,
  [NoticeCategory.EVENTOS]: CalendarDays,
  [NoticeCategory.REFEITORIO]: Soup,
  [NoticeCategory.BIBLIOTECA]: BookOpen,
  [NoticeCategory.TRANSPORTE]: Bus,
  [NoticeCategory.GREMIO]: ShieldCheck,
  [NoticeCategory.MANUTENCAO]: Wrench
};

export const priorityStyles: Record<NoticePriority, string> = {
  [NoticePriority.URGENTE]: 'bg-red-50 text-red-700 ring-red-100',
  [NoticePriority.IMPORTANTE]: 'bg-orange-50 text-orange-700 ring-orange-100',
  [NoticePriority.INFORMATIVO]: 'bg-blue-50 text-blue-700 ring-blue-100'
};

export const categoryOptions = Object.values(NoticeCategory);
export const priorityOptions = Object.values(NoticePriority);
