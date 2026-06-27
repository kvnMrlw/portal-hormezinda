import { Pin, Sparkles } from 'lucide-react';

import { AppShell } from '../components/app/AppShell';
import { ModuleHeader } from '../components/app/ModuleHeader';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';

export function PlatformHome() {
  return (
    <AppShell>
      <div className="space-y-8">
        <ModuleHeader
          description="Um espaco preparado para acompanhar publicacoes, comunicados e momentos da comunidade escolar."
          eyebrow="Inicio"
          title="Sua comunidade escolar em um so lugar."
        />

        <section className="grid gap-4 overflow-hidden lg:grid-cols-[1fr_21rem]">
          <div className="space-y-5">
            <Card className="overflow-hidden p-0">
              <div className="flex gap-4 overflow-x-auto p-5">
                {['Escola', 'Turma', 'Projetos', 'Eventos', 'Gremio'].map((item) => (
                  <div className="flex min-w-24 flex-col items-center gap-2" key={item}>
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 via-white to-blue-200 p-1">
                      <div className="h-full w-full rounded-full border-2 border-white bg-blue-50" />
                    </div>
                    <span className="text-xs font-semibold text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
            </Card>

            <EmptyState description="As publicacoes da escola aparecerao aqui assim que o modulo for ativado." title="Nenhuma publicacao disponivel." />
          </div>

          <aside className="space-y-5">
            <Card>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-brand-blue">
                  <Pin className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-brand-navy">Posts fixados</h2>
                  <p className="text-sm text-slate-500">Area preparada</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-brand-navy">Sugestoes</h2>
                  <p className="mt-1 text-sm text-slate-500">Conexoes futuras</p>
                </div>
                <Badge variant="info">Em breve</Badge>
              </div>
              <div className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <Sparkles className="h-5 w-5 text-brand-blue" />
                <p className="text-sm text-slate-600">Novidades da escola serao destacadas neste espaco.</p>
              </div>
            </Card>
          </aside>
        </section>
      </div>
    </AppShell>
  );
}
