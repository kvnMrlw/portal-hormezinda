import { AlertCircle, Image, Inbox, PenLine } from 'lucide-react';

import { Avatar } from '../ui/Avatar';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { Skeleton } from '../ui/Skeleton';

type FeedState = 'loading' | 'empty' | 'error';

const feedState: FeedState = 'empty';
const storyItems = ['Escola', 'Turma', 'Projetos', 'Eventos', 'Gremio'];

function StoriesSkeleton() {
  return (
    <Card className="overflow-hidden p-0 shadow-sm">
      <div className="flex gap-4 overflow-x-auto p-4 sm:p-5">
        {storyItems.map((item) => (
          <div className="flex min-w-20 flex-col items-center gap-2" key={item}>
            <Skeleton className="h-16 w-16 rounded-full ring-4 ring-blue-50" />
            <span className="text-xs font-semibold text-slate-500">{item}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function FeedComposerPreview() {
  return (
    <Card className="p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10" name="Portal Hormezinda" />
        <div className="flex min-h-11 flex-1 items-center rounded-2xl bg-slate-50 px-4 text-sm text-slate-400">
          Compartilhe momentos da escola
        </div>
        <div className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-brand-blue sm:flex">
          <PenLine className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

function FeedLoadingState() {
  return (
    <Card className="space-y-5 p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-48 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-11/12" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </Card>
  );
}

function FeedErrorState() {
  return (
    <Card className="border-red-100 bg-red-50/80 p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-red-600">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold text-brand-navy">Nao foi possivel carregar as publicacoes.</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Tente novamente em alguns instantes.</p>
        </div>
      </div>
    </Card>
  );
}

function FeedEmptyState() {
  return (
    <EmptyState
      description="Quando a escola publicar novidades, comunicados e momentos importantes, tudo aparecera aqui."
      icon={Image}
      title="Nenhuma publicacao disponivel no momento."
    />
  );
}

export function HomeFeed() {
  return (
    <section className="space-y-4" aria-label="Publicacoes da escola">
      <StoriesSkeleton />
      <FeedComposerPreview />
      {feedState === 'loading' ? <FeedLoadingState /> : null}
      {feedState === 'error' ? <FeedErrorState /> : null}
      {feedState === 'empty' ? <FeedEmptyState /> : null}
      <Card className="p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-500">
            <Inbox className="h-5 w-5" />
          </div>
          <p className="text-sm leading-6 text-slate-500">
            Este espaco esta pronto para receber publicacoes, fotos e comunicados da comunidade escolar.
          </p>
        </div>
      </Card>
    </section>
  );
}
