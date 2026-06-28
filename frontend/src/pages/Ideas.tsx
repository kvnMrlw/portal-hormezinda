import {
  Archive,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Edit3,
  Flag,
  ImagePlus,
  Lightbulb,
  MessageSquareText,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsUp,
  Trash2,
  XCircle
} from 'lucide-react';
import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

import { AppShell } from '../components/app/AppShell';
import { PostFooter } from '../components/feed/PostFooter';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { Loading } from '../components/ui/Loading';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { Skeleton } from '../components/ui/Skeleton';
import { Textarea } from '../components/ui/Textarea';
import { useAuth } from '../contexts/useAuth';
import { getAssetUrl } from '../lib/assets';
import { getDisplayRoleLabel, isAdminRole } from '../lib/roles';
import { cn } from '../lib/utils';
import { createIdea, deleteIdea, listIdeas, reactToIdea, toggleIdeaSupport, updateIdea, updateIdeaAdmin } from '../services/ideas';
import type { ReactionEmoji } from '../types/feed';
import {
  IdeaCategory,
  IdeaStatus,
  ideaCategoryLabels,
  ideaStatusLabels,
  type Idea,
  type IdeaPayload
} from '../types/ideas';

type IdeaFormState = IdeaPayload & {
  imagem?: File;
};

const emptyForm: IdeaFormState = {
  categoria: IdeaCategory.OTHER,
  descricao: '',
  titulo: ''
};

const statusStyles: Record<IdeaStatus, { className: string; icon: typeof Clock3 }> = {
  [IdeaStatus.REVIEW]: { className: 'bg-amber-50 text-amber-700 ring-amber-100', icon: Clock3 },
  [IdeaStatus.PLANNED]: { className: 'bg-blue-50 text-brand-blue ring-blue-100', icon: Rocket },
  [IdeaStatus.IN_PROGRESS]: { className: 'bg-violet-50 text-violet-700 ring-violet-100', icon: Sparkles },
  [IdeaStatus.DONE]: { className: 'bg-emerald-50 text-emerald-700 ring-emerald-100', icon: CheckCircle2 },
  [IdeaStatus.REJECTED]: { className: 'bg-red-50 text-red-700 ring-red-100', icon: XCircle },
  [IdeaStatus.ARCHIVED]: { className: 'bg-slate-100 text-slate-600 ring-slate-200', icon: Archive }
};

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;

    if (response?.data?.message) return response.data.message;
  }

  return 'Nao foi possivel concluir a solicitacao.';
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short'
  }).format(new Date(value));
}

