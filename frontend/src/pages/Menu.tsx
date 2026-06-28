import { ChefHat, ImageIcon, Plus } from 'lucide-react';
import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

import { AppShell } from '../components/app/AppShell';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loading } from '../components/ui/Loading';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { useAuth } from '../contexts/useAuth';
import { getAssetUrl } from '../lib/assets';
import { isAdminRole } from '../lib/roles';
import { createMeal, deleteMeal, listMeals, updateMeal } from '../services/meals';
import type { Meal, MealPayload } from '../types/meals';
import { MealCategory, MealStatus, mealCategoryLabels } from '../types/meals';
import { Weekday, weekdayLabels, weekdays } from '../types/schedules';

const emptyPayload: MealPayload = {
  categoria: MealCategory.SNACK,
  descricao: '',
  diaSemana: Weekday.MONDAY,
  nome: '',
  status: MealStatus.PUBLISHED
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

export function Menu() {
  const { user } = useAuth();
  const isAdmin = isAdminRole(user?.cargo);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [payload, setPayload] = useState<MealPayload>(emptyPayload);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const mealsByDay = useMemo(
    () =>
      weekdays.reduce<Record<Weekday, Meal[]>>((groups, weekday) => {
        groups[weekday] = meals.filter((meal) => meal.diaSemana === weekday);
        return groups;
      }, {} as Record<Weekday, Meal[]>),
    [meals]
  );

  const loadMeals = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      setMeals(await listMeals());
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMeals();
  }, [loadMeals]);

  function openCreate(day = Weekday.MONDAY): void {
    setEditingMeal(null);
    setPayload({ ...emptyPayload, diaSemana: day });
    setIsModalOpen(true);
  }

  function openEdit(meal: Meal): void {
    setEditingMeal(meal);
    setPayload({
      categoria: meal.categoria,
      descricao: meal.descricao,
      diaSemana: meal.diaSemana,
      nome: meal.nome,
      status: meal.status
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    try {
      setIsSaving(true);
      setError('');

      if (editingMeal) {
        await updateMeal(editingMeal.id, payload);
      } else {
        await createMeal(payload);
      }

      setIsModalOpen(false);
      await loadMeals();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(meal: Meal): Promise<void> {
    if (!window.confirm(`Excluir "${meal.nome}"?`)) return;

    try {
      await deleteMeal(meal.id);
      setMeals((current) => current.filter((item) => item.id !== meal.id));
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
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                <ChefHat className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Semana escolar</p>
                <h1 className="mt-1 text-3xl font-semibold tracking-normal text-brand-navy sm:text-4xl">Cardapio</h1>
              </div>
            </div>
            {isAdmin ? (
              <Button onClick={() => openCreate()} type="button">
                <Plus className="h-4 w-4" />
                Novo cardapio
              </Button>
            ) : null}
          </div>
        </header>

        {error ? <div className="rounded-3xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div> : null}
        {isLoading ? <Loading className="min-h-64" /> : null}

        {!isLoading ? (
          <section className="grid gap-3 lg:grid-cols-5">
            {weekdays.map((weekday) => (
              <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm" key={weekday}>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-400">{weekdayLabels[weekday]}</h2>
                  {isAdmin ? (
                    <button className="rounded-full bg-slate-50 p-2 text-brand-blue transition hover:bg-blue-50" onClick={() => openCreate(weekday)} type="button">
                      <Plus className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
                <div className="mt-4 space-y-3">
                  {mealsByDay[weekday].length ? mealsByDay[weekday].map((meal) => (
                    <article className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50" key={meal.id}>
                      <div className="aspect-[4/3] bg-white">
                        {meal.imagem ? (
                          <img alt={meal.imagem.alt || meal.nome} className="h-full w-full object-cover" src={getAssetUrl(meal.imagem.url)} />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-300">
                            <ImageIcon className="h-10 w-10" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-bold text-emerald-700">{mealCategoryLabels[meal.categoria]}</p>
                        <h3 className="mt-1 text-base font-semibold text-brand-navy">{meal.nome}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">{meal.descricao}</p>
                        {isAdmin ? (
                          <div className="mt-3 flex gap-2 border-t border-slate-200 pt-3">
                            <button className="flex-1 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-brand-navy transition hover:text-brand-blue" onClick={() => openEdit(meal)} type="button">Editar</button>
                            <button className="flex-1 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50" onClick={() => void handleDelete(meal)} type="button">Excluir</button>
                          </div>
                        ) : null}
                      </div>
                    </article>
                  )) : (
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-500">
                      Sem cardapio disponivel.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>
        ) : null}
      </div>

      <Modal className="max-h-[92vh] max-w-2xl overflow-y-auto" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingMeal ? 'Editar cardapio' : 'Novo cardapio'}>
        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nome do lanche" name="nome" onChange={(event) => setPayload((current) => ({ ...current, nome: event.target.value }))} required value={payload.nome} />
            <Select label="Dia da semana" name="diaSemana" onChange={(event) => setPayload((current) => ({ ...current, diaSemana: event.target.value as Weekday }))} value={payload.diaSemana}>
              {weekdays.map((weekday) => <option key={weekday} value={weekday}>{weekdayLabels[weekday]}</option>)}
            </Select>
            <Select label="Tipo da refeicao" name="categoria" onChange={(event) => setPayload((current) => ({ ...current, categoria: event.target.value as MealCategory }))} value={payload.categoria}>
              {[MealCategory.SNACK, MealCategory.LUNCH, MealCategory.DINNER].map((category) => <option key={category} value={category}>{mealCategoryLabels[category]}</option>)}
            </Select>
            <label className="block">
              <span className="text-sm font-medium text-brand-navy">Foto</span>
              <input accept="image/png,image/jpeg,image/webp,image/gif" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" onChange={(event) => setPayload((current) => ({ ...current, imagem: event.target.files?.[0] }))} required={!editingMeal} type="file" />
            </label>
            <div className="sm:col-span-2">
              <Textarea label="Descricao" name="descricao" onChange={(event) => setPayload((current) => ({ ...current, descricao: event.target.value }))} required rows={4} value={payload.descricao} />
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
