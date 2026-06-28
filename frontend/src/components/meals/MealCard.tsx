import { Edit3, ImageIcon, Trash2 } from 'lucide-react';

import { getAssetUrl } from '../../lib/assets';
import type { Meal } from '../../types/meals';
import { mealCategoryLabels } from '../../types/meals';
import { weekdayLabels } from '../../types/schedules';

type MealCardProps = {
  canManage: boolean;
  meal: Meal;
  onDelete: (meal: Meal) => void;
  onEdit: (meal: Meal) => void;
};

export function MealCard({ canManage, meal, onDelete, onEdit }: MealCardProps) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-soft">
      <div className="relative aspect-[4/3] bg-slate-100">
        {meal.imagem ? (
          <img alt={meal.imagem.alt || meal.nome} className="h-full w-full object-cover" decoding="async" loading="lazy" src={getAssetUrl(meal.imagem.url)} />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300">
            <ImageIcon className="h-10 w-10" />
          </div>
        )}
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-brand-navy shadow-sm">
          {mealCategoryLabels[meal.categoria]}
        </div>
      </div>
      <div className="space-y-4 p-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
            {meal.data ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(meal.data)) : weekdayLabels[meal.diaSemana]}
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-normal text-brand-navy">{meal.nome}</h2>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{meal.descricao}</p>
        </div>
        {canManage ? (
          <div className="flex gap-2 border-t border-slate-100 pt-4">
            <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-semibold text-brand-navy transition hover:bg-blue-50 hover:text-brand-blue" onClick={() => onEdit(meal)} type="button">
              <Edit3 className="h-4 w-4" />
              Editar
            </button>
            <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50" onClick={() => onDelete(meal)} type="button">
              <Trash2 className="h-4 w-4" />
              Excluir
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
