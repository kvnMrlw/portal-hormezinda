import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

import { AppShell } from '../components/app/AppShell';
import { Card } from '../components/ui/Card';
import type { SchoolModule } from '../data/schoolModules';
import { cn } from '../lib/utils';

type ModulePlaceholderProps = {
  module: SchoolModule;
};

export function ModulePlaceholder({ module }: ModulePlaceholderProps) {
  const Icon = module.icon;

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-5">
        <Link
          className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-brand-navy focus:outline-none focus:ring-4 focus:ring-blue-100"
          to="/home"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <Card className="overflow-hidden p-0 shadow-sm">
          <div className="p-6 sm:p-8">
            <div className={cn('flex h-14 w-14 items-center justify-center rounded-3xl ring-1', module.accent)}>
              <Icon className="h-7 w-7" />
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-normal text-brand-navy sm:text-4xl">{module.title}</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">{module.description}</p>
          </div>
          <div className="border-t border-slate-100 bg-slate-50 p-6 sm:p-8">
            <p className="text-sm font-semibold text-brand-navy">Conteudo em preparacao</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Esta area ja esta conectada ao portal e recebera novidades nas proximas etapas.
            </p>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
