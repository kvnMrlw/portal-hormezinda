import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { schoolModules } from '../../data/schoolModules';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

export function SchoolPanel() {
  return (
    <aside className="space-y-4" aria-label="Painel da escola">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-brand-navy">Painel da Escola</h2>
          <p className="mt-1 text-sm text-slate-500">Acesse as principais areas do portal.</p>
        </div>
        <Badge variant="info">Hub</Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {schoolModules.map((module) => {
          const Icon = module.icon;

          return (
            <Card className="group overflow-hidden p-0 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-soft" key={module.href}>
              <Link
                aria-label={`Abrir ${module.title}`}
                className="flex h-full items-center gap-4 p-4 outline-none transition focus-visible:ring-4 focus-visible:ring-blue-100"
                to={module.href}
              >
                <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1', module.accent)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-brand-navy">{module.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">{module.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition duration-300 group-hover:translate-x-1 group-hover:text-brand-blue" />
              </Link>
            </Card>
          );
        })}
      </div>
    </aside>
  );
}
