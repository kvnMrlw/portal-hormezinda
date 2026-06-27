import { Sparkles } from 'lucide-react';

import { useAuth } from '../../contexts/useAuth';
import { Badge } from '../ui/Badge';

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Bom dia';
  }

  if (hour < 18) {
    return 'Boa tarde';
  }

  return 'Boa noite';
}

function getFirstName(name?: string): string {
  return name?.trim().split(/\s+/)[0] ?? 'estudante';
}

export function HomeHeader() {
  const { user } = useAuth();

  return (
    <header className="flex flex-col gap-4 rounded-[2rem] bg-white/80 p-5 shadow-sm ring-1 ring-white sm:p-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <Badge className="gap-2 bg-blue-50 text-brand-blue" variant="info">
          <Sparkles className="h-3.5 w-3.5" />
          Portal Hormezinda
        </Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-normal text-brand-navy sm:text-4xl">
          {getGreeting()}, {getFirstName(user?.nomeCompleto)} <span aria-hidden="true">👋</span>
        </h1>
        <p className="mt-2 text-base text-slate-500">Bem-vindo ao Portal Hormezinda.</p>
      </div>
      <div className="rounded-3xl bg-slate-50 p-4 shadow-inner sm:min-w-72">
        <p className="text-sm font-semibold text-brand-navy">Sua escola, sempre por perto.</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Acompanhe novidades, aulas e comunicados em um unico lugar.
        </p>
      </div>
    </header>
  );
}
