import { BookOpenCheck, CalendarClock, ChefHat, Megaphone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Card } from '../ui/Card';

type SummaryItem = {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  accent: string;
};

const summaryItems: SummaryItem[] = [
  {
    title: 'Proxima aula',
    value: 'Em breve',
    description: 'Sua agenda aparecera aqui.',
    icon: CalendarClock,
    accent: 'bg-blue-50 text-brand-blue',
  },
  {
    title: 'Cardapio de hoje',
    value: 'Disponivel logo',
    description: 'Refeicoes serao exibidas neste espaco.',
    icon: ChefHat,
    accent: 'bg-emerald-50 text-emerald-600',
  },
  {
    title: 'Avisos novos',
    value: 'Nenhum aviso',
    description: 'Comunicados importantes ficam em destaque.',
    icon: Megaphone,
    accent: 'bg-amber-50 text-amber-600',
  },
  {
    title: 'Cursos recomendados',
    value: 'Em preparacao',
    description: 'Sugestoes de aprendizagem virao para ca.',
    icon: BookOpenCheck,
    accent: 'bg-violet-50 text-violet-600',
  },
];

export function SummaryCards() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumo da escola">
      {summaryItems.map((item) => {
        const Icon = item.icon;

        return (
          <Card
            className="group relative overflow-hidden p-5 transition duration-300 hover:-translate-y-1 hover:shadow-hover"
            key={item.title}
          >
            <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-white" />
            <div className="flex items-start gap-3">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1 ring-white/80 ${item.accent}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-normal text-slate-400">
                  {item.title}
                </p>
                <h2 className="mt-1 text-base font-semibold text-brand-navy">{item.value}</h2>
                <p className="mt-1 text-sm leading-5 text-slate-500">{item.description}</p>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100 shadow-inner">
                  <div className="h-full w-2/3 rounded-full bg-brand-blue opacity-80" />
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </section>
  );
}
