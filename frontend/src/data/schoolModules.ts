import {
  CalendarDays,
  GraduationCap,
  Lightbulb,
  Megaphone,
  Utensils
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type SchoolModule = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accent: string;
};

export const schoolModules: SchoolModule[] = [
  {
    title: 'Cardapio da Semana',
    description: 'Refeicoes planejadas para os proximos dias.',
    href: '/cardapio',
    icon: Utensils,
    accent: 'bg-emerald-50 text-emerald-600 ring-emerald-100'
  },
  {
    title: 'Horarios',
    description: 'Organizacao das aulas e atividades da escola.',
    href: '/horarios',
    icon: CalendarDays,
    accent: 'bg-blue-50 text-brand-blue ring-blue-100'
  },
  {
    title: 'Avisos',
    description: 'Comunicados importantes em destaque.',
    href: '/avisos',
    icon: Megaphone,
    accent: 'bg-amber-50 text-amber-600 ring-amber-100'
  },
  {
    title: 'Ideias',
    description: 'Espaco para propostas da comunidade escolar.',
    href: '/ideias',
    icon: Lightbulb,
    accent: 'bg-violet-50 text-violet-600 ring-violet-100'
  },
  {
    title: 'Cursos',
    description: 'Trilhas e oportunidades recomendadas.',
    href: '/cursos',
    icon: GraduationCap,
    accent: 'bg-rose-50 text-rose-600 ring-rose-100'
  }
];
