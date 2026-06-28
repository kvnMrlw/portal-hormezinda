import { Edit3, Flame, Leaf, Trash2, WheatOff } from 'lucide-react';

import { getAssetUrl } from '../../lib/assets';
import type { Meal } from '../../types/meals';
import { MealStatus, mealCategoryLabels, mealStatusLabels } from '../../types/meals';

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
        ) : null}
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-brand-navy shadow-sm">
          {mealCategoryLabels[meal.categoria]}
        </div>
        {meal.status !== MealStatus.PUBLISHED ? (
          <div className="absolute right-3 top-3 rounded-full bg-slate-900/75 px-3 py-1 text-xs font-bold text-white">
            {mealStatusLabels[meal.status]}
          </div>
        ) : null}
      </div>
      <div className="space-y-4 p-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
            {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(meal.data))}
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-normal text-brand-navy">{meal.nome}</h2>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{meal.descricao}</p>
        </div>
        {meal.ingredientes.length ? (
          <p className="line-clamp-2 text-sm font-medium text-slate-600">{meal.ingredientes.join(', ')}</p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {meal.vegetariano ? <Tag icon={Leaf} label="Vegetariano" /> : null}
          {meal.vegano ? <Tag icon={Leaf} label="Vegano" /> : null}
          {meal.semLactose ? <Tag label="Sem lactose" /> : null}
          {meal.semGluten ? <Tag icon={WheatOff} label="Sem gluten" /> : null}
          {meal.calorias ? <Tag icon={Flame} label={`${meal.calorias} kcal`} /> : null}
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

function Tag({ icon: Icon, label }: { icon?: typeof Leaf; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {label}
    </span>
  );
}
