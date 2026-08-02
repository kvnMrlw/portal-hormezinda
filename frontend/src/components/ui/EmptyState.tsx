import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

type EmptyStateProps = {
  action?: ReactNode;
  description: string;
  icon?: LucideIcon;
  title: string;
};

export function EmptyState({ action, description, icon: Icon = Inbox, title }: EmptyStateProps) {
  return (
    <section className="flex min-h-64 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-blue-200/70 bg-portal-surface p-8 text-center shadow-card ring-1 ring-white/80">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-blue-50 text-brand-blue shadow-sm ring-1 ring-blue-100">
        <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-brand-green ring-4 ring-white" />
        <Icon className="h-6 w-6" />
      </div>
      <h2 className="mt-5 text-xl font-semibold text-brand-navy">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </section>
  );
}
