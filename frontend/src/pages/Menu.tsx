import { CalendarDays, ChefHat, Plus, Search } from 'lucide-react';
import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

import { AppShell } from '../components/app/AppShell';
import { MealCard } from '../components/meals/MealCard';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { Loading } from '../components/ui/Loading';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { useAuth } from '../contexts/useAuth';
import { isAdminRole } from '../lib/roles';
import { createMeal, deleteMeal, listMeals, updateMeal } from '../services/meals';
import type { Meal, MealFilters, MealPayload } from '../types/meals';
import { MealCategory, MealStatus, mealCategoryLabels, mealStatusLabels } from '../types/meals';

type RangeMode = 'today' | 'tomorrow' | 'week' | 'month';

const emptyPayload: MealPayload = {
  alergenos: [],
  categoria: MealCategory.LUNCH,
  data: new Date().toISOString().slice(0, 10),
  descricao: '',
  ingredientes: [],
  nome: '',
  observacoes: '',
  semGluten: false,
  semLactose: false,
  status: MealStatus.DRAFT,
  vegano: false,
  vegetariano: false
};

function formatInputList(items: string[]): string {
  return items.join(', ');
}

function parseInputList(value: string): string[] {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function getRange(mode: RangeMode): Pick<MealFilters, 'dateFrom' | 'dateTo'> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);

  if (mode === 'tomorrow') {
    start.setDate(start.getDate() + 1);
    end.setDate(start.getDate());
  } else if (mode === 'week') {
    end.setDate(start.getDate() + 6);
  } else if (mode === 'month') {
    end.setMonth(start.getMonth() + 1);
  }

  end.setHours(23, 59, 59, 999);

  return {
    dateFrom: start.toISOString().slice(0, 10),
    dateTo: end.toISOString().slice(0, 10)
  };
}