export function Ideas() {
  const { user } = useAuth();
  const isAdmin = isAdminRole(user?.cargo);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [form, setForm] = useState<IdeaFormState>(emptyForm);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<IdeaStatus | ''>('');
  const [category, setCategory] = useState<IdeaCategory | ''>('');
  const [sort, setSort] = useState<'recentes' | 'apoiadas'>('recentes');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [adminDrafts, setAdminDrafts] = useState<Record<string, { respostaOficial: string; status: IdeaStatus; destaque: boolean }>>({});

  const totalSupports = useMemo(() => ideas.reduce((total, idea) => total + idea.quantidadeApoios, 0), [ideas]);

  const loadIdeas = useCallback(async () => {
    try {
      setError('');
      setIsLoading(true);
      const response = await listIdeas({ categoria: category, page: 1, search, sort, status });
      setIdeas(response.ideias);
      setAdminDrafts(
        response.ideias.reduce<Record<string, { respostaOficial: string; status: IdeaStatus; destaque: boolean }>>((drafts, idea) => {
          drafts[idea.id] = {
            destaque: idea.destaque,
            respostaOficial: idea.respostaOficial?.texto ?? '',
            status: idea.status
          };

          return drafts;
        }, {})
      );
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [category, search, sort, status]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadIdeas(), 250);

    return () => window.clearTimeout(timeout);
  }, [loadIdeas]);

  function openCreate(): void {
    setEditingIdea(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  function openEdit(idea: Idea): void {
    setEditingIdea(idea);
    setForm({
      categoria: idea.categoria,
      descricao: idea.descricao,
      titulo: idea.titulo
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    try {
      setIsSaving(true);
      setError('');

      if (editingIdea) {
        const updatedIdea = await updateIdea(editingIdea.id, form);
        setIdeas((current) => current.map((idea) => (idea.id === updatedIdea.id ? updatedIdea : idea)));
      } else {
        const createdIdea = await createIdea(form);
        setIdeas((current) => [createdIdea, ...current]);
      }

      setIsModalOpen(false);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSupport(idea: Idea): Promise<void> {
    setIdeas((current) =>
      current.map((item) =>
        item.id === idea.id
          ? {
              ...item,
              apoiadaPeloUsuario: !item.apoiadaPeloUsuario,
              quantidadeApoios: item.quantidadeApoios + (item.apoiadaPeloUsuario ? -1 : 1)
            }
          : item
      )
    );

    try {
      const updatedIdea = await toggleIdeaSupport(idea.id);
      setIdeas((current) => current.map((item) => (item.id === updatedIdea.id ? updatedIdea : item)));
    } catch (supportError) {
      setError(getErrorMessage(supportError));
      await loadIdeas();
    }
  }

  async function handleReact(idea: Idea, emoji: ReactionEmoji): Promise<void> {
    try {
      const updatedIdea = await reactToIdea(idea.id, emoji);
      setIdeas((current) => current.map((item) => (item.id === updatedIdea.id ? updatedIdea : item)));
    } catch (reactionError) {
      setError(getErrorMessage(reactionError));
    }
  }

  async function handleDelete(idea: Idea): Promise<void> {
    if (!window.confirm(`Excluir "${idea.titulo}"?`)) return;

    try {
      await deleteIdea(idea.id);
      setIdeas((current) => current.filter((item) => item.id !== idea.id));
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    }
  }

  async function handleAdminUpdate(idea: Idea): Promise<void> {
    const draft = adminDrafts[idea.id];

    if (!draft) return;

    try {
      const updatedIdea = await updateIdeaAdmin(idea.id, draft);
      setIdeas((current) => current.map((item) => (item.id === updatedIdea.id ? updatedIdea : item)));
    } catch (adminError) {
      setError(getErrorMessage(adminError));
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
          <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-yellow-50 text-yellow-600 ring-1 ring-yellow-100">
                <Lightbulb className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Comunidade escolar</p>
                <h1 className="mt-1 text-3xl font-semibold tracking-normal text-brand-navy sm:text-4xl">Ideias</h1>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">{ideas.length} ideias</span>
                  <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-brand-blue">{totalSupports} apoios</span>
                </div>
              </div>
            </div>
            <Button className="w-full sm:w-auto" onClick={openCreate} type="button">
              <Lightbulb className="h-4 w-4" />
              Nova Ideia
            </Button>
          </div>
        </header>

        <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1fr_12rem_13rem_12rem]">
            <label className="block" htmlFor="idea-search">
              <span className="text-sm font-medium text-brand-navy">Pesquisa</span>
              <div className="mt-2 flex items-center rounded-2xl border border-slate-200 px-4 focus-within:ring-4 focus-within:ring-blue-100">
                <Search className="h-4 w-4 text-slate-400" />
                <input className="h-11 w-full bg-transparent px-3 text-sm font-medium outline-none" id="idea-search" onChange={(event) => setSearch(event.target.value)} placeholder="Titulo, autor, categoria..." value={search} />
              </div>
            </label>
            <Select label="Filtro" name="status" onChange={(event) => setStatus(event.target.value as IdeaStatus | '')} value={status}>
              <option value="">Todos</option>
              {Object.values(IdeaStatus).map((item) => (
                <option key={item} value={item}>{ideaStatusLabels[item]}</option>
              ))}
            </Select>
            <Select label="Categoria" name="categoria" onChange={(event) => setCategory(event.target.value as IdeaCategory | '')} value={category}>
              <option value="">Todas</option>
              {Object.values(IdeaCategory).map((item) => (
                <option key={item} value={item}>{ideaCategoryLabels[item]}</option>
              ))}
            </Select>
            <Select label="Ordenar" name="sort" onChange={(event) => setSort(event.target.value as 'recentes' | 'apoiadas')} value={sort}>
              <option value="recentes">Mais recentes</option>
              <option value="apoiadas">Mais apoiadas</option>
            </Select>
          </div>
        </section>

        {error ? <div className="rounded-3xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div> : null}
        {isLoading ? <IdeaSkeleton /> : null}
        {!isLoading && !ideas.length ? <EmptyState description="Compartilhe a primeira proposta da comunidade." icon={Lightbulb} title="Nenhuma ideia encontrada." /> : null}
        {!isLoading && ideas.length ? (
          <section className="grid gap-4 xl:grid-cols-2">
            {ideas.map((idea) => (
              <IdeaCard
                adminDraft={adminDrafts[idea.id]}
                canManage={isAdmin || idea.autor.id === user?.id}
                idea={idea}
                isAdmin={isAdmin}
                key={idea.id}
                onAdminDraftChange={(draft) => setAdminDrafts((current) => ({ ...current, [idea.id]: { ...current[idea.id], ...draft } }))}
                onAdminUpdate={() => void handleAdminUpdate(idea)}
                onDelete={() => void handleDelete(idea)}
                onEdit={() => openEdit(idea)}
                onReact={(emoji) => void handleReact(idea, emoji)}
                onSupport={() => void handleSupport(idea)}
              />
            ))}
          </section>
        ) : null}
      </div>

      <Modal className="max-h-[92vh] max-w-2xl overflow-y-auto" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingIdea ? 'Editar ideia' : 'Nova ideia'}>
        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <Input label="Titulo" maxLength={120} name="titulo" onChange={(event) => setForm((current) => ({ ...current, titulo: event.target.value }))} required value={form.titulo} />
          <Textarea label="Descricao" maxLength={2000} name="descricao" onChange={(event) => setForm((current) => ({ ...current, descricao: event.target.value }))} required rows={5} value={form.descricao} />
          <Select label="Categoria" name="categoria" onChange={(event) => setForm((current) => ({ ...current, categoria: event.target.value as IdeaCategory }))} value={form.categoria}>
            {Object.values(IdeaCategory).map((item) => (
              <option key={item} value={item}>{ideaCategoryLabels[item]}</option>
            ))}
          </Select>
          <label className="block rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-brand-blue hover:bg-blue-50/40">
            <ImagePlus className="mx-auto h-7 w-7 text-brand-blue" />
            <span className="mt-2 block text-sm font-semibold text-brand-navy">{form.imagem?.name ?? 'Selecionar imagem'}</span>
            <span className="mt-1 block text-xs text-slate-500">PNG, JPG, JPEG ou WEBP</span>
            <input accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => setForm((current) => ({ ...current, imagem: event.target.files?.[0] }))} type="file" />
          </label>
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Button disabled={isSaving} onClick={() => setIsModalOpen(false)} type="button" variant="secondary">Cancelar</Button>
            <Button disabled={isSaving} type="submit">{isSaving ? 'Salvando...' : 'Salvar ideia'}</Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}

function IdeaSkeleton() {
  return (
    <section className="grid gap-4 xl:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm" key={index}>
          <div className="flex gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
          <Skeleton className="mt-5 h-8 w-2/3" />
          <Skeleton className="mt-3 h-20 w-full" />
        </div>
      ))}
    </section>
  );
}

type IdeaCardProps = {
  adminDraft?: { destaque: boolean; respostaOficial: string; status: IdeaStatus };
  canManage: boolean;
  idea: Idea;
  isAdmin: boolean;
  onAdminDraftChange: (draft: Partial<{ destaque: boolean; respostaOficial: string; status: IdeaStatus }>) => void;
  onAdminUpdate: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onReact: (emoji: ReactionEmoji) => void;
  onSupport: () => void;
};

function IdeaCard({ adminDraft, canManage, idea, isAdmin, onAdminDraftChange, onAdminUpdate, onDelete, onEdit, onReact, onSupport }: IdeaCardProps) {
  const status = statusStyles[idea.status];
  const StatusIcon = status.icon;

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-soft">
      {idea.autor.bannerPerfil ? <div className="h-24 bg-slate-100 bg-cover bg-center" style={{ backgroundImage: `url(${getAssetUrl(idea.autor.bannerPerfil)})` }} /> : null}
      <div className="space-y-5 p-5 sm:p-6">
        <header className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={idea.autor.nomeCompleto} src={getAssetUrl(idea.autor.fotoPerfil)} />
            <div className="min-w-0">
              <p className="truncate font-semibold text-brand-navy">{idea.autor.nomeCompleto}</p>
              <p className="text-xs font-semibold text-slate-500">{getDisplayRoleLabel(idea.autor)} - {formatDate(idea.criadaEm)}</p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap justify-end gap-2">
            {idea.destaque ? <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-1 text-xs font-bold text-yellow-700 ring-1 ring-yellow-100"><Star className="h-3.5 w-3.5" />Destaque</span> : null}
            <span className={cn('inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ring-1', status.className)}>
              <StatusIcon className="h-3.5 w-3.5" />
              {ideaStatusLabels[idea.status]}
            </span>
          </div>
        </header>

        <div>
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{ideaCategoryLabels[idea.categoria]}</span>
          <h2 className="mt-3 text-2xl font-semibold tracking-normal text-brand-navy">{idea.titulo}</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{idea.descricao}</p>
        </div>

        {idea.imagem ? <img alt={idea.imagem.alt || idea.titulo} className="max-h-[34rem] w-full rounded-3xl object-cover ring-1 ring-slate-100" decoding="async" loading="lazy" src={getAssetUrl(idea.imagem.url)} /> : null}

        {idea.respostaOficial ? (
          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-brand-blue">
              <ShieldCheck className="h-4 w-4" />
              Resposta oficial
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-700">{idea.respostaOficial.texto}</p>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={onSupport} type="button" variant={idea.apoiadaPeloUsuario ? 'primary' : 'secondary'}>
            <ThumbsUp className="h-4 w-4" />
            {idea.apoiadaPeloUsuario ? 'Apoiando' : 'Apoiar'} ({idea.quantidadeApoios})
          </Button>
          <span className="inline-flex h-10 items-center rounded-full bg-slate-50 px-3 text-sm font-semibold text-slate-600">
            {idea.quantidadeReacoes} reacoes
          </span>
          {canManage ? (
            <>
              <Button className="px-3" onClick={onEdit} type="button" variant="secondary"><Edit3 className="h-4 w-4" /></Button>
              <Button className="px-3 text-red-600 hover:bg-red-50" onClick={onDelete} type="button" variant="secondary"><Trash2 className="h-4 w-4" /></Button>
            </>
          ) : null}
        </div>

        <PostFooter isReacting={false} myReaction={idea.minhaReacao} onReact={onReact} reactions={idea.reacoes} />

        {isAdmin && adminDraft ? (
          <div className="grid gap-3 rounded-3xl border border-slate-100 bg-slate-50 p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Select label="Status" name={`status-${idea.id}`} onChange={(event) => onAdminDraftChange({ status: event.target.value as IdeaStatus })} value={adminDraft.status}>
                {Object.values(IdeaStatus).map((item) => (
                  <option key={item} value={item}>{ideaStatusLabels[item]}</option>
                ))}
              </Select>
              <label className="mt-7 flex h-11 items-center gap-2 rounded-2xl bg-white px-4 text-sm font-semibold text-brand-navy ring-1 ring-slate-100">
                <input checked={adminDraft.destaque} className="h-4 w-4 accent-brand-blue" onChange={(event) => onAdminDraftChange({ destaque: event.target.checked })} type="checkbox" />
                Destaque
              </label>
            </div>
            <Textarea label="Resposta oficial" name={`response-${idea.id}`} onChange={(event) => onAdminDraftChange({ respostaOficial: event.target.value })} rows={3} value={adminDraft.respostaOficial} />
            <Button className="w-full sm:w-fit" onClick={onAdminUpdate} type="button">
              <MessageSquareText className="h-4 w-4" />
              Atualizar administracao
            </Button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