export function Menu() {
  const { user } = useAuth();
  const isAdmin = isAdminRole(user?.cargo);
  const [rangeMode, setRangeMode] = useState<RangeMode>('week');
  const [filters, setFilters] = useState<MealFilters>(getRange('week'));
  const [meals, setMeals] = useState<Meal[]>([]);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [payload, setPayload] = useState<MealPayload>(emptyPayload);
  const [ingredientText, setIngredientText] = useState('');
  const [allergenText, setAllergenText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const visibleFilters = useMemo(() => ({ ...filters, ...getRange(rangeMode) }), [filters, rangeMode]);

  const loadMeals = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      setMeals(await listMeals(visibleFilters));
    } catch {
      setError('Nao foi possivel carregar o cardapio.');
    } finally {
      setIsLoading(false);
    }
  }, [visibleFilters]);

  useEffect(() => {
    void loadMeals();
  }, [loadMeals]);

  function openCreate(): void {
    setEditingMeal(null);
    setPayload(emptyPayload);
    setIngredientText('');
    setAllergenText('');
    setIsModalOpen(true);
  }

  function openEdit(meal: Meal): void {
    setEditingMeal(meal);
    setPayload({
      alergenos: meal.alergenos,
      calorias: meal.calorias ?? '',
      categoria: meal.categoria,
      data: meal.data.slice(0, 10),
      descricao: meal.descricao,
      ingredientes: meal.ingredientes,
      nome: meal.nome,
      observacoes: meal.observacoes ?? '',
      semGluten: meal.semGluten,
      semLactose: meal.semLactose,
      status: meal.status,
      vegano: meal.vegano,
      vegetariano: meal.vegetariano
    });
    setIngredientText(formatInputList(meal.ingredientes));
    setAllergenText(formatInputList(meal.alergenos));
    setIsModalOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    try {
      setIsSaving(true);
      const nextPayload = {
        ...payload,
        alergenos: parseInputList(allergenText),
        ingredientes: parseInputList(ingredientText)
      };

      if (editingMeal) {
        await updateMeal(editingMeal.id, nextPayload);
      } else {
        await createMeal(nextPayload);
      }

      setIsModalOpen(false);
      await loadMeals();
    } catch {
      setError('Nao foi possivel salvar a refeicao.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(meal: Meal): Promise<void> {
    if (!window.confirm(`Excluir "${meal.nome}"?`)) {
      return;
    }

    try {
      await deleteMeal(meal.id);
      setMeals((current) => current.filter((item) => item.id !== meal.id));
    } catch {
      setError('Nao foi possivel excluir a refeicao.');
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                <ChefHat className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Cardapio escolar</p>
                <h1 className="mt-1 text-3xl font-semibold tracking-normal text-brand-navy sm:text-4xl">Cardapio</h1>
              </div>
            </div>
            {isAdmin ? (
              <Button onClick={openCreate} type="button">
                <Plus className="h-4 w-4" />
                Nova refeicao
              </Button>
            ) : null}
          </div>
        </header>

        <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1fr_12rem_12rem]">
            <label className="block" htmlFor="meal-search">
              <span className="text-sm font-medium text-brand-navy">Busca</span>
              <div className="mt-2 flex items-center rounded-2xl border border-slate-200 px-4 focus-within:ring-4 focus-within:ring-blue-100">
                <Search className="h-4 w-4 text-slate-400" />
                <input className="h-11 w-full bg-transparent px-3 text-sm outline-none" id="meal-search" onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Nome, ingrediente..." value={filters.search ?? ''} />
              </div>
            </label>
            <Select label="Periodo" name="periodo" onChange={(event) => setRangeMode(event.target.value as RangeMode)} value={rangeMode}>
              <option value="today">Hoje</option>
              <option value="tomorrow">Amanha</option>
              <option value="week">Semana</option>
              <option value="month">Mes</option>
            </Select>
            <Select label="Categoria" name="categoria" onChange={(event) => setFilters((current) => ({ ...current, categoria: event.target.value as MealCategory | '' }))} value={filters.categoria ?? ''}>
              <option value="">Todas</option>
              {Object.values(MealCategory).map((category) => (
                <option key={category} value={category}>{mealCategoryLabels[category]}</option>
              ))}
            </Select>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ['vegetariano', 'Vegetariano'],
              ['vegano', 'Vegano'],
              ['semLactose', 'Sem lactose'],
              ['semGluten', 'Sem gluten']
            ].map(([key, label]) => (
              <label className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600 ring-1 ring-slate-100" key={key}>
                <input checked={Boolean(filters[key as keyof MealFilters])} className="h-4 w-4 accent-brand-blue" onChange={(event) => setFilters((current) => ({ ...current, [key]: event.target.checked || undefined }))} type="checkbox" />
                {label}
              </label>
            ))}
          </div>
        </section>

        {error ? <div className="rounded-3xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div> : null}
        {isLoading ? <Loading className="min-h-64" /> : null}
        {!isLoading && !meals.length ? <EmptyState description="Ajuste os filtros para encontrar outras refeicoes." icon={CalendarDays} title="Nenhuma refeicao encontrada." /> : null}
        {!isLoading && meals.length ? (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {meals.map((meal) => (
              <MealCard canManage={isAdmin} key={meal.id} meal={meal} onDelete={(item) => void handleDelete(item)} onEdit={openEdit} />
            ))}
          </section>
        ) : null}
      </div>

      <Modal className="max-h-[92vh] max-w-3xl overflow-y-auto" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingMeal ? 'Editar refeicao' : 'Nova refeicao'}>
        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nome da refeicao" name="nome" onChange={(event) => setPayload((current) => ({ ...current, nome: event.target.value }))} required value={payload.nome} />
            <Input label="Data" name="data" onChange={(event) => setPayload((current) => ({ ...current, data: event.target.value }))} required type="date" value={payload.data} />
            <Select label="Categoria" name="categoria" onChange={(event) => setPayload((current) => ({ ...current, categoria: event.target.value as MealCategory }))} value={payload.categoria}>
              {Object.values(MealCategory).map((category) => <option key={category} value={category}>{mealCategoryLabels[category]}</option>)}
            </Select>
            <Select label="Status" name="status" onChange={(event) => setPayload((current) => ({ ...current, status: event.target.value as MealStatus }))} value={payload.status}>
              {Object.values(MealStatus).map((status) => <option key={status} value={status}>{mealStatusLabels[status]}</option>)}
            </Select>
            <div className="sm:col-span-2">
              <Textarea label="Descricao" name="descricao" onChange={(event) => setPayload((current) => ({ ...current, descricao: event.target.value }))} required value={payload.descricao} />
            </div>
            <Input label="Ingredientes" name="ingredientes" onChange={(event) => setIngredientText(event.target.value)} placeholder="arroz, feijao, salada" value={ingredientText} />
            <Input label="Alergenos" name="alergenos" onChange={(event) => setAllergenText(event.target.value)} placeholder="leite, gluten" value={allergenText} />
            <Input label="Calorias" name="calorias" onChange={(event) => setPayload((current) => ({ ...current, calorias: event.target.value ? Number(event.target.value) : '' }))} type="number" value={payload.calorias ?? ''} />
            <label className="block">
              <span className="text-sm font-medium text-brand-navy">Imagem</span>
              <input accept="image/png,image/jpeg,image/webp,image/gif" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" onChange={(event) => setPayload((current) => ({ ...current, imagem: event.target.files?.[0] }))} required={!editingMeal} type="file" />
            </label>
            <div className="sm:col-span-2 grid gap-2 sm:grid-cols-4">
              {[
                ['vegetariano', 'Vegetariano'],
                ['vegano', 'Vegano'],
                ['semLactose', 'Sem lactose'],
                ['semGluten', 'Sem gluten']
              ].map(([key, label]) => (
                <label className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-600" key={key}>
                  <input checked={Boolean(payload[key as keyof MealPayload])} className="h-4 w-4 accent-brand-blue" onChange={(event) => setPayload((current) => ({ ...current, [key]: event.target.checked }))} type="checkbox" />
                  {label}
                </label>
              ))}
            </div>
            <div className="sm:col-span-2">
              <Textarea label="Observacoes" name="observacoes" onChange={(event) => setPayload((current) => ({ ...current, observacoes: event.target.value }))} value={payload.observacoes ?? ''} />
            </div>
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button disabled={isSaving} onClick={() => setIsModalOpen(false)} type="button" variant="secondary">Cancelar</Button>
            <Button disabled={isSaving} type="submit">{isSaving ? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
